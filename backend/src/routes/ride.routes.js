import express from "express";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import rideModel from "../models/ride.model.js";

const rideRouter = express.Router();

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    if (!decoded.id || !["rider", "captain"].includes(decoded.role)) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    req.auth = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

rideRouter.get("/active", requireAuth, async (req, res) => {
  try {
    const { id, role } = req.auth;

    // A rider must own the ride; a captain must be assigned to it.
    const ownershipFilter =
      role === "rider" ? { user: id } : { captain: id };

    const ride = await rideModel
      .findOne({
        ...ownershipFilter,
        status: { $in: ["accepted", "arrived", "ongoing"] },
      })
      .sort({ updatedAt: -1 })
      .select("-otp");

    if (!ride) {
      return res.status(404).json({
        active: false,
        message: "No active ride found",
      });
    }

    return res.status(200).json({
      active: true,
      ride,
    });
  } catch (error) {
    console.error("Active ride lookup failed:", error);

    return res.status(500).json({
      message: "Could not verify active ride",
    });
  }
});

export default rideRouter;