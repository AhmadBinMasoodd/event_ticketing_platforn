import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import Event from "../models/event.model.js";
import ApiResponse from "../utils/apiResponse.js";

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

export { createEvent, getMyEvents, getEventById, updateEvent, deleteEvent };
