import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

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
        .json(
            new ApiResponse(201, createdUser, "User registered successfully")
        );
});

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (err) {
        console.log(err);
        throw new ApiError(
            500,
            "Error while generating access and refresh tokens"
        );
    }
};

const loginUser = asyncHandler(async (req, res) => {
    //get the user details from front end
    const { email, password } = req.body;
    //check if the user already exists
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }
    //check if the user exists in the database
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    //check if the password is correct
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid Credentials");
    }
    //generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );
    const loggedInUser = await User.findById(user._id);
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
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
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, null, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    req.user,
                    "Current user fetched successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, "Error while fetching current user");
    }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    //get the refresh token from the cookies
    const incommingRefreshToken = req.cookies.refreshToken;
    if (!incommingRefreshToken) {
        throw new ApiError(401, "Unauthorized, Refresh token is required");
    }
    const decoded = jwt.verify(
        incommingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded._id).select("+refreshToken");
    if (!user || user.refreshToken !== incommingRefreshToken) {
        throw new ApiError(401, "Unauthorized, Invalid refresh token");
    }
    const { accessToken, newRefreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", incommingRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                },
                "Access token refreshed successfully"
            )
        );
});

const updatePassword = asyncHandler(async (req, res) => {
    //get the input from the user
    const { currentPassword, newPassword, confirmPassword } = req.body;
    //validate the inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, "All fields are required");
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError(
            400,
            "New password and confirm password do not match"
        );
    }
    //get the user from the database
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    //check if the current password is correct
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Current password is incorrect");
    }

    //check for the same password
    const isSamePassword = await user.isPasswordCorrect(newPassword);
    if (isSamePassword) {
        throw new ApiError(
            400,
            "New password cannot be the same as the current password"
        );
    }
    user.password = newPassword;
    const updatedUser = await user.save();
    if (!updatedUser) {
        throw new ApiError(500, "Error while updating password");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "Password updated successfully")
        );
});

const updateUser = asyncHandler(async (req, res) => {
    const { name, email, phone } = req.body;

    if (!name && !email && !phone) {
        throw new ApiError(400, "At least one field is required to update");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    try {
        user.name = name ?? user.name;
        user.email = email ?? user.email;
        user.phone = phone ?? user.phone;

        const updatedUser = await user.save();

        return res
            .status(200)
            .json(
                new ApiResponse(200, updatedUser, "User updated successfully")
            );
    } catch (error) {
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyValue)[0];

            throw new ApiError(409, `${duplicateField} already exists`);
        }

        throw new ApiError(500, error?.message ||"Error while updating user");
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    updatePassword,
    updateUser,
};
