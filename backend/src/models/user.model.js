
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "username is required"],
    unique: [true, "username is already registered"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: [true, "email is already registered"],
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[0-9]{10,15}$/, "Please enter a valid phone number"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  verified: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    default: "rider",
  },
});

const userModel = mongoose.model("users", userSchema);

export default userModel;
