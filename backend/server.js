import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import config from "./src/config/config.js";
import connectDb from "./src/config/database.js";
import captainModel from "./src/models/captain.model.js";
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
  socket.on("create-ride", (rideData) => {
    console.log(`🚖 New ride requested by user: ${rideData.userId}`);
    // Broadcast ride proposal to all active online captains
    io.to("captains").emit("new-ride-popup", rideData);
  });

  // Captain accepts the ride
  socket.on("accept-ride", (data) => {
    const { rideId, userId, captainData } = data;
    console.log(`✅ Ride ${rideId} accepted by captain: ${captainData?.name}`);

    // Notify the specific rider in their private user room
    io.to(`user_${userId}`).emit("ride-accepted", {
      rideId,
      captain: captainData,
    });
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

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// 4. Start HTTP Server
server.listen(config.PORT, () => {
  console.log(`Backend is running at port ${config.PORT}`);
});
