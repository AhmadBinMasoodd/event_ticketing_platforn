import mongoose, { Schema } from "mongoose";

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
        enum:["upcoming","ongoing","completed"],
        default:"upcoming"
    }
}, { timestamps: true });

const event = mongoose.model("Event", eventSchema);
export default event;
