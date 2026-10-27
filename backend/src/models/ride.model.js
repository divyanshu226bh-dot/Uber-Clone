import mongoose from "mongoose";

const coordinatesSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
  },
  { _id: false },
);

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

    // Actual GPS coordinates for proximity checks and routing
    pickupCoords: {
      type: coordinatesSchema,
      required: true,
    },

    destinationCoords: {
      type: coordinatesSchema,
      required: true,
    },

    fare: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "arrived",
        "ongoing",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    duration: {
      type: Number,
    },

    distance: {
      type: Number,
    },

    otp: {
      type: String,
      select: false,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      default: "cash",
    },
  },
  { timestamps: true },
);

const rideModel = mongoose.model("rides", rideSchema);

export default rideModel;
