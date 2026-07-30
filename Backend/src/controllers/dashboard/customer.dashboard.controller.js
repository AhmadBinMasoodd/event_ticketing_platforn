import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";

import Ticket from "../../models/ticket.model.js";
import Order, { OrderStatus } from "../../models/order.model.js";

import { getCache, setCache } from "../../utils/cache.helper.js";
import { CacheKeys } from "../../utils/cache.keys.js";
import { CACHE_TTL } from "../../constants/cache.constants.js";

const getCustomerDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Redis Cache Key
    const cacheKey = CacheKeys.customerDashboard(userId);

    // Check Redis
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
        return res.status(200).json(
            new ApiResponse(
                200,
                cachedData,
                "Customer dashboard fetched successfully (Redis Cache)"
            )
        );
    }

    // Execute all independent queries in parallel
    const [
        ticketCount,
        pendingOrdersCount,
        paidOrdersCount,
        cancelledOrdersCount,
        paidOrders,
        tickets,
    ] = await Promise.all([
        Ticket.countDocuments({
            user: userId,
        }),

        Order.countDocuments({
            userId,
            status: OrderStatus.PENDING,
        }),

        Order.countDocuments({
            userId,
            status: OrderStatus.PAID,
        }),

        Order.countDocuments({
            userId,
            status: OrderStatus.CANCELLED,
        }),

        Order.find({
            userId,
            status: OrderStatus.PAID,
        }).select("amount"),

        Ticket.find({
            user: userId,
        }).populate("event", "eventDate"),
    ]);

    // Calculate Total Spent
    const totalSpent = paidOrders.reduce(
        (sum, order) => sum + order.amount,
        0
    );

    const today = new Date();

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

    const responseData = {
        ticketCount,
        upcomingEventsCount: upcoming.size,
        pastEventsCount: past.size,
        pendingOrdersCount,
        paidOrdersCount,
        cancelledOrdersCount,
        totalSpent,
    };

    // Save to Redis
    await setCache(
        cacheKey,
        responseData,
        CACHE_TTL.MEDIUM
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            responseData,
            "Customer dashboard fetched successfully"
        )
    );
});

export { getCustomerDashboard };