import mongoose, { Schema } from "mongoose";

export const TicketStatus = Object.freeze({
    ACTIVE: "active",
    USED: "used",
    CANCELLED: "cancelled",
});

const ticketSchema = new Schema(
    {
        ticketType: {
            type: Schema.Types.ObjectId,
            ref: "TicketType",
            required: [true, "Ticket type is required"],
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },

        event: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: [true, "Event is required"],
        },

        purchasePrice: {
            type: Number,
            required: [true, "Purchase price is required"],
            min: 0,
        },

        qrCode: {
            type: String,
            required: [true, "QR Code is required"],
            unique: true,
            trim: true,
        },

        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
        },

        status: {
            type: String,
            enum: Object.values(TicketStatus),
            default: TicketStatus.ACTIVE,
        },

        scannedAt: {
            type: Date,
            default: null,
        },

        scannedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;