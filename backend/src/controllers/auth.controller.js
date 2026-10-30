import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import captainModel from "../models/captain.model.js";
import rideModel from "../models/ride.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

// Helper: Check both collections for user or captain
async function findAccountById(id) {
  let account = await userModel.findById(id);
  if (account) return { account, role: "rider" };
  account = await captainModel.findById(id);
  if (account) return { account, role: "captain" };
  return { account: null, role: null };
}

// REGISTER USER
export async function registerUser(req, res) {
  try {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password || !phone) {
      return res.status(400).json({
        message: "Username, email, password, and phone are required.",
      });
    }

    // Validate phone number.
    if (!/^\+?[0-9]{10,15}$/.test(phone.trim())) {
      return res.status(400).json({
        message: "Please enter a valid phone number.",
      });
    }

    // Check whether username or email already exists.
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username or email is already in use.",
      });
    }

    // Prevent username/email conflicts with captains.
    const existingCaptain = await captainModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingCaptain) {
      return res.status(409).json({
        message: "Username or email is already in use.",
      });
    }

    // Hash password using your existing logic.
    const hashPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const user = await userModel.create({
      username,
      email,
      phone: phone.trim(),
      password: hashPassword,
    });

    return res.status(201).json({
      message: "User registered successfully.",
      username: user.username,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    console.error("User registration error:", error);

    return res.status(500).json({
      message: "User registration failed. Please try again.",
    });
  }
}

// REGISTER CAPTAIN
export async function registerCaptain(req, res) {
  try {
    const { username, email, password, phone, vehicle } = req.body;

    if (!username || !email || !password || !phone) {
      return res.status(400).json({
        message: "Username, email, password, and phone are required.",
      });
    }

    // Validate phone number.
    if (!/^\+?[0-9]{10,15}$/.test(phone.trim())) {
      return res.status(400).json({
        message: "Please enter a valid phone number.",
      });
    }

    if (
      !vehicle ||
      !vehicle.color ||
      !vehicle.plate ||
      !vehicle.capacity ||
      !vehicle.vehicleType
    ) {
      return res.status(400).json({
        message:
          "Vehicle color, plate, capacity, and vehicleType are required.",
      });
    }

    // Check whether username or email already exists.
    const existingCaptain = await captainModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingCaptain) {
      return res.status(409).json({
        message: "Username or email is already in use.",
      });
    }

    // Prevent username/email conflicts with riders.
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username or email is already in use.",
      });
    }

    // Hash password using your existing logic.
    const hashPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const captain = await captainModel.create({
      username,
      email,
      phone: phone.trim(),
      password: hashPassword,
      vehicle,
      role: "captain",
    });

    return res.status(201).json({
      message: "Captain registered successfully.",
      username: captain.username,
      email: captain.email,
      phone: captain.phone,
    });
  } catch (error) {
    console.error("Captain registration error:", error);

    return res.status(500).json({
      message: "Captain registration failed. Please try again.",
    });
  }
}

// LOGIN CAPTAIN
export async function loginCaptain(req, res) {
  const { email, password } = req.body;

  const captain = await captainModel.findOne({ email });
  if (!captain)
    return res.status(401).json({ message: "Captain not registered" });
  if (!captain.verified)
    return res.status(401).json({ message: "Email not verified" });

  const passwordHash = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  if (captain.password !== passwordHash) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const refreshToken = jwt.sign(
    { id: captain._id, role: "captain" },
    config.JWT_SECRET,
    { expiresIn: "7d" },
  );
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await sessionModel.create({
    user: captain._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign(
    { id: captain._id, role: "captain" },
    config.JWT_SECRET,
    { expiresIn: "10m" },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "Captain logged in successfully",
    id: captain._id,
    username: captain.username,
    email: captain.email,
    role: "captain",
    accessToken,
  });
}

// LOGIN USER
export async function login(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) return res.status(401).json({ message: "User not registered" });
  if (!user.verified)
    return res.status(401).json({ message: "Email not verified" });

  const passwordHash = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  if (user.password !== passwordHash) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const refreshToken = jwt.sign(
    { id: user._id, role: "rider" },
    config.JWT_SECRET,
    { expiresIn: "7d" },
  );
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await sessionModel.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign(
    { id: user._id, role: "rider" },
    config.JWT_SECRET,
    { expiresIn: "10m" },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "User logged in successfully",
    id: user._id,
    username: user.username,
    email: user.email,
    role: "rider",
    accessToken,
  });
}

// GET ME
export async function getMe(req, res) {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token missing" });
    }

    const accessToken = authHeader.split(" ")[1];
    const decoded = jwt.verify(accessToken, config.JWT_SECRET);

    const { account, role } = await findAccountById(decoded.id);

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      username: account.username,
      email: account.email,
      phone: account.phone || "",
      role,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
}

// ROTATE TOKEN
export async function rotateToken(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "Refresh Token missing" });

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.findOne({
    user: decoded.id,
    refreshTokenHash,
    revoked: false,
  });

  if (!session)
    return res
      .status(401)
      .json({ message: "Invalid or revoked refresh token" });

  const { account, role } = await findAccountById(decoded.id);
  if (!account) return res.status(404).json({ message: "Account not found" });

  const newRefreshToken = jwt.sign(
    { id: account._id, role },
    config.JWT_SECRET,
    { expiresIn: "7d" },
  );
  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");
  const accessToken = jwt.sign({ id: account._id, role }, config.JWT_SECRET, {
    expiresIn: "10m",
  });

  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "Token Rotated Successfully",
    id: account._id,
    username: account.username,
    email: account.email,
    role,
    accessToken,
  });
}

