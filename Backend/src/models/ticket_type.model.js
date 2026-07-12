import mongoose,{Schema} from "mongoose";

const ticketTypeSchema=new Schema({
    eventId:{
        type:Schema.Types.ObjectId,
        ref:"Event",
        require:[true,"Event ID is required"]
    },
    name:{
        type:String,
        require:[true,"Name is required"]
    },
    price:{
        type:Number,
        default:0,
        require:[true,"Price is required"],
        min:[0,"Price must be a positive number"]
    },
    quantity:{
        type:Number,
        require:[true,"Quantity is required"],
        min:[1,"Quantity must be at least 1"]
    },
    sold:{
        type:Number,
        default:0
    }
},{ timestamps:true})

const TicketType=mongoose.model("TicketType",ticketTypeSchema)
export default TicketType