import mongoose from "mongoose";

const captainSchema = new mongoose.Schema(
  {
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
    password: {
      type: String,
      required: [true, "password is required"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "captain",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    vehicle: {
      color: {
        type: String,
        required: [true, "vehicle color is required"],
      },
      plate: {
        type: String,
        required: [true, "vehicle plate number is required"],
        unique: true,
      },
      capacity: {
        type: Number,
        required: [true, "vehicle capacity is required"],
      },
      vehicleType: {
        type: String,
        required: [true, "vehicle type is required"],
        enum: ["car", "auto", "moto"],
      },
    },
    // GeoJSON location field for MongoDB spatial queries ($near / $geoWithin)
    location: {
      ltd: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
    // Optional: Add socketId to keep track of active WebSocket connections
    socketId: {
      type: String,
    },
  },
  { timestamps: true },
);

// Enable 2dsphere indexing for geospatial searches
captainSchema.index({ "location.ltd": 1, "location.lng": 1 });

const captainModel = mongoose.model("captains", captainSchema);

export default captainModel;
