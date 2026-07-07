import mongoose,{Schema} from "mongoose";

const ticketSchema=new Schema({
    ticketTypeId:{
        type:Schema.Types.ObjectId,
        ref:"TicketType",
        required:[true,"Ticket Type ID is required"]
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:[true,"User ID is required"]
    },
    eventId:{
        type:Schema.Types.ObjectId,
        ref:"Event",
        required:[true,"Event ID is required"]
    },
    qrCode:{
        type:String,
        required:[true,"QR Code is required"],
        unique:[true,"QR Code already exists"]
    },
    orderId:{
        type:Schema.Types.ObjectId,
        ref:"Order"
    },
    status:{
        type:String,
        enum:["active","used","cancelled"],
        default:"active"
    },
    scannedAt:{
        type:Date,
        default:null
    },
    scannedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
})

const ticket=mongoose.model("Ticket",ticketSchema)
export default ticket