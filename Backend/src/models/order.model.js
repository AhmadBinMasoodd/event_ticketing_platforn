import mongoose, { Schema } from "mongoose";

export const OrderStatus = Object.freeze({
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    CANCELLED: "cancelled",
    REFUNDED: "refunded",
});

export const PaymentMethods = Object.freeze({
    CASH: "cash",
    BANK_TRANSFER: "bank_transfer",
    EASYPAISA: "easypaisa",
    JAZZCASH: "jazzcash",
});

const orderSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },

        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: [true, "Event is required"],
        },

        ticketTypeId: {
            type: Schema.Types.ObjectId,
            ref: "TicketType",
            required: [true, "Ticket type is required"],
        },

        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"],
        },

        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0, "Amount cannot be negative"],
        },

        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethods),
            default: PaymentMethods.BANK_TRANSFER,
        },

        paymentProof: {
            type: String,
            default: null,
        },

        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
        },

        paidAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;