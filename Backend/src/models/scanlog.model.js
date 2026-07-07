import mongoose,{Schema} from "mongoose";

const scanLogSchema=new Schema({
    ticketId:{
        type:Schema.Types.ObjectId,
        ref:"Ticket",
    },
    scannedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    scannedAt:{
        type:Date,
        default:Date.now
    },
    result:{
        type:String,
        enum:["success","failure"],
    },

},{timestamps:true})

const scanLog=mongoose.model("ScanLog",scanLogSchema)
export default scanLog