import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import captainModel from "../models/captain.model.js";
import otpModel from "../models/otp.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { sendEmail } from "../services/email.service.js";
import { generateOtp, getOtpHtml } from "../utils/utils.js";

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
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email, and password are required.",
      });
    }

    // Check whether this username or email already exists.
    let user = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (user) {
      // Verified users cannot register again.
      if (
        user.verified ||
        user.username !== username ||
        user.email !== email
      ) {
        return res.status(409).json({
          message: "User is already registered.",
        });
      }

      // Existing unverified user: resend a fresh OTP.
    } else {
      // Prevent the same username/email being used by a captain.
      const existingCaptain = await captainModel.findOne({
        $or: [{ username }, { email }],
      });

      if (existingCaptain) {
        return res.status(409).json({
          message: "Username or email is already in use.",
        });
      }

      const hashPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

      user = await userModel.create({
        username,
        email,
        password: hashPassword,
      });
    }

    // Invalidate any previous OTP for this account.
    await otpModel.deleteMany({ user: user._id });

    const otp = generateOtp();
    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    await otpModel.create({
      email: user.email,
      user: user._id,
      otpHash,
    });

    try {
      const html = getOtpHtml(otp);

      await sendEmail(
        user.email,
        "OTP Verification",
        `Your OTP code is ${otp}`,
        html
      );
    } catch (emailError) {
      console.error("User OTP delivery failed:", emailError.message);

      return res.status(502).json({
        message:
          "Your account is saved but email delivery failed. Please try registering again to request a new OTP.",
        email: user.email,
        verified: false,
      });
    }

    return res.status(200).json({
      message: "OTP sent successfully. Please verify your email.",
      username: user.username,
      email: user.email,
      verified: user.verified,
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
    const { username, email, password, vehicle } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email, and password are required.",
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

    // Check if this username or email already exists.
    let captain = await captainModel.findOne({
      $or: [{ username }, { email }],
    });

    if (captain) {
      // Only allow a retry for the same, unverified captain.
      if (
        captain.verified ||
        captain.username !== username ||
        captain.email !== email
      ) {
        return res.status(409).json({
          message: "Captain is already registered.",
        });
      }

      // Existing unverified account: issue a fresh OTP.
    } else {
      // Check whether a rider already uses this username or email.
      const existingUser = await userModel.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Username or email is already in use.",
        });
      }

      const hashPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

      captain = await captainModel.create({
        username,
        email,
        password: hashPassword,
        vehicle,
        role: "captain",
      });
    }

    // Replace any previous OTP for this captain.
    await otpModel.deleteMany({ user: captain._id });

    const otp = generateOtp();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await otpModel.create({
      email: captain.email,
      user: captain._id,
      otpHash,
    });

    try {
      const html = getOtpHtml(otp);

      await sendEmail(
        captain.email,
        "Captain OTP Verification",
        `Your OTP code is ${otp}`,
        html,
      );
    } catch (emailError) {
      console.error("Captain OTP delivery failed:", emailError.message);

      return res.status(502).json({
        message:
          "Your account is saved but email delivery failed. Please try registering again to request a new OTP.",
        email: captain.email,
        verified: false,
      });
    }

    return res.status(200).json({
      message: "OTP sent successfully. Please verify your email.",
      username: captain.username,
      email: captain.email,
      verified: captain.verified,
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
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access token missing" });
  }

  const accessToken = authHeader.split(" ")[1];
  const decoded = jwt.verify(accessToken, config.JWT_SECRET);

  const { account, role } = await findAccountById(decoded.id);
  if (!account) return res.status(404).json({ message: "Account not found" });

  res.status(200).json({
    message: "Profile fetched successfully",
    username: account.username,
    email: account.email,
    role,
  });
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

// VERIFY EMAIL
export async function verifyEmail(req, res) {
  const { otp, email } = req.body;
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  const otpDoc = await otpModel.findOne({ email, otpHash });
  if (!otpDoc) return res.status(400).json({ message: "Invalid OTP" });

  let account = await userModel.findByIdAndUpdate(
    otpDoc.user,
    { verified: true },
    { new: true },
  );
  if (!account) {
    account = await captainModel.findByIdAndUpdate(
      otpDoc.user,
      { verified: true },
      { new: true },
    );
  }

  await otpModel.deleteMany({ user: otpDoc.user });

  return res.status(200).json({
    message: "Email verified successfully",
    user: {
      username: account.username,
      email: account.email,
      verified: account.verified,
    },
  });
}
