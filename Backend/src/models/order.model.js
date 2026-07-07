import mongoose,{Schema} from "mongoose";

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
        enum:["pending","paid","failed"],
        default:"pending"
    }
},{timestamps:true})

const order=mongoose.model("Order",orderSchema)
export default order