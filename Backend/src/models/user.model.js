import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcryptjs";
export const Roles=Object.freeze(
    {
        CUSTOMER:"customer",
        ADMIN:"admin",
        ORGANIZER:"organizer"
    }
)
const userSchema=new Schema({
    name:{
        type:String,
        required:[true,"Name is required"],
        minlength:[3,"Name must be at least 3 characters long"],
        trim:true,
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:[true,"Email already exists"],
        lowercase:true,
        index:true,
        validate:{
            validator:validator.isEmail,
            message:"Please enter a valid email"
        },
        trim:true
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minlength:[8,"Password must be at least 8 characters long"],
        select:false
    },
    role:{
        type:String,
        enum:Object.values(Roles),
        default:Roles.CUSTOMER
    },
    phone:{
        type:String,
        required:[true,"Phone number is required"],
        validate:{
            validator:(value)=>validator.isMobilePhone(value, "any"),
            message:"Please enter a valid phone number"
        },
        index:true,
        unique:true,
        trim:true
    },
    refreshToken:{
        type:String,
        select:false
    }
},{timestamps:true})

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);

});
userSchema.methods.isPasswordCorrect=async function(password){
    return  await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            name:this.name,
            role:this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            role:this.role
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User=mongoose.model("User",userSchema)
export default User