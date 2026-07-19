import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import Event from "../models/event.model.js";
import ApiResponse from "../utils/apiResponse.js";
import Organizer from "../models/organizer.model.js";
import TicketType from "../models/ticket_type.model.js";
import Ticket from "../models/ticket.model.js";

const getMyTickets = asyncHandler(async (req, res) => {

    const tickets = await Ticket.find({
        user: req.user._id,
    })
        .populate("event", "title eventDate venue city")
        .populate("ticketType", "name price")
        .populate("order", "status paidAt")
        .sort({ createdAt: -1 });

    if (tickets.length === 0) {
        return res.status(200).json(
            new ApiResponse(
                200,
                [],
                "No tickets found"
            )
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            tickets,
            "Tickets retrieved successfully"
        )
    );
});
const getTicketById = asyncHandler(async (req, res) => {
    const { ticketId } = req.params;

    const ticket = await Ticket.findOne({ _id: ticketId, user: req.user._id })
        .populate("event", "title eventDate venue city")
        .populate("ticketType", "name price")
        .populate("order", "status paidAt");

    if (!ticket) {
        throw new ApiError(404, "Ticket not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            ticket,
            "Ticket retrieved successfully"
        )
    );
});
export {
    getMyTickets,
    getTicketById
};