import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import Event from "../models/event.model.js";
import ApiResponse from "../utils/apiResponse.js";
import TicketType from "../models/ticket_type.model.js";
import Order from "../models/order.model.js";
import { OrderStatus } from "../models/order.model.js";

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

export { createOrder };