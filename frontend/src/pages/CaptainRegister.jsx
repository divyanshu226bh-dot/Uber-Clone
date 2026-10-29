
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/Api";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCarAlt,
  FaPalette,
  FaHashtag,
  FaUsers,
} from "react-icons/fa";
import { TbSteeringWheelFilled } from "react-icons/tb";

const CaptainRegister = () => {
  // Captain Personal Details
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Vehicle Details
  const [color, setColor] = useState("");
  const [plate, setPlate] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [vehicleType, setVehicleType] = useState("car");

  // UI States
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // REGISTER CAPTAIN
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register-captain", {
        username,
        email,
        password,
        vehicle: {
          color,
          plate,
          capacity: Number(capacity),
          vehicleType,
        },
      });

      if (response.status === 201) {
        setSuccessMsg(
          "Captain registered successfully! Redirecting to login..."
        );

        setTimeout(() => {
          navigate("/captain-login");
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Check vehicle details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF6F5] text-[#111111] flex flex-col justify-between selection:bg-[#990011] selection:text-white">
      {/* Top Header */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#111111]/10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#111111] hover:text-[#990011] transition-colors bg-white border border-[#111111]/10 px-4 py-2 rounded-full shadow-xs"
        >
          <FaArrowLeft /> Back to Home
        </Link>

        {/* Uber Driver Logo Badge */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter text-[#111111]">
            Uber
          </span>
          <span className="text-xs font-black uppercase tracking-wider bg-[#111111] text-[#FCF6F5] px-2.5 py-1 rounded-md">
            Driver
          </span>
        </div>
      </nav>

      {/* Main Container */}
      <main className="w-full max-w-lg mx-auto px-6 py-10 my-auto">
        <div className="bg-white border border-[#111111]/10 p-8 rounded-3xl shadow-sm">
          {/* Header Title */}
          <div className="flex flex-col gap-2 mb-8">
            <div className="w-12 h-12 bg-[#FCF6F5] border border-[#111111]/5 rounded-2xl flex items-center justify-center text-[#990011] mb-2 shadow-xs">
              <TbSteeringWheelFilled className="text-xl" />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-[#111111]">
              Register as a Captain
            </h2>

            <p className="text-xs font-medium text-zinc-500">
              Enter your personal and vehicle details to start driving with Uber.
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="mb-6 p-3.5 bg-[#990011]/10 border border-[#990011]/30 rounded-2xl text-[#990011] text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#990011] animate-ping"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert Box */}
          {successMsg && (
            <div className="mb-6 p-3.5 bg-emerald-950/10 border border-emerald-800/30 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Account Details Header */}
            <span className="text-xs font-black text-[#990011] uppercase tracking-wider">
              Account Info
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#111111]">
                  Username
                </label>
                <div className="relative flex items-center">
                  <FaUser className="absolute left-3.5 text-zinc-400 text-xs" />
                  <input
                    type="text"
                    required
                    placeholder="alex_driver"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#FCF6F5] border border-[#111111]/15 focus:border-[#990011] focus:bg-white focus:outline-none text-xs text-[#111111] font-medium pl-10 pr-3 py-3 rounded-2xl placeholder:text-zinc-400"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#111111]">
                  Email
                </label>
                <div className="relative flex items-center">
                  <FaEnvelope className="absolute left-3.5 text-zinc-400 text-xs" />
                  <input
                    type="email"
                    required
                    placeholder="alex@driver.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FCF6F5] border border-[#111111]/15 focus:border-[#990011] focus:bg-white focus:outline-none text-xs text-[#111111] font-medium pl-10 pr-3 py-3 rounded-2xl placeholder:text-zinc-400"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#111111]">
                Password
              </label>
              <div className="relative flex items-center">
                <FaLock className="absolute left-3.5 text-zinc-400 text-xs" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FCF6F5] border border-[#111111]/15 focus:border-[#990011] focus:bg-white focus:outline-none text-xs text-[#111111] font-medium pl-10 pr-10 py-3 rounded-2xl placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-zinc-400 hover:text-[#990011] text-xs transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Vehicle Details Header */}
            <span className="text-xs font-black text-[#990011] uppercase tracking-wider mt-2">
              Vehicle Info
            </span>

            <div className="grid grid-cols-2 gap-3">
              {/* Vehicle Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#111111]">
                  Color
                </label>
                <div className="relative flex items-center">
                  <FaPalette className="absolute left-3.5 text-zinc-400 text-xs" />
                  <input
                    type="text"
                    required
                    placeholder="Black"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-[#FCF6F5] border border-[#111111]/15 focus:border-[#990011] focus:bg-white focus:outline-none text-xs text-[#111111] font-medium pl-10 pr-3 py-3 rounded-2xl placeholder:text-zinc-400"
                  />
                </div>
              </div>

              {/* License Plate */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#111111]">
                  License Plate
                </label>
                <div className="relative flex items-center">
                  <FaHashtag className="absolute left-3.5 text-zinc-400 text-xs" />
                  <input
                    type="text"
                    required
                    placeholder="MH02AB1234"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="w-full bg-[#FCF6F5] border border-[#111111]/15 focus:border-[#990011] focus:bg-white focus:outline-none text-xs text-[#111111] font-bold uppercase pl-10 pr-3 py-3 rounded-2xl placeholder:normal-case placeholder:font-medium placeholder:text-zinc-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Passenger Capacity */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#111111]">
                  Capacity
                </label>
                <div className="relative flex items-center">
                  <FaUsers className="absolute left-3.5 text-zinc-400 text-xs" />
                  <input
                    type="number"
                    min={1}
                    max={8}
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full bg-[#FCF6F5] border border-[#111111]/15 focus:border-[#990011] focus:bg-white focus:outline-none text-xs text-[#111111] font-bold pl-10 pr-3 py-3 rounded-2xl"
                  />
                </div>
              </div>

              {/* Vehicle Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#111111]">
                  Vehicle Type
                </label>
                <div className="relative flex items-center">
                  <FaCarAlt className="absolute left-3.5 text-zinc-400 text-xs" />
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-[#FCF6F5] border border-[#111111]/15 focus:border-[#990011] focus:bg-white focus:outline-none text-xs text-[#111111] font-bold pl-10 pr-3 py-3 rounded-2xl appearance-none"
                  >
                    <option value="car">Car</option>
                    <option value="auto">Auto</option>
                    <option value="moto">Moto (Bike)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111111] text-[#FCF6F5] font-bold text-sm py-3.5 rounded-2xl hover:bg-[#990011] transition-colors mt-3 flex justify-center items-center gap-2 disabled:opacity-50 shadow-xs"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-[#FCF6F5] border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Sign Up as Captain"
              )}
            </button>
          </form>

          {/* Footer Navigation Link */}
          <div className="mt-8 pt-6 border-t border-[#111111]/10 text-center">
            <p className="text-xs font-medium text-zinc-500">
              Already registered as a Captain?{" "}
              <Link
                to="/captain-login"
                className="text-[#990011] font-bold underline underline-offset-4 hover:text-[#7a000e] transition-colors"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs font-semibold text-zinc-500">
        &copy; {new Date().getFullYear()} Uber Clone. All rights reserved.
      </footer>
    </div>
  );
};

export default CaptainRegister;
