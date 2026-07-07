import mongoose,{Schema} from "mongoose";

const userSchema=new Schema({
    name:{
        type:String,
        require:[true,"Name is required"]
    },
    email:{
        type:String,
        require:[true,"Email is required"],
        unique:[true,"Email already exists"],
        lowercase:true
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minlength:[6,"Password must be at least 6 characters long"]
    },
    role:{
        type:String,
        enum:["customer","admin","organizer"],
        default:"customer"
    },
    phone:{
        type:String,
        required:[true,"Phone number is required"]
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const user=mongoose.model("User",userSchema)
export default user