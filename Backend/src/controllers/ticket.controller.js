import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import Event from "../models/event.model.js";
import ApiResponse from "../utils/apiResponse.js";
import Organizer from "../models/organizer.model.js";
import Ticket from "../models/ticket.model.js";
import { TicketStatus } from "../models/ticket.model.js";
import ApiFeature from "../utils/apiFeature.js";

import {
    getCache,
    setCache,
    deleteCachePattern,
} from "../utils/cache.helper.js";

import { CacheKeys } from "../utils/cache.keys.js";
import { CACHE_TTL } from "../constants/cache.constants.js";

// GET CUSTOMER TICKETS
const getMyTickets = asyncHandler(async (req, res) => {
    const cacheKey = CacheKeys.myTickets(req.user._id, req.query);
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    cachedData,
                    "Tickets retrieved successfully (Redis Cache)"
                )
            );
    }

    const baseQuery = {
        user: req.user._id,
    };

    const features = new ApiFeature(
        Ticket.find(baseQuery)
            .populate("event", "title eventDate venue city")
            .populate("ticketType", "name price")
            .populate("order", "status paidAt"),
        req.query
    )
        .filter()
        .sort()
        .paginate();
    const filterQuery = {
        ...features.getFilterQuery(),
        ...baseQuery,
    };

    const total = await Ticket.countDocuments(filterQuery);
    const tickets = await features.query;
    const responseData = {
        tickets,

        pagination: features.getPagination(total),
    };
    await setCache(cacheKey, responseData, CACHE_TTL.MEDIUM);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                responseData,
                tickets.length
                    ? "Tickets retrieved successfully"
                    : "No tickets found"
            )
        );
});

// GET SINGLE TICKET
const getTicketById = asyncHandler(async (req, res) => {
    const { ticketId } = req.params;

    const cacheKey = CacheKeys.ticket(ticketId);
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    cachedData,
                    "Ticket retrieved successfully (Redis Cache)"
                )
            );
    }
    const ticket = await Ticket.findOne({
        _id: ticketId,
        user: req.user._id,
    })
        .populate("event", "title eventDate venue city")
        .populate("ticketType", "name price")
        .populate("order", "status paidAt");
    if (!ticket) {
        throw new ApiError(404, "Ticket not found");
    }

    await setCache(cacheKey, ticket, CACHE_TTL.MEDIUM);
    return res
        .status(200)
        .json(new ApiResponse(200, ticket, "Ticket retrieved successfully"));
});

// ORGANIZER EVENT TICKETS
const getEventTickets = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found");
    }
    const organizer = await Organizer.findOne({
        _id: event.organizer,
        owner: req.user._id,
    });
    if (!organizer) {
        throw new ApiError(403, "You are not authorized");
    }
    const cacheKey = CacheKeys.eventTickets(eventId, req.query);
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    cachedData,
                    "Event tickets retrieved successfully (Redis Cache)"
                )
            );
    }

    const baseQuery = {
        event: eventId,
    };
    const features = new ApiFeature(
        Ticket.find(baseQuery)
            .populate("user", "name email phone")
            .populate("ticketType", "name price")
            .populate("order", "status paidAt paymentMethod"),
        req.query
    )
        .filter()
        .sort()
        .paginate();
    const filterQuery = {
        ...features.getFilterQuery(),
        ...baseQuery,
    };

    const total = await Ticket.countDocuments(filterQuery);

    const tickets = await features.query;

    const responseData = {
        tickets,

        pagination: features.getPagination(total),
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

            tickets.length
                ? "Tickets retrieved successfully"
                : "No tickets found"
        )
    );
});
const scanTicket = asyncHandler(async (req, res) => {
    const { qrCode } = req.params;
    const ticket = await Ticket.findOne({
        qrCode,
    });
    if (!ticket) {
        throw new ApiError(404, "Ticket not found");
    }
    if (ticket.status !== TicketStatus.ACTIVE) {
        throw new ApiError(400, `Ticket is ${ticket.status}`);
    }
    const event = await Event.findById(ticket.event);
    if (!event) {
        throw new ApiError(404, "Event not found");
    }
    const organizer = await Organizer.findOne({
        _id: event.organizer,
        owner: req.user._id,
    });

    if (!organizer) {
        throw new ApiError(403, "Unauthorized");
    }

    ticket.status = TicketStatus.USED;
    ticket.scannedAt = new Date();
    ticket.scannedBy = req.user._id;

    await ticket.save();

    // CACHE INVALIDATION
    await deleteCachePattern(`ticket:${ticket._id}*`);

    await deleteCachePattern(`my-tickets:${ticket.user}:*`);
    await deleteCachePattern(`event-tickets:${ticket.event}:*`);
    return res
        .status(200)
        .json(new ApiResponse(200, ticket, "Ticket scanned successfully"));
});
export { getMyTickets, getTicketById, getEventTickets, scanTicket };
