import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import Event from "../models/event.model.js";
import ApiResponse from "../utils/apiResponse.js";
import Organizer from "../models/organizer.model.js";
import ApiFeature from "../utils/apiFeature.js";
import {getCache,setCache,deleteCachePattern,} from "../utils/cache.helper.js";
import { CacheKeys } from "../utils/cache.keys.js";
import { CACHE_TTL } from "../constants/cache.constants.js";
const createEvent = asyncHandler(async (req, res) => {
    const {
        organizer,
        title,
        description,
        venue,
        city,
        eventDate,
        startTime,
        endTime,
        capacity,
    } = req.body;
    if (
        !organizer ||
        !title ||
        !description ||
        !venue ||
        !city ||
        !eventDate ||
        !startTime ||
        !endTime ||
        !capacity
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const organizerExists = await Organizer.findOne({
        _id: organizer,
        owner: req.user._id,
    });

    if (!organizerExists) {
        throw new ApiError(404, "Organizer not found");
    }
    const event = await Event.create({
        organizer,
        title,
        description,
        venue,
        city,
        eventDate,
        startTime,
        endTime,
        capacity,
    });
    // Clear relevant cache patterns
    await Promise.all([
        deleteCachePattern(CacheKeys.myEventsPattern(req.user._id.toString())),
        deleteCachePattern(
            CacheKeys.organizerDashboardPattern(req.user._id.toString())
        ),
        deleteCachePattern(CacheKeys.publishedEventsPattern()),
    ]);
    return res
        .status(201)
        .json(new ApiResponse(201, event, "Event created successfully"));
});

const getMyEvents = asyncHandler(async (req, res) => {
    // Get organizers owned by the logged-in user
    const organizers = await Organizer.find({
        owner: req.user._id,
    }).select("_id");

    const organizerIds = organizers.map((org) => org._id);

    // No organizer → return immediately
    if (organizerIds.length === 0) {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    events: [],
                    pagination: {
                        total: 0,
                        page: Number(req.query.page) || 1,
                        limit: Number(req.query.limit) || 10,
                        totalPages: 0,
                        hasNextPage: false,
                        hasPrevPage: false,
                    },
                },
                "No events found"
            )
        );
    }

    // Cache Key
    const cacheKey = CacheKeys.myEvents(req.user._id, req.query);

    // Check Redis
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    cachedData,
                    "Events fetched successfully (Redis Cache)"
                )
            );
    }

    // Base Query
    const baseQuery = {
        organizer: { $in: organizerIds },
    };

    // Apply API Features
    const features = new ApiFeature(
        Event.find(baseQuery).populate("organizer"),
        req.query
    )
        .filter()
        .search(["title", "venue", "city"])
        .sort()
        .paginate();

    // Merge filters
    const filterQuery = {
        ...baseQuery,
        ...features.getFilterQuery(),
    };

    // Count matching documents
    const total = await Event.countDocuments(filterQuery);

    // Fetch events
    const events = await features.query;

    // Pagination
    const pagination = features.getPagination(total);

    const responseData = {
        events,
        pagination,
    };

    // Save response to Redis
    await setCache(cacheKey, responseData, CACHE_TTL.MEDIUM);

    return res
        .status(200)
        .json(
            new ApiResponse(200, responseData, "Events fetched successfully")
        );
});

const getEventById = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const cacheKey = CacheKeys.event(eventId);

    const cachedData = await getCache(cacheKey);

    if (cachedData) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    cachedData,
                    "Event fetched successfully (Redis Cache)"
                )
            );
    }
    const event = await Event.findById(eventId).populate("organizer");

    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    const organizer = await Organizer.findOne({
        _id: event.organizer._id,
        owner: req.user._id,
    });

    if (!organizer) {
        throw new ApiError(403, "You are not authorized to view this event");
    }
    await setCache(cacheKey, event, CACHE_TTL.MEDIUM);
    return res
        .status(200)
        .json(new ApiResponse(200, event, "Event fetched successfully"));
});

const updateEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const {
        title,
        description,
        venue,
        city,
        eventDate,
        startTime,
        endTime,
        capacity,
        status,
    } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    const organizer = await Organizer.findOne({
        _id: event.organizer,
        owner: req.user._id,
    });

    if (!organizer) {
        throw new ApiError(403, "You are not authorized to update this event");
    }

    if (capacity !== undefined && capacity < event.ticketsSold) {
        throw new ApiError(400, "Capacity cannot be less than tickets sold");
    }

    event.title = title ?? event.title;
    event.description = description ?? event.description;
    event.venue = venue ?? event.venue;
    event.city = city ?? event.city;
    event.eventDate = eventDate ?? event.eventDate;
    event.startTime = startTime ?? event.startTime;
    event.endTime = endTime ?? event.endTime;
    event.capacity = capacity ?? event.capacity;
    event.status = status ?? event.status;

    const updatedEvent = await event.save();
    // Invalidate cache
    await Promise.all([
        deleteCachePattern(CacheKeys.eventPattern(event._id.toString())),
        deleteCachePattern(CacheKeys.myEventsPattern(req.user._id.toString())),
        deleteCachePattern(
            CacheKeys.organizerDashboardPattern(req.user._id.toString())
        ),
        deleteCachePattern(CacheKeys.publishedEventsPattern()),
    ]);
    return res
        .status(200)
        .json(new ApiResponse(200, updatedEvent, "Event updated successfully"));
});

const deleteEvent = asyncHandler(async (req, res) => {
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
        throw new ApiError(403, "You are not authorized to delete this event");
    }

    await event.deleteOne();

    // Invalidate cache
    await Promise.all([
        deleteCachePattern(CacheKeys.eventPattern(event._id.toString())),
        deleteCachePattern(CacheKeys.myEventsPattern(req.user._id.toString())),
        deleteCachePattern(
            CacheKeys.organizerDashboardPattern(req.user._id.toString())
        ),
        deleteCachePattern(CacheKeys.publishedEventsPattern()),
    ]);
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Event deleted successfully"));
});

const publishEvent = asyncHandler(async (req, res) => {
    // Get the eventId from the request parameters
    const { eventId } = req.params;
    // Find the event by its ID
    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found");
    }
    // Check if the user is the owner of the organizer associated with the event
    const organizer = await Organizer.findOne({
        _id: event.organizer,
        owner: req.user._id,
    });
    if (!organizer) {
        throw new ApiError(403, "You are not authorized to publish this event");
    }

    event.isPublished = true;
    const updatedEvent = await event.save();
    // Invalidate cache for relevant keys
    await Promise.all([
        deleteCachePattern(CacheKeys.eventPattern(event._id.toString())),
        deleteCachePattern(CacheKeys.myEventsPattern(req.user._id.toString())),
        deleteCachePattern(
            CacheKeys.organizerDashboardPattern(req.user._id.toString())
        ),
        deleteCachePattern(CacheKeys.publishedEventsPattern()),
    ]);
    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedEvent, "Event published successfully")
        );
});

const unpublishEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    // Find the event by its ID
    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found");
    }
    //identify the organizer
    const organizer = await Organizer.findOne({
        _id: event.organizer,
        owner: req.user._id,
    });
    if (!organizer) {
        throw new ApiError(
            403,
            "You are not authorized to unpublish this event"
        );
    }
    event.isPublished = false;
    const updatedEvent = await event.save();
    // Invalidate cache for relevant keys
    await Promise.all([
        deleteCachePattern(CacheKeys.eventPattern(event._id.toString())),
        deleteCachePattern(CacheKeys.myEventsPattern(req.user._id.toString())),
        deleteCachePattern(CacheKeys.organizerDashboardPattern(req.user._id.toString())),
        deleteCachePattern(CacheKeys.publishedEventsPattern()),
    ]);
    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedEvent, "Event unpublished successfully")
        );
});

const getPublishedEvents = asyncHandler(async (req, res) => {
    // Redis Cache Key
    const cacheKey = CacheKeys.publishedEvents(req.query);

    // Check Redis
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    cachedData,
                    "Published events fetched successfully (Redis Cache)"
                )
            );
    }

    // Base Query
    const baseQuery = {
        isPublished: true,
    };

    // Apply API Features
    const features = new ApiFeature(
        Event.find(baseQuery).populate("organizer"),
        req.query
    )
        .filter()
        .search(["title", "description", "venue", "city"])
        .sort()
        .paginate();

    // Merge Filters
    const filterQuery = {
        ...baseQuery,
        ...features.getFilterQuery(),
    };

    // Total Documents
    const total = await Event.countDocuments(filterQuery);

    // Fetch Events
    const events = await features.query;

    // Pagination
    const pagination = features.getPagination(total);

    // Response
    const responseData = {
        events,
        pagination,
    };

    // Save Cache
    await setCache(cacheKey, responseData, CACHE_TTL.MEDIUM);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                responseData,
                "Published events fetched successfully"
            )
        );
});

export {
    createEvent,
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    publishEvent,
    unpublishEvent,
    getPublishedEvents,
};
