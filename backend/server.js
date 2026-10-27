import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import rideModel from "./src/models/ride.model.js";
import captainModel from "./src/models/captain.model.js";
import userModel from "./src/models/user.model.js";
import { randomInt } from "crypto";
import mongoose from "mongoose";
import config from "./src/config/config.js";
import connectDb from "./src/config/database.js";
import dns from "dns";

// Fix DNS resolution for MongoDB Atlas SRV lookups
dns.setServers(["8.8.8.8"]);

try {
  await connectDb();
  console.log("Database connected successfully");
} catch (error) {
  console.error("Error connecting to database:", error);
}

// 1. Wrap Express app with HTTP server
const server = http.createServer(app);

// 2. Initialize Socket.io instance
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"], // Adjust if your Vite frontend runs on a different port
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store io instance on app so route controllers can access it later via req.app.get('io')
app.set("io", io);

// Calculate the distance between two GPS coordinates in metres.
const getDistanceInMeters = (pointA, pointB) => {
  if (!pointA || !pointB) return Infinity;

  const lat1 = Number(pointA.lat ?? pointA.ltd);
  const lng1 = Number(pointA.lng);
  const lat2 = Number(pointB.lat ?? pointB.ltd);
  const lng2 = Number(pointB.lng);

  if (
    ![lat1, lng1, lat2, lng2].every(Number.isFinite) ||
    Math.abs(lat1) > 90 ||
    Math.abs(lat2) > 90 ||
    Math.abs(lng1) > 180 ||
    Math.abs(lng2) > 180
  ) {
    return Infinity;
  }

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadius = 6371000;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// 3. Socket Event Listeners
io.on("connection", (socket) => {
  console.log("⚡ Client connected to Socket.io:", socket.id);

  // User/Captain joins their private socket room
  socket.on("join", (data) => {
    const { userId, userType } = data;
    if (userType === "captain") {
      socket.join(`captain_${userId}`);
      socket.join("captains"); // Join shared room for all online active drivers
      console.log(
        `Captain joined private room: captain_${userId} & broadcast room: captains`,
      );
    } else {
      socket.join(`user_${userId}`);
      console.log(`User joined room: user_${userId}`);
    }
  });

  // Rider initiates a new ride request

  socket.on("create-ride", async (rideData) => {
    console.log("🚕 CREATE-RIDE RECEIVED:", rideData);

    try {
      const {
        userId,
        pickup,
        destination,
        pickupCoords,
        destinationCoords,
        vehicleType,
        price,
      } = rideData || {};

      // Validate the rider ID before querying MongoDB.
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        socket.emit("ride-error", {
          message: "Invalid rider ID. Please log in again.",
        });
        return;
      }

      const isValidCoords = (coords) => {
        if (!coords || typeof coords !== "object") return false;

        const lat = coords.lat;
        const lng = coords.lng;

        return (
          typeof lat === "number" &&
          Number.isFinite(lat) &&
          lat >= -90 &&
          lat <= 90 &&
          typeof lng === "number" &&
          Number.isFinite(lng) &&
          lng >= -180 &&
          lng <= 180
        );
      };

      if (
        typeof pickup !== "string" ||
        !pickup.trim() ||
        typeof destination !== "string" ||
        !destination.trim() ||
        !Number.isFinite(Number(price)) ||
        Number(price) <= 0 ||
        !isValidCoords(pickupCoords) ||
        !isValidCoords(destinationCoords)
      ) {
        socket.emit("ride-error", {
          message:
            "Please provide valid pickup, destination, coordinates, and fare.",
        });
        return;
      }

      const rider = await userModel.findById(userId).select("username email");

      if (!rider) {
        socket.emit("ride-error", {
          message: "Rider account not found. Please log in again.",
        });
        return;
      }

      // Generate the ride OTP on the backend.
      const otp = String(randomInt(1000, 10000));

      // Save the ride, including both GPS locations.
      const ride = await rideModel.create({
        user: userId,
        pickup: pickup.trim(),
        destination: destination.trim(),
        pickupCoords: {
          lat: pickupCoords.lat,
          lng: pickupCoords.lng,
        },
        destinationCoords: {
          lat: destinationCoords.lat,
          lng: destinationCoords.lng,
        },
        fare: Number(price),
        otp,
        status: "pending",
      });

      console.log("✅ RIDE SAVED:", ride._id.toString());

      // Notify the rider with the real ride ID and OTP.
      io.to(`user_${userId}`).emit("ride-created", {
        rideId: ride._id.toString(),
        otp: ride.otp,
        status: ride.status,
      });

      // Notify connected captains about the new ride.
      io.to("captains").emit("new-ride-popup", {
        rideId: ride._id.toString(),
        userId: userId,
        rider: {
          username: rider.username,
          email: rider.email,
        },
        pickup: ride.pickup,
        destination: ride.destination,
        pickupCoords: ride.pickupCoords,
        destinationCoords: ride.destinationCoords,
        vehicleType,
        price: ride.fare,
        paymentMethod: ride.paymentMethod,
      });

      console.log("📢 NEW RIDE SENT TO CAPTAINS");
      console.log(`Ride ${ride._id} saved and sent to captains.`);
    } catch (error) {
      console.error("Error creating ride:", error);

      socket.emit("ride-error", {
        message: "Could not create your ride. Please try again.",
      });
    }
  });

  // Captain accepts the ride
  socket.on("accept-ride", async (data) => {
    try {
      const { rideId, userId, captainData } = data || {};
      const captainId = captainData?._id;

      if (
        !mongoose.Types.ObjectId.isValid(rideId) ||
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(captainId)
      ) {
        socket.emit("ride-error", {
          message: "Invalid ride, rider, or captain ID.",
        });
        return;
      }

      const captain = await captainModel
        .findById(captainId)
        .select("_id username phone vehicle");

      if (!captain) {
        socket.emit("ride-error", {
          message: "Captain account not found. Please log in again.",
        });
        return;
      }

      // Only the assigned rider's pending ride can be accepted.
      const ride = await rideModel.findOneAndUpdate(
        {
          _id: rideId,
          user: userId,
          status: "pending",
        },
        {
          $set: {
            captain: captain._id,
            status: "accepted",
          },
        },
        { new: true },
      );

      if (!ride) {
        socket.emit("ride-error", {
          message: "This ride is no longer available.",
        });
        return;
      }

      const rider = await userModel
        .findById(ride.user)
        .select("username email");

      const acceptedCaptain = {
        _id: captain._id.toString(),
        username: captain.username,
        phone: captain.phone,
        vehicle: captain.vehicle,
      };

      const rideDetails = {
        rideId: ride._id.toString(),
        userId: ride.user.toString(),
        rider: {
          username: rider?.username || "Rider",
          email: rider?.email || "",
        },
        pickup: ride.pickup,
        destination: ride.destination,
        pickupCoords: ride.pickupCoords,
        destinationCoords: ride.destinationCoords,
        price: ride.fare,
        paymentMethod: ride.paymentMethod,
        status: ride.status,
      };

      // Send accepted captain + ride details to the rider.
      io.to(`user_${ride.user}`).emit("ride-accepted", {
        ...rideDetails,
        captain: acceptedCaptain,
      });

      // Send all necessary ride details to the accepting captain.
      socket.emit("ride-accept-confirmed", rideDetails);

      console.log(`Ride ${ride._id} accepted by captain ${captain._id}`);
    } catch (error) {
      console.error("Error accepting ride:", error);

      socket.emit("ride-error", {
        message: "Could not accept this ride. Please try again.",
      });
    }
  });

  // Listen for Captain live location streaming & save to MongoDB
  socket.on("update-location-captain", async (data) => {
    const { captainId, location } = data;

    if (!location || location.ltd === undefined || location.lng === undefined) {
      return;
    }

    try {
      // Update coordinates & active socketId in MongoDB
      await captainModel.findByIdAndUpdate(captainId, {
        location: {
          ltd: location.ltd,
          lng: location.lng,
        },
        socketId: socket.id,
      });

      // Broadcast updated position to active listeners/riders
      io.emit(`captain-location-${captainId}`, location);
    } catch (error) {
      console.error("Error updating captain location in DB:", error);
    }
  });

  // Captain has arrived at the pickup point

  // Captain can mark arrival only within 50 metres of pickup.
  socket.on("captain-arrived", async (data) => {
    try {
      const { rideId, userId, captainId } = data || {};

      if (
        !mongoose.Types.ObjectId.isValid(rideId) ||
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(captainId)
      ) {
        socket.emit("ride-error", {
          message: "Invalid ride details.",
        });
        return;
      }

      const ride = await rideModel.findOne({
        _id: rideId,
        user: userId,
        captain: captainId,
        status: "accepted",
      });

      if (!ride) {
        socket.emit("ride-error", {
          message: "Ride not found or it is no longer awaiting arrival.",
        });
        return;
      }

      // Read the captain's most recently saved GPS coordinates.
      const captain = await captainModel.findById(captainId).select("location");

      if (
        !captain?.location ||
        !Number.isFinite(captain.location.ltd) ||
        !Number.isFinite(captain.location.lng)
      ) {
        socket.emit("ride-error", {
          message: "Captain location is unavailable. Please enable GPS.",
        });
        return;
      }

      const distance = getDistanceInMeters(captain.location, ride.pickupCoords);

      if (distance > 50) {
        socket.emit("ride-error", {
          message: `You are ${Math.round(distance)} metres from pickup. Get within 50 metres to mark arrival.`,
        });
        return;
      }

      // Conditional update prevents duplicate or stale arrival requests.
      const updatedRide = await rideModel.findOneAndUpdate(
        {
          _id: rideId,
          user: userId,
          captain: captainId,
          status: "accepted",
        },
        { $set: { status: "arrived" } },
        { new: true },
      );

      if (!updatedRide) {
        socket.emit("ride-error", {
          message: "Ride status changed. Please try again.",
        });
        return;
      }

      const update = {
        rideId: updatedRide._id.toString(),
        status: "arrived",
      };

      io.to(`user_${userId}`).emit("captain-arrived", update);
      io.to(`captain_${captainId}`).emit("ride-status-updated", update);
    } catch (error) {
      console.error("Captain arrival error:", error);

      socket.emit("ride-error", {
        message: "Could not update arrival status.",
      });
    }
  });

  // Captain submits the OTP provided by the rider
  socket.on("verify-ride-otp", async (data) => {
    try {
      const { rideId, captainId, otp } = data || {};

      if (
        !mongoose.Types.ObjectId.isValid(rideId) ||
        !mongoose.Types.ObjectId.isValid(captainId) ||
        !/^\d{4}$/.test(String(otp ?? ""))
      ) {
        socket.emit("otp-verification-result", {
          success: false,
          message: "Enter a valid four-digit OTP.",
        });
        return;
      }

      // OTP is select:false in your schema, so explicitly request it.
      const ride = await rideModel
        .findOne({
          _id: rideId,
          captain: captainId,
          status: "arrived",
        })
        .select("+otp user");

      if (!ride || ride.otp !== String(otp)) {
        socket.emit("otp-verification-result", {
          success: false,
          message: "Incorrect OTP or ride is not ready to start.",
        });
        return;
      }

      // Conditional update prevents starting the same ride twice.
      const startedRide = await rideModel.findOneAndUpdate(
        {
          _id: rideId,
          captain: captainId,
          status: "arrived",
          otp: String(otp),
        },
        { $set: { status: "ongoing" } },
        { new: true },
      );

      if (!startedRide) {
        socket.emit("otp-verification-result", {
          success: false,
          message: "Ride status changed. Please try again.",
        });
        return;
      }

      socket.emit("otp-verification-result", {
        success: true,
        message: "OTP verified. Ride started.",
      });

      const update = {
        rideId: startedRide._id.toString(),
        status: "ongoing",
      };

      io.to(`user_${startedRide.user}`).emit("ride-started", update);
      io.to(`captain_${captainId}`).emit("ride-started", update);
    } catch (error) {
      console.error("OTP verification error:", error);
      socket.emit("otp-verification-result", {
        success: false,
        message: "Could not verify OTP. Please try again.",
      });
    }
  });

  // Captain can complete the ride only within 50 metres of destination.
  socket.on("complete-ride", async (data) => {
    try {
      const { rideId, captainId } = data || {};

      if (
        !mongoose.Types.ObjectId.isValid(rideId) ||
        !mongoose.Types.ObjectId.isValid(captainId)
      ) {
        socket.emit("ride-error", {
          message: "Invalid ride details.",
        });
        return;
      }

      const ride = await rideModel.findOne({
        _id: rideId,
        captain: captainId,
        status: "ongoing",
      });

      if (!ride) {
        socket.emit("ride-error", {
          message: "Ride not found or it has not started yet.",
        });
        return;
      }

      const captain = await captainModel.findById(captainId).select("location");

      if (
        !captain?.location ||
        !Number.isFinite(captain.location.ltd) ||
        !Number.isFinite(captain.location.lng)
      ) {
        socket.emit("ride-error", {
          message: "Captain location is unavailable. Please enable GPS.",
        });
        return;
      }

      const distance = getDistanceInMeters(
        captain.location,
        ride.destinationCoords,
      );

      if (distance > 50) {
        socket.emit("ride-error", {
          message: `You are ${Math.round(distance)} metres from destination. Get within 50 metres to complete the ride.`,
        });
        return;
      }

      const completedRide = await rideModel.findOneAndUpdate(
        {
          _id: rideId,
          captain: captainId,
          status: "ongoing",
        },
        { $set: { status: "completed" } },
        { new: true },
      );

      if (!completedRide) {
        socket.emit("ride-error", {
          message: "Ride status changed. Please try again.",
        });
        return;
      }

      const update = {
        rideId: completedRide._id.toString(),
        status: "completed",
      };

      io.to(`user_${completedRide.user}`).emit("ride-completed", update);
      io.to(`captain_${captainId}`).emit("ride-completed", update);
    } catch (error) {
      console.error("Ride completion error:", error);

      socket.emit("ride-error", {
        message: "Could not complete the ride.",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// 4. Start HTTP Server
server.listen(config.PORT, () => {
  console.log(`Backend is running at port ${config.PORT}`);
});
