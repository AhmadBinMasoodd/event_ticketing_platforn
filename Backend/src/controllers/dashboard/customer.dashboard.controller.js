import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

import Ticket from "../models/ticket.model.js";
import Order, { OrderStatus } from "../models/order.model.js";

const getCustomerDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Total Tickets
    const ticketCount = await Ticket.countDocuments({
        user: userId,
    });

    // Orders
    const pendingOrdersCount = await Order.countDocuments({
        userId,
        status: OrderStatus.PENDING,
    });

    const paidOrdersCount = await Order.countDocuments({
        userId,
        status: OrderStatus.PAID,
    });

    const cancelledOrdersCount = await Order.countDocuments({
        userId,
        status: OrderStatus.CANCELLED,
    });

    // Total Money Spent
    const paidOrders = await Order.find({
        userId,
        status: OrderStatus.PAID,
    }).select("amount");

    const totalSpent = paidOrders.reduce(
        (sum, order) => sum + order.amount,
        0
    );

    // Customer's Events
    const tickets = await Ticket.find({
        user: userId,
    }).populate("event", "eventDate");

    const today = new Date();

    let upcomingEventsCount = 0;
    let pastEventsCount = 0;

    // Prevent duplicate events
    const upcoming = new Set();
    const past = new Set();

    tickets.forEach((ticket) => {
        if (!ticket.event) return;

        if (ticket.event.eventDate > today) {
            upcoming.add(ticket.event._id.toString());
        } else {
            past.add(ticket.event._id.toString());
        }
    });

    upcomingEventsCount = upcoming.size;
    pastEventsCount = past.size;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ticketCount,
                upcomingEventsCount,
                pastEventsCount,
                pendingOrdersCount,
                paidOrdersCount,
                cancelledOrdersCount,
                totalSpent,
            },
            "Customer dashboard fetched successfully"
        )
    );
});

export { getCustomerDashboard };