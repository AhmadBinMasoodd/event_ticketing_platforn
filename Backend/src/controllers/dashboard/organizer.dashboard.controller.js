import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

import Organizer from "../models/organizer.model.js";
import Event from "../models/event.model.js";
import Ticket, { TicketStatus } from "../models/ticket.model.js";
import Order, { OrderStatus } from "../models/order.model.js";

const organizerDashboard = asyncHandler(async (req, res) => {
    // Find organizer profile
    const organizer = await Organizer.findOne({
        owner: req.user._id,
    });

    if (!organizer) {
        throw new ApiError(404, "Organizer profile not found");
    }

    // Fetch organizer events once
    const events = await Event.find({
        organizer: organizer._id,
    }).select("_id");

    const eventIds = events.map((event) => event._id);

    // If organizer has no events
    if (eventIds.length === 0) {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    totalEvents: 0,
                    publishedEvents: 0,
                    unpublishedEvents: 0,
                    upcomingEvents: 0,
                    pastEvents: 0,
                    soldTickets: 0,
                    activeTickets: 0,
                    usedTickets: 0,
                    cancelledTickets: 0,
                    pendingOrders: 0,
                    paidOrders: 0,
                    totalRevenue: 0,
                },
                "Dashboard fetched successfully"
            )
        );
    }

    // Event Statistics
    const totalEvents = await Event.countDocuments({
        organizer: organizer._id,
    });

    const publishedEvents = await Event.countDocuments({
        organizer: organizer._id,
        isPublished: true,
    });

    const unpublishedEvents = await Event.countDocuments({
        organizer: organizer._id,
        isPublished: false,
    });

    const upcomingEvents = await Event.countDocuments({
        organizer: organizer._id,
        eventDate: { $gt: new Date() },
    });

    const pastEvents = await Event.countDocuments({
        organizer: organizer._id,
        eventDate: { $lt: new Date() },
    });

    // Ticket Statistics
    const soldTickets = await Ticket.countDocuments({
        event: { $in: eventIds },
    });

    const activeTickets = await Ticket.countDocuments({
        event: { $in: eventIds },
        status: TicketStatus.ACTIVE,
    });

    const usedTickets = await Ticket.countDocuments({
        event: { $in: eventIds },
        status: TicketStatus.USED,
    });

    const cancelledTickets = await Ticket.countDocuments({
        event: { $in: eventIds },
        status: TicketStatus.CANCELLED,
    });

    // Order Statistics
    const pendingOrders = await Order.countDocuments({
        eventId: { $in: eventIds },
        status: OrderStatus.PENDING,
    });

    const paidOrders = await Order.countDocuments({
        eventId: { $in: eventIds },
        status: OrderStatus.PAID,
    });

    // Revenue
    const paidOrdersData = await Order.find({
        eventId: { $in: eventIds },
        status: OrderStatus.PAID,
    }).select("amount");

    const totalRevenue = paidOrdersData.reduce(
        (sum, order) => sum + order.amount,
        0
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalEvents,
                publishedEvents,
                unpublishedEvents,
                upcomingEvents,
                pastEvents,

                soldTickets,
                activeTickets,
                usedTickets,
                cancelledTickets,

                pendingOrders,
                paidOrders,

                totalRevenue,
            },
            "Organizer dashboard fetched successfully"
        )
    );
});

export { organizerDashboard };