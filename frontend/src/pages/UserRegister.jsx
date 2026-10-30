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
  FaCar,
  FaPhone,
} from "react-icons/fa";

const UserRegister = () => {
  // Registration form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Register User
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        phone,
        password,
      });

      if (response.status === 201) {
        setSuccessMsg("Registration successful! Redirecting to login...");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
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

        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter text-[#111111]">
            Uber<span className="text-[#990011]">.</span>
          </span>
        </div>
      </nav>

      {/* Main Form Container */}
      <main className="w-full max-w-md mx-auto px-6 py-10 my-auto">
        <div className="bg-white border border-[#111111]/10 p-8 rounded-3xl shadow-sm">
          {/* Header Title */}
          <div className="flex flex-col gap-2 mb-8">
            <div className="w-12 h-12 bg-[#FCF6F5] border border-[#111111]/5 rounded-2xl flex items-center justify-center text-[#990011] mb-2 shadow-xs">
              <FaCar className="text-xl" />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-[#111111]">
              Create Rider Account
            </h2>

            <p className="text-xs font-medium text-zinc-500">
              Sign up to request rides and reach your destination safely.
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
            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#111111]">
                Username
              </label>

              <div className="relative flex items-center">
                <FaUser className="absolute left-4 text-zinc-400 text-sm" />

                <input
                  type="text"
                  required
                  placeholder="john_doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#FCF6F5] border border-[#111111]/15 focus:border-[#990011] focus:bg-white focus:outline-none text-sm text-[#111111] font-medium pl-11 pr-4 py-3 rounded-2xl transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#111111]">
                Email Address
              </label>

              <div className="relative flex items-center">
                <FaEnvelope className="absolute left-4 text-zinc-400 text-sm" />

                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FCF6F5] border border-[#111111]/15 focus:border-[#990011] focus:bg-white focus:outline-none text-sm text-[#111111] font-medium pl-11 pr-4 py-3 rounded-2xl transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#111111]">
                Phone Number
              </label>

              <div className="relative flex items-center">
                <FaPhone className="absolute left-4 text-zinc-400 text-sm" />

                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  pattern="\+?[0-9]{10,15}"
                  title="Enter a valid phone number with 10–15 digits."
                  className="w-full bg-[#FCF6F5] border border-[#111111]/15 focus:border-[#990011] focus:bg-white focus:outline-none text-sm text-[#111111] font-medium pl-11 pr-4 py-3 rounded-2xl transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#111111]">
                Password
              </label>

              <div className="relative flex items-center">
                <FaLock className="absolute left-4 text-zinc-400 text-sm" />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FCF6F5] border border-[#111111]/15 focus:border-[#990011] focus:bg-white focus:outline-none text-sm text-[#111111] font-medium pl-11 pr-11 py-3 rounded-2xl transition-all placeholder:text-zinc-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-zinc-400 hover:text-[#990011] transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#990011] text-white font-bold text-sm py-3.5 rounded-2xl hover:bg-[#7a000e] transition-colors mt-3 flex justify-center items-center gap-2 disabled:opacity-50 shadow-xs"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Sign Up as Rider"
              )}
            </button>
          </form>

          {/* Footer Navigation Link */}
          <div className="mt-8 pt-6 border-t border-[#111111]/10 text-center">
            <p className="text-xs font-medium text-zinc-500">
              Already registered?{" "}
              <Link
                to="/login"
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

export default UserRegister;
