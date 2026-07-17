import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import Event from "../models/event.model.js";
import ApiResponse from "../utils/apiResponse.js";
import Organizer from "../models/organizer.model.js";
import TicketType from "../models/ticket_type.model.js";

const createTicketType = asyncHandler(async (req, res) => {
    const { event, name, description, price, quantity, saleEnd } = req.body;
    if(!event || !name || !price || !quantity || !saleEnd) {
        throw new ApiError(400, "All fields are required");
    }
    const eventExists = await Event.findById(event);
    if(!eventExists) {
        throw new ApiError(404, "Event not found");
    }
    const organizer=await Organizer.findOne({
        _id: eventExists.organizer,
        owner: req.user._id,
    });
    if(!organizer) {
        throw new ApiError(403, "You are not the owner of this event");
    }
    const exisitngTicketType=await TicketType.findOne({ event, name });
    if(exisitngTicketType) {
        throw new ApiError(409, "Ticket type with this name already exists for this event");
    }
    const ticketType = await TicketType.create({
        event,
        name,
        description,
        price,
        quantity,
        saleEnd,
    });
    return res
    .status(201)
    .json(
        new ApiResponse(201, ticketType, "Ticket type created successfully")
    );
})

const getEventTicketTypes = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const eventExists = await Event.findById(eventId);
    if(!eventExists) {
        throw new ApiError(404, "Event not found");
    }
    const organizer=await Organizer.findOne({
        _id: eventExists.organizer,
        owner: req.user._id,
    });
    if(!organizer) {
        throw new ApiError(403, "You are not the owner of this event");
    }
    const ticketTypes = await TicketType.find({ event: eventId });
    if(ticketTypes.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No ticket types found for this event"));
    }
    return res
    .status(200).
    json(
        new ApiResponse(200, ticketTypes, "Ticket types fetched successfully")
    );
});

const getTicketTypeById = asyncHandler(async (req, res) => {
    const { ticketTypeId } = req.params;

    const ticketType = await TicketType.findById(ticketTypeId).populate("event");

    if (!ticketType) {
        throw new ApiError(404, "Ticket type not found");
    }

    const organizer = await Organizer.findOne({
        _id: ticketType.event.organizer,
        owner: req.user._id,
    });

    if (!organizer) {
        throw new ApiError(403, "You are not the owner of this event");
    }

    return res
    .status(200).
    json(
        new ApiResponse(200, ticketType, "Ticket type fetched successfully")
    );
});

const updateTicketType = asyncHandler(async (req, res) => {
    const { ticketTypeId } = req.params;
    const { name, description, price, quantity, saleEnd } = req.body;

    // Find ticket type
    const ticketType = await TicketType.findById(ticketTypeId).populate("event");

    if (!ticketType) {
        throw new ApiError(404, "Ticket type not found");
    }

    // Verify ownership
    const organizer = await Organizer.findOne({
        _id: ticketType.event.organizer,
        owner: req.user._id,
    });

    if (!organizer) {
        throw new ApiError(403, "You are not authorized to update this ticket type");
    }

    // Prevent duplicate ticket names for the same event
    if (name && name !== ticketType.name) {
        const existingTicketType = await TicketType.findOne({
            event: ticketType.event._id,
            name,
        });

        if (existingTicketType) {
            throw new ApiError(
                409,
                "Ticket type with this name already exists for this event"
            );
        }

        ticketType.name = name;
    }

    // Update description
    if (description !== undefined) {
        ticketType.description = description;
    }

    // Update price
    if (price !== undefined) {
        ticketType.price = price;
    }

    // Update quantity
    if (quantity !== undefined) {
        if (quantity < ticketType.sold) {
            throw new ApiError(
                400,
                "Quantity cannot be less than sold tickets"
            );
        }

        ticketType.quantity = quantity;
    }

    // Update sale end date
    if (saleEnd !== undefined) {
        ticketType.saleEnd = saleEnd;
    }

    const savedTicketType = await ticketType.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            savedTicketType,
            "Ticket type updated successfully"
        )
    );
});
const deleteTicketType = asyncHandler(async (req, res) => {
    const { ticketTypeId } = req.params;
    const ticketType = await TicketType.findById(ticketTypeId).populate("event");
    if (!ticketType) {
        throw new ApiError(404, "Ticket type not found");
    }
    const organizer = await Organizer.findOne({
        _id: ticketType.event.organizer,
        owner: req.user._id,
    });
    if (!organizer) {
        throw new ApiError(
            403,
            "You are not authorized to delete this ticket type"
        );
    }

    // Prevent deletion if tickets have already been sold
    if (ticketType.sold > 0) {
        throw new ApiError(
            400,
            "Cannot delete a ticket type after tickets have been sold"
        );
    }

    await ticketType.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Ticket type deleted successfully"
        )
    );
});
const activateTicketType = asyncHandler(async (req, res) => {
    const { ticketTypeId } = req.params;

    const ticketType = await TicketType.findById(ticketTypeId).populate("event");

    if (!ticketType) {
        throw new ApiError(404, "Ticket type not found");
    }

    const organizer = await Organizer.findOne({
        _id: ticketType.event.organizer,
        owner: req.user._id,
    });

    if (!organizer) {
        throw new ApiError(
            403,
            "You are not authorized to activate this ticket type"
        );
    }

    ticketType.isActive = true;

    const savedTicketType = await ticketType.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            savedTicketType,
            "Ticket type activated successfully"
        )
    );
});

const deactivateTicketType = asyncHandler(async (req, res) => {
    const { ticketTypeId } = req.params;

    const ticketType = await TicketType.findById(ticketTypeId).populate("event");

    if (!ticketType) {
        throw new ApiError(404, "Ticket type not found");
    }

    const organizer = await Organizer.findOne({
        _id: ticketType.event.organizer,
        owner: req.user._id,
    });

    if (!organizer) {
        throw new ApiError(
            403,
            "You are not authorized to deactivate this ticket type"
        );
    }

    ticketType.isActive = false;

    const savedTicketType = await ticketType.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            savedTicketType,
            "Ticket type deactivated successfully"
        )
    );
});
export { createTicketType, getEventTicketTypes, getTicketTypeById, updateTicketType, deleteTicketType, activateTicketType, deactivateTicketType };