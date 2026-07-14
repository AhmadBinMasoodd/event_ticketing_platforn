import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import Organizer from "../models/organizer.model.js";
import ApiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const createOrganizer = asyncHandler(async (req, res) => {
    //get the organizer details from front end
    const { businessName, businessEmail, businessPhone, address, city } =
        req.body;

    //validate the input
    if (
        !businessName ||
        !businessEmail ||
        !businessPhone ||
        !address ||
        !city
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existingOrganization = await Organizer.findOne({
        $or: [
            { businessName },
            {businessEmail},
            {businessPhone}
        ]
    });
    if(existingOrganization){
        throw new ApiError(409, "Organization with same details already exists");
    }

    const organizer = await Organizer.create({
        owner:req.user._id,
        businessName,
        businessEmail,
        businessPhone,
        address,
        city,
    });
    
    return res
    .status(201)
    .json(
        new ApiResponse(201, organizer, "Organizer created successfully")
    )
});

export{
    createOrganizer
}