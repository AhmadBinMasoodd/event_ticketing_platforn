import mongoose,{Schema} from "mongoose";

export const ScanResult=Object.freeze({
    SUCCESS:"success",
    FAILURE:"failure"
})
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
        enum:Object.values(ScanResult),
        default:ScanResult.FAILURE
    },

},{timestamps:true})

const ScanLog=mongoose.model("ScanLog",scanLogSchema)
export default ScanLog