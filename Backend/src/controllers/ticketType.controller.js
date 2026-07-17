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
    const eventExists = await Event.findOne({
        _id: event,
    });
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
    return res.status(201).json(new ApiResponse(201, ticketType, "Ticket type created successfully"));
})