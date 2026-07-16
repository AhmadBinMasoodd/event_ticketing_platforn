import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import Organizer from "../models/organizer.model.js";
import ApiResponse from "../utils/apiResponse.js";
import { Roles } from "../models/user.model.js";

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
    await User.findByIdAndUpdate(
        req.user._id,
        {
            role:Roles.ORGANIZER
        }
    )
    return res
    .status(201)
    .json(
        new ApiResponse(201, organizer, "Organizer created successfully")
    )
});

const getMyOrganizers = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const organizers = await Organizer.find({ owner: userId });
    if(organizers.length === 0){
        return res
        .status(200)
        .json(
            new ApiResponse(200, [], "No organizers found for this user")
        );
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, organizers, "Organizers fetched successfully")
        );
});

const getOrganizerById = asyncHandler(async (req, res) => {
    const {organizerId} = req.params;
    const organizer = await Organizer.findOne({
        _id: organizerId,
        owner: req.user._id
    });
    if (!organizer) {
        throw new ApiError(404, "Organizer not found");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, organizer, "Organizer fetched successfully")
        );
})

const updateOrganizer = asyncHandler(async (req, res) => {
    const { organizerId } = req.params;
    const { businessName, businessEmail, businessPhone, address, city } = req.body;
    if (!businessName && !businessEmail && !businessPhone && !address && !city) {
        throw new ApiError(400, "At least one field is required to update");
    }
    const organizer = await Organizer.findOne({
        _id: organizerId,
        owner: req.user._id,
    });
    if (!organizer) {
        throw new ApiError(404, "Organizer not found");
    }
    organizer.businessName = businessName ?? organizer.businessName;
    organizer.businessEmail = businessEmail ?? organizer.businessEmail;
    organizer.businessPhone = businessPhone ?? organizer.businessPhone;
    organizer.address = address ?? organizer.address;
    organizer.city = city ?? organizer.city;
    const updatedOrganizer = await organizer.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedOrganizer, "Organizer updated successfully")
        );
});

const deleteOrganizer = asyncHandler(async (req, res) => {
    const { organizerId } = req.params;
    const organizer = await Organizer.findOneAndDelete({
        _id: organizerId,
        owner: req.user._id,
    });
    if (!organizer) {
        throw new ApiError(404, "Organizer not found");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Organizer deleted successfully")
        );
});
export{
    createOrganizer,
    getMyOrganizers,
    getOrganizerById,
    updateOrganizer,
    deleteOrganizer
}