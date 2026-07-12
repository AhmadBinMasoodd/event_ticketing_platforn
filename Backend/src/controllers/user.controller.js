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

const generateAccessAndRefreshTokens = async (userId) => {
  try{
    const user =await User.findById(userId)
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false})
    return{accessToken,refreshToken}

  }catch(err){
    console.log(err)
    throw new ApiError(500,"Error while generating access and refresh tokens")
  }
}

const loginUser = asyncHandler(async (req, res) => {

  //get the user details from front end
  const { email, password } = req.body;
  //check if the user already exists
  if(!email || !password){
    throw new ApiError(400,"Email and password are required")
  }
  //check if the user exists in the database
  const user= await User.findOne({ email }).select("+password")
  if(!user){
    throw new ApiError(404,"User not found")
  }
  //check if the password is correct
  const isPasswordCorrect=await user.isPasswordCorrect(password)
  if(!isPasswordCorrect){
    throw new ApiError(401,"Invalid Credentials")
  }
  //generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id);
  const options={
    httpOnly:true,
    secure:true
  }
  return res
  .status(200)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
        accessToken,
        refreshToken,
      },
      "User logged in successfully"
    )
  )


})
export { registerUser, loginUser };