import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //get the user details from front end
  const { name, email, password, phone } = req.body;

  //check if the user already exists
  const existingEmail = await User.findOne({ email });

  if (existingEmail) {
    throw new ApiError(409, "Email already registered");
  }

  const existingPhone = await User.findOne({ phone });

  if (existingPhone) {
    throw new ApiError(409, "Phone number already registered");
  }
  const user = await User.create({
    name,
    email,
    password,
    phone,
  });
  const createdUser = await User.findById(user._id);
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});
export default registerUser;