import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import Event from "../models/event.model.js";
import ApiResponse from "../utils/apiResponse.js";
import TicketType from "../models/ticket_type.model.js";
import Order from "../models/order.model.js";
import { OrderStatus } from "../models/order.model.js";
import Ticket from "../models/ticket.model.js";
import Organizer from "../models/organizer.model.js";
import crypto from "crypto";
import ApiFeature from "../utils/apiFeature.js";
import { getCache, setCache, deleteCachePattern } from "../utils/cache.helper.js";
import { CacheKeys } from "../utils/cache.keys.js";
import { CACHE_TTL } from "../constants/cache.constants.js";
const createOrder = asyncHandler(async (req, res) => {
    const {
        eventId,
        ticketTypeId,
        quantity,
        paymentMethod,
    } = req.body;

    // Validate required fields
    if (!eventId || !ticketTypeId || !quantity || !paymentMethod) {
        throw new ApiError(400, "All fields are required");
    }

    // Validate quantity
    if (quantity <= 0) {
        throw new ApiError(400, "Quantity must be greater than 0");
    }

    // Check event
    const event = await Event.findById(eventId);

    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    if (!event.isPublished) {
        throw new ApiError(400, "Event is not published");
    }

    // Check ticket type
    const ticketType = await TicketType.findById(ticketTypeId);

    if (!ticketType) {
        throw new ApiError(404, "Ticket type not found");
    }

    // Ticket belongs to event
    if (ticketType.event.toString() !== eventId) {
        throw new ApiError(
            400,
            "Ticket type does not belong to this event"
        );
    }

    // Ticket is active
    if (!ticketType.isActive) {
        throw new ApiError(400, "Ticket type is inactive");
    }

    // Check sale dates
    const now = new Date();

    if (now < ticketType.saleStart) {
        throw new ApiError(400, "Ticket sale has not started yet");
    }

    if (now > ticketType.saleEnd) {
        throw new ApiError(400, "Ticket sale has ended");
    }

    // Check availability
    const availableTickets = ticketType.quantity - ticketType.sold;

    if (availableTickets < quantity) {
        throw new ApiError(400, "Not enough tickets available");
    }

    // Prevent duplicate pending order
    const existingOrder = await Order.findOne({
        userId: req.user._id,
        eventId,
        ticketTypeId,
        status: "pending",
    });

    if (existingOrder) {
        throw new ApiError(
            409,
            "You already have a pending order for this ticket type"
        );
    }

    // Calculate amount
    const amount = ticketType.price * quantity;

    // Create order
    const order = await Order.create({
        userId: req.user._id,
        eventId,
        ticketTypeId,
        quantity,
        amount,
        paymentMethod,
    });
    await deleteCachePattern(
        `dashboard:customer:${req.user._id}`
    );

    await deleteCachePattern(
        `dashboard:organizer:*`
    );

    await deleteCachePattern(
        `orders:*`
    );
    return res.status(201).json(
        new ApiResponse(
            201,
            order,
            "Order created successfully. Please complete your payment and wait for organizer approval."
        )
    );
});

const approveOrder = asyncHandler(async (req, res) => {

    const { orderId } = req.params;

    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }


    const order = await Order.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }


    const event = await Event.findById(order.eventId);

    if (!event) {
        throw new ApiError(404, "Event not found");
    }


    const organizer = await Organizer.findOne({
        _id: event.organizer,
        owner: req.user._id,
    });


    if (!organizer) {
        throw new ApiError(
            403,
            "You are not authorized to approve this order"
        );
    }


    const ticketType = await TicketType.findById(
        order.ticketTypeId
    );


    if (!ticketType) {
        throw new ApiError(
            404,
            "Ticket type not found"
        );
    }


    const availableTickets =
        ticketType.quantity - ticketType.sold;


    if (availableTickets < order.quantity) {
        throw new ApiError(
            400,
            "Not enough tickets available"
        );
    }


    if (order.status !== OrderStatus.PENDING) {
        throw new ApiError(
            400,
            "Only pending orders can be approved"
        );
    }



    // Update ticket quantity

    ticketType.sold += order.quantity;

    await ticketType.save();



    // Update event sales

    event.ticketsSold += order.quantity;

    await event.save();



    // Generate tickets

    const tickets = [];


    for (
        let i = 0;
        i < order.quantity;
        i++
    ) {

        tickets.push({

            ticketType: ticketType._id,

            user: order.userId,

            order: order._id,

            event: event._id,

            purchasePrice: ticketType.price,

            qrCode:
            `TKY-${crypto.randomUUID()}`

        });

    }


    await Ticket.insertMany(tickets);



    // Update order

    order.status = OrderStatus.PAID;

    order.paidAt = new Date();

    await order.save();



    /*
        REDIS INVALIDATION
    */


    // Customer tickets cache
    await deleteCachePattern(
        `my-tickets:${order.userId}:*`
    );


    // Customer dashboard cache
    await deleteCachePattern(
        `dashboard:customer:${order.userId}`
    );


    // Organizer dashboard cache
    await deleteCachePattern(
        `dashboard:organizer:${req.user._id}`
    );


    // Organizer orders cache
    await deleteCachePattern(
        `orders:${req.user._id}:*`
    );



    return res.status(200).json(

        new ApiResponse(
            200,
            order,
            "Order approved successfully"
        )

    );

});

const getOrders = asyncHandler(async (req, res) => {
    const { status } = req.query;
   
    // Validate status (if provided)
    if (
        status &&
        !Object.values(OrderStatus).includes(status)
    ) {
        throw new ApiError(400, "Invalid order status");
    }

    // Verify organizer
    const organizer = await Organizer.findOne({
        owner: req.user._id,
    });

    if (!organizer) {
        throw new ApiError(
            403,
            "You are not authorized to view orders"
        );
    }

     const cachedKey=CacheKeys.orders(
        req.user._id,
        req.query
    )
    const cachedData = await getCache(cachedKey);

    if (cachedData) {
        return res.status(200).json(
            new ApiResponse(
                200,
                cachedData,
                "Orders retrieved successfully (Redis Cache)"
            )
        );
    }
    // Get organizer event IDs
    const eventIds = await Event.find({
        organizer: organizer._id,
    }).distinct("_id");

    if (eventIds.length === 0) {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    orders: [],
                    pagination: {
                        total: 0,
                        page: 1,
                        limit: 10,
                        totalPages: 0,
                        hasNextPage: false,
                        hasPrevPage: false,
                    },
                },
                "You have not created any events yet"
            )
        );
    }

    // Base query
    const baseQuery = {
        eventId: { $in: eventIds },
    };

    if (status) {
        baseQuery.status = status;
    }

    // Apply API Features
    const features = new ApiFeature(
        Order.find(baseQuery)
            .populate("userId", "name email phone")
            .populate("eventId", "title eventDate venue city")
            .populate("ticketTypeId", "name price"),
        req.query
    )
        .filter()
        .search([])
        .sort()
        .paginate();

    // Query for counting documents
    const filterQuery = {
        ...features.getFilterQuery(),
        ...baseQuery,
    };

    const total = await Order.countDocuments(filterQuery);

    const orders = await features.query;

    const pagination = features.getPagination(total);

    // Cache the response
    const responseData = {
        orders,
        pagination,
    };
    await setCache(
        cachedKey,
        responseData,
        CACHE_TTL.MEDIUM
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            responseData,
            "Orders retrieved successfully"
        )
    );
});

export { createOrder, approveOrder, getOrders };