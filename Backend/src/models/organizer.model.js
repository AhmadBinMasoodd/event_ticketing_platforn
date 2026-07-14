import mongoose, { Schema } from "mongoose";
import validator from "validator";

const organizerSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner is required"],
            unique: true
        },

        businessName: {
            type: String,
            required: [true, "Business name is required"],
            trim: true,
            minlength: [3, "Business name must be at least 3 characters long"]
        },

        businessEmail: {
            type: String,
            required: [true, "Business email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: validator.isEmail,
                message: "Please enter a valid business email"
            }
        },

        businessPhone: {
            type: String,
            required: [true, "Business phone is required"],
            unique: true,
            trim: true,
            validate: {
                validator: (value) => validator.isMobilePhone(value, "any"),
                message: "Please enter a valid business phone number"
            }
        },

        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true
        },

        city: {
            type: String,
            required: [true, "City is required"],
            trim: true
        },

        isVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Organizer = mongoose.model("Organizer", organizerSchema);

export default Organizer;