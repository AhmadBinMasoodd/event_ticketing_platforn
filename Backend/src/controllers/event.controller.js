import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import Event from "../models/event.model.js";
import ApiResponse from "../utils/apiResponse.js";
import Organizer from "../models/organizer.model.js";


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
    return res
        .status(201)
        .json(new ApiResponse(201, event, "Event created successfully"));
});

const getMyEvents = asyncHandler(async (req, res) => {
    const organizers = await Organizer.find({
        owner: req.user._id,
    }).select("_id");

    const organizerIds = organizers.map((org) => org._id);

    const events = await Event.find({
        organizer: { $in: organizerIds },
    }).populate("organizer");

    return res
        .status(200)
        .json(new ApiResponse(200, events, "Events fetched successfully"));
});

const getEventById = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

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

    return res
        .status(200)
        .json(new ApiResponse(200, updatedEvent, "Event published successfully"));
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
        throw new ApiError(403, "You are not authorized to unpublish this event");
    }
    event.isPublished = false;
    const updatedEvent = await event.save();

    return res
        .status(200)
        .json(new ApiResponse(200, updatedEvent, "Event unpublished successfully"));
});

const getPublishedEvents = asyncHandler(async (req, res) => {
    // Read query parameters
    const {
        search = "",
        city,
        status,
        sort = "eventDate",
        order = "asc",
        page = 1,
        limit = 10,
    } = req.query;

    // Build dynamic query
    const query = {
        isPublished: true,
    };

    // Search by title or description
    if (search) {
        query.$or = [
            {
                title: {
                    $regex: search,
                    $options: "i",
                },
            },
            {
                description: {
                    $regex: search,
                    $options: "i",
                },
            },
        ];
    }

    // Filter by city
    if (city) {
        query.city = city;
    }

    // Filter by status
    if (status) {
        query.status = status;
    }

    // Pagination
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Sorting
    const sortQuery = {
        [sort]: order === "desc" ? -1 : 1,
    };

    // Fetch events
    const events = await Event.find(query)
        .populate("organizer")
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNumber);

    // Total documents matching filters
    const totalEvents = await Event.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                events,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalEvents / limitNumber),
                totalEvents,
                limit: limitNumber,
            },
            "Published events fetched successfully"
        )
    );
});
export { createEvent, getMyEvents, getEventById, updateEvent, deleteEvent, publishEvent, unpublishEvent, getPublishedEvents};
