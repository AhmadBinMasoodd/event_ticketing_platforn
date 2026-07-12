import mongoose, { Schema } from "mongoose";

export const EventStatus = Object.freeze({
    UPCOMING: "upcoming",
    ONGOING: "ongoing",
    COMPLETED: "completed"
});

const eventSchema = new Schema({
    title:{
        type:String,
        require:[true,"Title is required"]
    },
    description:{
        type:String,
        require:[true,"Description is required"]
    },
    venue:{
        type:String,
        require:[true,"Venue is required"]
    },
    organizerId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        require:[true,"Organizer ID is required"]
    },
    date:{
        type:Date,
        require:[true,"Date is required"]
    },
    status:{
        type:String,
        enum:Object.values(EventStatus),
        default:EventStatus.UPCOMING
    }
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);
export default Event;
