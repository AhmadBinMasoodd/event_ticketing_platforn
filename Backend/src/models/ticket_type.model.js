import mongoose, { Schema } from "mongoose";

export const TicketNames = Object.freeze({
    VIP: "VIP",
    STANDARD: "Standard",
    STUDENT: "Student",
});

const ticketTypeSchema = new Schema(
    {
        event: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: [true, "Event is required"],
        },

        name: {
            type: String,
            required: [true, "Ticket name is required"],
            trim: true,
            enum: Object.values(TicketNames),
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },

        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"],
        },

        sold: {
            type: Number,
            default: 0,
            min: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        saleStart: {
            type: Date,
            default: Date.now,
        },

        saleEnd: {
            type: Date,
            required: [true, "Sale end date is required"],
        },
    },
    {
        timestamps: true,
    }
);

const TicketType = mongoose.model("TicketType", ticketTypeSchema);

export default TicketType;