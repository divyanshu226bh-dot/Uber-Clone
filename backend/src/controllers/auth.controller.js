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
  const { username, email, password } = req.body;

  const isRegisteredBefore = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isRegisteredBefore) {
    return res.status(409).json({ message: "User is already registered" });
  }

  const hashPassword = crypto.createHash("sha256").update(password).digest("hex");

  const user = await userModel.create({
    username,
    email,
    password: hashPassword,
  });

  const otp = generateOtp();
  const html = getOtpHtml(otp);
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  await otpModel.create({ email, user: user._id, otpHash });
  await sendEmail(email, "OTP Verification", `Your OTP code is ${otp}`, html);

  res.status(201).json({
    message: "User registered successfully",
    username,
    email,
    verified: user.verified,
  });
}

// REGISTER CAPTAIN
export async function registerCaptain(req, res) {
  const { username, email, password, vehicle } = req.body;

  if (!vehicle || !vehicle.color || !vehicle.plate || !vehicle.capacity || !vehicle.vehicleType) {
    return res.status(400).json({
      message: "Vehicle color, plate, capacity, and vehicleType are required.",
    });
  }

  const isRegisteredBefore = await captainModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isRegisteredBefore) {
    return res.status(409).json({ message: "Captain is already registered" });
  }

  const hashPassword = crypto.createHash("sha256").update(password).digest("hex");

  const captain = await captainModel.create({
    username,
    email,
    password: hashPassword,
    vehicle,
    role: "captain",
  });

  const otp = generateOtp();
  const html = getOtpHtml(otp);
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  await otpModel.create({ email, user: captain._id, otpHash });
  await sendEmail(email, "Captain OTP Verification", `Your OTP code is ${otp}`, html);

  res.status(201).json({
    message: "Captain registered successfully. Please verify OTP.",
    username,
    email,
    verified: captain.verified,
  });
}

// LOGIN CAPTAIN
export async function loginCaptain(req, res) {
  const { email, password } = req.body;

  const captain = await captainModel.findOne({ email });
  if (!captain) return res.status(401).json({ message: "Captain not registered" });
  if (!captain.verified) return res.status(401).json({ message: "Email not verified" });

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  if (captain.password !== passwordHash) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const refreshToken = jwt.sign({ id: captain._id, role: "captain" }, config.JWT_SECRET, { expiresIn: "7d" });
  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  await sessionModel.create({
    user: captain._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign({ id: captain._id, role: "captain" }, config.JWT_SECRET, { expiresIn: "10m" });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
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
  if (!user.verified) return res.status(401).json({ message: "Email not verified" });

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  if (user.password !== passwordHash) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const refreshToken = jwt.sign({ id: user._id, role: "rider" }, config.JWT_SECRET, { expiresIn: "7d" });
  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  await sessionModel.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign({ id: user._id, role: "rider" }, config.JWT_SECRET, { expiresIn: "10m" });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
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
  if (!refreshToken) return res.status(401).json({ message: "Refresh Token missing" });

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  const session = await sessionModel.findOne({
    user: decoded.id,
    refreshTokenHash,
    revoked: false,
  });

  if (!session) return res.status(401).json({ message: "Invalid or revoked refresh token" });

  const { account, role } = await findAccountById(decoded.id);
  if (!account) return res.status(404).json({ message: "Account not found" });

  const newRefreshToken = jwt.sign({ id: account._id, role }, config.JWT_SECRET, { expiresIn: "7d" });
  const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
  const accessToken = jwt.sign({ id: account._id, role }, config.JWT_SECRET, { expiresIn: "10m" });

  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "Token Rotated Successfully",
    username: account.username,
    email: account.email,
    role,
    accessToken,
  });
}

// LOGOUT
export async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "Refresh token missing" });

  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  await sessionModel.findOneAndUpdate({ refreshTokenHash, revoked: false }, { revoked: true });

  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Logged out successfully" });
}

// LOGOUT ALL
export async function logoutAll(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "Token is missing" });

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
  await sessionModel.updateMany({ user: decoded.id, revoked: false }, { revoked: true });

  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Logged out from all devices successfully" });
}

// VERIFY EMAIL
export async function verifyEmail(req, res) {
  const { otp, email } = req.body;
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  const otpDoc = await otpModel.findOne({ email, otpHash });
  if (!otpDoc) return res.status(400).json({ message: "Invalid OTP" });

  let account = await userModel.findByIdAndUpdate(otpDoc.user, { verified: true }, { new: true });
  if (!account) {
    account = await captainModel.findByIdAndUpdate(otpDoc.user, { verified: true }, { new: true });
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