// LOGOUT
export async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token missing" });

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  await sessionModel.findOneAndUpdate(
    { refreshTokenHash, revoked: false },
    { revoked: true },
  );

  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Logged out successfully" });
}

// LOGOUT ALL
export async function logoutAll(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "Token is missing" });

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
  await sessionModel.updateMany(
    { user: decoded.id, revoked: false },
    { revoked: true },
  );

  res.clearCookie("refreshToken");
  return res
    .status(200)
    .json({ message: "Logged out from all devices successfully" });
}

// UPDATE PROFILE FOR CAPTAIN AND USER
export async function updateProfile(req, res) {
  try {
    // 1. Get access token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access token missing.",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    // 2. Verify and decode access token
    const decoded = jwt.verify(accessToken, config.JWT_SECRET);

    const { id, role } = decoded;

    if (!id || !["rider", "captain"].includes(role)) {
      return res.status(401).json({
        message: "Invalid access token.",
      });
    }

    // 3. Get editable fields from request body
    const { username, phone } = req.body;

    const trimmedUsername = username?.trim();
    const trimmedPhone = phone?.trim();

    if (!trimmedUsername) {
      return res.status(400).json({
        message: "Name is required.",
      });
    }

    if (!trimmedPhone || !/^\+?[0-9]{10,15}$/.test(trimmedPhone)) {
      return res.status(400).json({
        message: "Please enter a valid phone number.",
      });
    }

    // 4. Select the correct model based on account role
    const Model = role === "rider" ? userModel : captainModel;

    // 5. Update only username and phone
    const updatedAccount = await Model.findByIdAndUpdate(
      id,
      {
        $set: {
          username: trimmedUsername,
          phone: trimmedPhone,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("_id username email phone");

    if (!updatedAccount) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    // 6. Send updated profile details
    return res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        _id: updatedAccount._id,
        username: updatedAccount.username,
        email: updatedAccount.email,
        phone: updatedAccount.phone,
        role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired access token. Please log in again.",
      });
    }

    return res.status(500).json({
      message: "Unable to update profile. Please try again.",
    });
  }
}

// GET RIDE HISTORY
export const getUserRideHistory = async (req, res) => {
  try {
    // Verify access token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access token required.",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const decoded = jwt.verify(accessToken, config.JWT_SECRET);

    // Ensure only a user can access this endpoint
    if (decoded.role !== "rider") {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    const userId = decoded.id;

    // Pagination: 5 rides per request
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 5;
    const skip = (page - 1) * limit;

    const rides = await rideModel
      .find({ user: userId })
      .select(
        "pickup destination fare status paymentMethod duration distance createdAt",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalRides = await rideModel.countDocuments({
      user: userId,
    });

    return res.status(200).json({
      message: "Ride history fetched successfully.",
      rides,
      pagination: {
        currentPage: page,
        limit,
        totalRides,
        hasMore: skip + rides.length < totalRides,
      },
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired access token.",
      });
    }

    console.error("Get user ride history error:", error);

    return res.status(500).json({
      message: "Unable to fetch ride history.",
    });
  }
};

// GET CAPTAIN EARNINGS
export const getCaptainEarnings = async (req, res) => {
  try {
    // Verify captain access token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access token required.",
      });
    }

    const accessToken = authHeader.split(" ")[1];
    const decoded = jwt.verify(accessToken, config.JWT_SECRET);

    if (!decoded.id || decoded.role !== "captain") {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    // Calculate today's date boundary in Indian Standard Time.
    const now = new Date();

    const todayParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);

    const dateParts = Object.fromEntries(
      todayParts.map(({ type, value }) => [type, value]),
    );

    const todayStart = new Date(
      `${dateParts.year}-${dateParts.month}-${dateParts.day}T00:00:00+05:30`,
    );

    const tomorrowStart = new Date(
      todayStart.getTime() + 24 * 60 * 60 * 1000,
    );

    // Aggregate completed rides belonging to this captain.
    const [result] = await rideModel.aggregate([
      {
        $match: {
          captain: new (await import("mongoose")).default.Types.ObjectId(
            decoded.id,
          ),
          status: "completed",
        },
      },
      {
        $facet: {
          allTime: [
            {
              $group: {
                _id: null,
                totalEarnings: { $sum: "$fare" },
                completedRides: { $sum: 1 },
              },
            },
          ],
          today: [
            {
              $match: {
                createdAt: {
                  $gte: todayStart,
                  $lt: tomorrowStart,
                },
              },
            },
            {
              $group: {
                _id: null,
                todayEarnings: { $sum: "$fare" },
                todayRides: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const allTime = result?.allTime?.[0] || {};
    const today = result?.today?.[0] || {};

    return res.status(200).json({
      message: "Captain earnings fetched successfully.",
      earnings: {
        allTime: allTime.totalEarnings || 0,
        today: today.todayEarnings || 0,
      },
      rides: {
        completed: allTime.completedRides || 0,
        today: today.todayRides || 0,
      },
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired access token.",
      });
    }

    console.error("Captain earnings error:", error);

    return res.status(500).json({
      message: "Unable to fetch captain earnings.",
    });
  }
};

