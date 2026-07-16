import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import User from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try{
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!accessToken){
            throw new ApiError(401,"Unauthorized access, please login to continue")
        }
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(401,"User not found")
        }
        req.user = user;
        next();
    }catch(error){
        throw new ApiError(401,error?.message||"Invalid or expired token")
    }
})


export const authorizeRoles = (...roles) => {
    return (req, _, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, "You are not authorized to perform this action");
        }
        next();
    };
};
