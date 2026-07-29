import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

import Organizer from "../models/organizer.model.js";
import Event from "../models/event.model.js";
import Ticket, { TicketStatus } from "../models/ticket.model.js";
import Order, { OrderStatus } from "../models/order.model.js";

import { getCache, setCache } from "../utils/cache.helper.js";
import { CacheKeys } from "../utils/cache.keys.js";
import { CACHE_TTL } from "../config/constants.js";

const organizerDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Cache Key
    const cacheKey = CacheKeys.organizerDashboard(userId);

    // Check Redis
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
        return res.status(200).json(
            new ApiResponse(
                200,
                cachedData,
                "Organizer dashboard fetched successfully (Redis Cache)"
            )
        );
    }

    // Verify Organizer
    const organizer = await Organizer.findOne({
        owner: userId,
    });

    if (!organizer) {
        throw new ApiError(404, "Organizer profile not found");
    }

    // Get Organizer Events
    const events = await Event.find({
        organizer: organizer._id,
    }).select("_id");

    const eventIds = events.map((event) => event._id);

    // No Events
    if (eventIds.length === 0) {
        const responseData = {
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
        };

        await setCache(
            cacheKey,
            responseData,
            CACHE_TTL.MEDIUM
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                responseData,
                "Dashboard fetched successfully"
            )
        );
    }

    const today = new Date();

    // Execute all queries in parallel
    const [
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
        paidOrdersList,
    ] = await Promise.all([
        Event.countDocuments({
            organizer: organizer._id,
        }),

        Event.countDocuments({
            organizer: organizer._id,
            isPublished: true,
        }),

        Event.countDocuments({
            organizer: organizer._id,
            isPublished: false,
        }),

        Event.countDocuments({
            organizer: organizer._id,
            eventDate: { $gt: today },
        }),

        Event.countDocuments({
            organizer: organizer._id,
            eventDate: { $lt: today },
        }),

        Ticket.countDocuments({
            event: { $in: eventIds },
        }),

        Ticket.countDocuments({
            event: { $in: eventIds },
            status: TicketStatus.ACTIVE,
        }),

        Ticket.countDocuments({
            event: { $in: eventIds },
            status: TicketStatus.USED,
        }),

        Ticket.countDocuments({
            event: { $in: eventIds },
            status: TicketStatus.CANCELLED,
        }),

        Order.countDocuments({
            eventId: { $in: eventIds },
            status: OrderStatus.PENDING,
        }),

        Order.countDocuments({
            eventId: { $in: eventIds },
            status: OrderStatus.PAID,
        }),

        Order.find({
            eventId: { $in: eventIds },
            status: OrderStatus.PAID,
        }).select("amount"),
    ]);

    // Calculate Revenue
    const totalRevenue = paidOrdersList.reduce(
        (sum, order) => sum + order.amount,
        0
    );

    const responseData = {
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
    };

    // Cache Dashboard
    await setCache(
        cacheKey,
        responseData,
        CACHE_TTL.MEDIUM
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            responseData,
            "Organizer dashboard fetched successfully"
        )
    );
});

export { organizerDashboard };