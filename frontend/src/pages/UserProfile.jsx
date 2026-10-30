
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/Api";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEdit,
  FaCheck,
  FaTimes,
  FaShieldAlt,
} from "react-icons/fa";

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email] = useState(user?.email || "");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Keep the form synchronized if authenticated user data loads later.
  useEffect(() => {
    setUsername(user?.username || "");
    setPhone(user?.phone || "");
  }, [user]);

  const handleCancel = () => {
    setUsername(user?.username || "");
    setPhone(user?.phone || "");
    setIsEditing(false);
    setMessage("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedUsername) {
      setMessageType("error");
      setMessage("Please enter your name.");
      return;
    }

    if (!/^\+?[0-9]{10,15}$/.test(trimmedPhone)) {
      setMessageType("error");
      setMessage("Please enter a valid phone number (10–15 digits).");
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");

      // Backend endpoint to be added in user routes.
      const response = await api.put("/auth/update-profile", {
        username: trimmedUsername,
        phone: trimmedPhone,
      });

      const updatedUser = response.data.user;

      if (updatedUser) {
        setUser((previousUser) => ({
          ...previousUser,
          ...updatedUser,
        }));
      } else {
        setUser((previousUser) => ({
          ...previousUser,
          username: trimmedUsername,
          phone: trimmedPhone,
        }));
      }

      setMessageType("success");
      setMessage("Your profile has been updated successfully.");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);

      setMessageType("error");
      setMessage(
        error.response?.data?.message ||
          "Unable to update your profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF6F5] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-7 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/home")}
            aria-label="Go back"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#111111]/10 bg-white text-[#111111] transition hover:bg-[#990011] hover:text-white"
          >
            <FaArrowLeft />
          </button>

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#990011]">
              Account settings
            </p>
            <h1 className="mt-1 text-2xl font-black text-[#111111] sm:text-3xl">
              My Profile
            </h1>
          </div>
        </div>

        {/* Profile Card */}
        <section className="overflow-hidden rounded-3xl border border-[#111111]/10 bg-white shadow-sm">
          <div className="bg-[#990011] px-6 py-7 text-white sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                <FaUser />
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-xl font-black">
                  {user?.username || "Your Account"}
                </h2>
                <p className="mt-1 text-sm text-white/75">
                  Manage your personal information
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-[#111111]">
                  Personal information
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Keep your account details up to date.
                </p>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setMessage("");
                    setIsEditing(true);
                  }}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-[#990011]/10 px-4 py-2.5 text-xs font-bold text-[#990011] transition hover:bg-[#990011]/20"
                >
                  <FaEdit />
                  Edit
                </button>
              )}
            </div>

            {message && (
              <div
                role={messageType === "error" ? "alert" : "status"}
                className={`mb-5 rounded-2xl border p-4 text-sm font-semibold ${
                  messageType === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-xs font-bold text-zinc-600"
                >
                  Full name
                </label>

                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#990011]" />

                  <input
                    id="profile-name"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    disabled={!isEditing || isSaving}
                    placeholder="Enter your name"
                    className="w-full rounded-2xl border border-[#111111]/10 bg-[#FCF6F5] py-4 pl-11 pr-4 text-sm font-semibold text-[#111111] outline-none transition focus:border-[#990011] disabled:cursor-not-allowed disabled:opacity-75"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 flex items-center gap-2 text-xs font-bold text-zinc-600"
                >
                  Email address
                  <span className="rounded-md bg-zinc-100 px-2 py-1 text-[9px] font-black uppercase text-zinc-500">
                    Locked
                  </span>
                </label>

                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />

                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full cursor-not-allowed rounded-2xl border border-[#111111]/10 bg-zinc-100 py-4 pl-11 pr-12 text-sm font-semibold text-zinc-500"
                  />

                  <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                </div>

                <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-red-600">
                  <FaShieldAlt className="mt-0.5 shrink-0" />
                  Your email address cannot be changed because it is used to
                  identify and secure your Codiv account.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="profile-phone"
                  className="mb-2 block text-xs font-bold text-zinc-600"
                >
                  Phone number
                </label>

                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#990011]" />

                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    disabled={!isEditing || isSaving}
                    placeholder="Enter your phone number"
                    className="w-full rounded-2xl border border-[#111111]/10 bg-[#FCF6F5] py-4 pl-11 pr-4 text-sm font-semibold text-[#111111] outline-none transition focus:border-[#990011] disabled:cursor-not-allowed disabled:opacity-75"
                  />
                </div>
              </div>

              {/* Actions */}
              {isEditing && (
                <div className="flex flex-col-reverse gap-3 border-t border-[#111111]/10 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-[#111111]/15 px-5 py-3.5 text-sm font-bold text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50"
                  >
                    <FaTimes />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-[#990011] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#7a000e] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaCheck />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Account security note */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#111111]/10 bg-white p-4">
          <FaShieldAlt className="mt-0.5 shrink-0 text-[#990011]" />
          <div>
            <p className="text-sm font-bold text-[#111111]">
              Your account, your information
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Keep your phone number current so your captain can contact you
              when needed. Your account email remains unchanged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
