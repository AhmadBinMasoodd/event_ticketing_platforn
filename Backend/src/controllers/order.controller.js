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
    if(!orderId) {
        throw new ApiError(400, "Order ID is required");
    }
    const order = await Order.findById(orderId);
    if(!order) {
        throw new ApiError(404, "Order not found");
    }
    const event = await Event.findById(order.eventId);
    if(!event) {
        throw new ApiError(404, "Event not found");
    }
    const organizer = await Organizer.findOne({
        _id: event.organizer,
        owner: req.user._id,
    });


    if (!organizer) {
        throw new ApiError(403, "You are not authorized to approve this order");
    }
    const ticketType = await TicketType.findById(order.ticketTypeId);
    if(!ticketType) {
        throw new ApiError(404, "Ticket type not found");
    }
    const availableTickets = ticketType.quantity - ticketType.sold;
    if (availableTickets < order.quantity) {
        throw new ApiError(400, "Not enough tickets available to approve this order");
    }

    if(order.status !== OrderStatus.PENDING) {
        throw new ApiError(400, "Only pending orders can be approved");
    }

    ticketType.sold += order.quantity;
    await ticketType.save();
    event.ticketsSold += order.quantity;
    await event.save();

    const tickets=[]
    for (let i = 0; i < order.quantity; i++) {
        tickets.push({
            ticketType: ticketType._id,
            user: order.userId,
            order:order._id,
            event:event._id,
            purchasePrice:ticketType.price,
            qrCode: `TKY-${crypto.randomUUID()}`
        });
    }
    await Ticket.insertMany(tickets);
    order.status = OrderStatus.PAID;
    order.paidAt = new Date();
    await order.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            order,
            "Order approved successfully"
        )
    );
});
const getPendingOrders = asyncHandler(async (req, res) => {

})
export { createOrder, approveOrder, getPendingOrders };