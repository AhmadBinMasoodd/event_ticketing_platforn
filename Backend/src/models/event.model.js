import mongoose, { Schema } from "mongoose";

export const EventStatus = Object.freeze({
    UPCOMING: "upcoming",
    ONGOING: "ongoing",
    COMPLETED: "completed",
    CANCELLED: "cancelled"
});

const eventSchema = new Schema(
    {
        organizer: {
            type: Schema.Types.ObjectId,
            ref: "Organizer",
            required: [true, "Organizer is required"]
        },

        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters long"]
        },

        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true
        },
        
        venue: {
            type: String,
            required: [true, "Venue is required"],
            trim: true
        },

        city: {
            type: String,
            required: [true, "City is required"],
            trim: true
        },

        eventDate: {
            type: Date,
            required: [true, "Event date is required"]
        },

        startTime: {
            type: String,
            required: [true, "Start time is required"]
        },

        endTime: {
            type: String,
            required: [true, "End time is required"]
        },

        capacity: {
            type: Number,
            required: [true, "Capacity is required"],
            min: [1, "Capacity must be at least 1"]
        },

        ticketsSold: {
            type: Number,
            default: 0,
            min: 0
        },

        status: {
            type: String,
            enum: Object.values(EventStatus),
            default: EventStatus.UPCOMING
        },

        isPublished: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;