import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "captains",
    },
    pickup: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "ongoing", "completed", "cancelled"],
      default: "pending",
    },
    duration: {
      type: Number, // In seconds
    },
    distance: {
      type: Number, // In meters
    },
    otp: {
      type: String,
      select: false, // Hidden by default for security
      required: true,
    },
  },
  { timestamps: true }
);

const rideModel = mongoose.model("rides", rideSchema);

export default rideModel;