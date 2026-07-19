import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import Event from "../models/event.model.js";
import ApiResponse from "../utils/apiResponse.js";
import Organizer from "../models/organizer.model.js";
import TicketType from "../models/ticket_type.model.js";
import Ticket from "../models/ticket.model.js";
import { TicketStatus } from "../models/ticket.model.js";
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
        throw new ApiError(
            403,
            "You are not authorized to view tickets for this event"
        );
    }

    const tickets = await Ticket.find({
        event: eventId,
    })
        .populate("user", "name email phone")
        .populate("ticketType", "name price")
        .populate("order", "status paidAt paymentMethod")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            tickets,
            tickets.length
                ? "Tickets retrieved successfully"
                : "No tickets found for this event"
        )
    );
});
const scanTicket = asyncHandler(async (req, res) => {
    console.log(req.params);
    const { qrCode } = req.params;
    console.log("QR Code:", qrCode);

    const ticket = await Ticket.findOne({ qrCode });

    console.log(ticket);

    if (!ticket) {
        throw new ApiError(404, "Ticket not found");
    }

    if (ticket.status !== TicketStatus.ACTIVE) {
        throw new ApiError(
            400,
            `Ticket is ${ticket.status} and cannot be scanned`
        );
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
        throw new ApiError(
            403,
            "You are not authorized to scan tickets for this event"
        );
    }

    ticket.status = TicketStatus.USED;
    ticket.scannedAt = new Date();
    ticket.scannedBy = req.user._id;

    await ticket.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            ticket,
            "Ticket scanned successfully"
        )
    );
});
export {
    getMyTickets,
    getTicketById,
    getEventTickets,
    scanTicket
};