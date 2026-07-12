import mongoose,{Schema} from "mongoose";

export const OrderStatus=Object.freeze({
    PENDING:"pending",
    PAID:"paid",
    FAILED:"failed"
})
const orderSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    eventId:{
        type:Schema.Types.ObjectId,
        ref:"Event",

    },
    stripePaymentIntentId:{
        type:String,
    },
    amount:{
        type:Number,
        min:[0,"Amount must be a positive number"]
    },
    status:{
        type:String,
        enum:Object.values(OrderStatus),
        default:OrderStatus.PENDING
    }
},{timestamps:true})

const Order=mongoose.model("Order",orderSchema)
export default Order