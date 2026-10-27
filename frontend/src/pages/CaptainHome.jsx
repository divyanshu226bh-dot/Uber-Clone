import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LiveMap from "../components/LiveMap";
import { SocketContext } from "../context/SocketContext";
import api from "../services/Api";
import {
  FaBars,
  FaTimes,
  FaPowerOff,
  FaWallet,
  FaClock,
  FaRoute,
  FaUserCircle,
  FaBell,
  FaArrowRight,
  FaQuestionCircle,
  FaCheck,
  FaMapMarkerAlt,
  FaLocationArrow,
} from "react-icons/fa";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CaptainHome = () => {
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  // Safely extract captain profile handling flat vs nested localStorage structures
  const rawCaptainData = JSON.parse(localStorage.getItem("captain") || "{}");
  const captain = rawCaptainData.captain || rawCaptainData;
  const captainId =
    captain._id || captain.id || localStorage.getItem("captainId");

  // Dashboard & Online States
  const [isOnline, setIsOnline] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeRideRequest, setActiveRideRequest] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Live Location Coordinates State
  const [currentCoords, setCurrentCoords] = useState(null);

  // Refs for GSAP
  const mainContainerRef = useRef(null);
  const mapSectionRef = useRef(null);
  const controlsSectionRef = useRef(null);

  // 1. Join Captain Socket Room on Mount
  useEffect(() => {
    if (captainId && socket) {
      console.log("⚡ Joining socket room for captain:", captainId);
      socket.emit("join", {
        userType: "captain",
        userId: captainId,
      });
    } else {
      console.warn(
        "⚠️ Cannot join socket room: Missing captainId or socket connection.",
      );
    }
  }, [captainId, socket]);

  // 2. Stream Real-Time Geolocation when Online
  useEffect(() => {
    let watchId;

    if (isOnline && socket) {
      if (!captainId) {
        console.error(
          "❌ Cannot stream location: Captain ID missing from localStorage!",
        );
        setStatusMessage(
          "Captain profile missing. Please log out and log in again.",
        );
        return;
      }

      if ("geolocation" in navigator) {
        console.log("📡 Starting GPS watchPosition for captain:", captainId);

        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            console.log("📍 Broadcasting Live Location:", latitude, longitude);

            // Update frontend state
            setCurrentCoords([latitude, longitude]);

            // Emit location update to backend over WebSockets
            socket.emit("update-location-captain", {
              captainId: captainId,
              location: {
                ltd: latitude,
                lng: longitude,
              },
            });
          },
          (error) => {
            console.error("GPS Watch Error:", error.message);
            setStatusMessage(
              "Unable to access GPS. Check location permissions in your browser.",
            );
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
        );
      } else {
        setStatusMessage("Geolocation is not supported by your browser.");
      }
    }

    // Cleanup GPS watcher on offline or unmount
    return () => {
      if (watchId) {
        console.log("🛑 Stopping GPS watchPosition...");
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isOnline, socket, captainId]);

  // 3. Listen for Real-Time Incoming Ride Requests via Socket.io
  useEffect(() => {
    if (!socket || !isOnline) {
      setActiveRideRequest(null);
      if (!isOnline) setStatusMessage("");
      return;
    }

    setStatusMessage("Finding nearby rider requests...");

    const handleNewRidePopup = (rideData) => {
      console.log("🚖 Received new ride request popup:", rideData);
      setActiveRideRequest(rideData);
    };

    socket.on("new-ride-popup", handleNewRidePopup);

    return () => {
      socket.off("new-ride-popup", handleNewRidePopup);
    };
  }, [socket, isOnline]);

  // Entrance Animations
  useEffect(() => {
    let ctx;
    const animationFrame = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        if (mapSectionRef.current) {
          gsap.fromTo(
            mapSectionRef.current,
            { opacity: 0, y: 30, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" },
          );
        }

        if (controlsSectionRef.current) {
          gsap.fromTo(
            controlsSectionRef.current.children,
            { opacity: 0, y: 25 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: "power2.out",
            },
          );
        }
      }, mainContainerRef);
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      if (ctx) ctx.revert();
    };
  }, []);

  // Logout Handler
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout-captain");
    } catch (err) {
      console.error("Logout failed on server:", err);
    } finally {
      localStorage.removeItem("captainToken");
      localStorage.removeItem("token");
      localStorage.removeItem("captain");
      localStorage.removeItem("accessToken");

      navigate("/captain-login");
    }
  };

  const handleToggleOnline = () => {
    setIsOnline((prev) => !prev);
  };

  // Captain accepts the ride

  const handleAcceptRide = () => {
    if (!activeRideRequest || !socket || !captainId) return;

    const acceptPayload = {
      rideId: activeRideRequest.rideId,
      userId: activeRideRequest.userId,
      captainData: {
        _id: captainId,
        fullname: captain.fullname || {
          firstname: "Captain",
          lastname: "Driver",
        },
        name: `${captain.fullname?.firstname || "Captain"} ${
          captain.fullname?.lastname || ""
        }`.trim(),
        phone: captain.phone || "",
        vehicle: captain.vehicle || {
          plate: "",
          vehicleType: activeRideRequest.vehicleType || "car",
        },
      },
    };

    // Ask the backend to accept the ride.
    // Navigation will happen only after confirmation.
    socket.emit("accept-ride", acceptPayload);
  };

  useEffect(() => {
    if (!socket) return;

    const handleRideAcceptConfirmed = (data) => {
      console.log("✅ Ride acceptance confirmed:", data);

      const acceptedRide = {
        ...activeRideRequest,
        ...data,
        rideId: data.rideId,
        userId: data.userId || activeRideRequest?.userId,
        pickup: data.pickup || activeRideRequest?.pickup,
        destination: data.destination || activeRideRequest?.destination,
        pickupCoords: data.pickupCoords || activeRideRequest?.pickupCoords,
        destinationCoords:
          data.destinationCoords || activeRideRequest?.destinationCoords,
        price: data.price ?? activeRideRequest?.price,
        paymentMethod:
          data.paymentMethod || activeRideRequest?.paymentMethod || "cash",
        status: data.status,
      };

      setActiveRideRequest(null);

      navigate("/captain-riding", {
        state: {
          ride: acceptedRide,
        },
      });
    };
    const handleRideError = (error) => {
      console.error("❌ Ride acceptance failed:", error.message);
      setStatusMessage(error.message || "Could not accept this ride.");
    };

    socket.on("ride-accept-confirmed", handleRideAcceptConfirmed);
    socket.on("ride-error", handleRideError);

    return () => {
      socket.off("ride-accept-confirmed", handleRideAcceptConfirmed);
      socket.off("ride-error", handleRideError);
    };
  }, [socket, navigate, activeRideRequest]);

  const handleDeclineRide = () => {
    setActiveRideRequest(null);
    setStatusMessage("Trip declined. Searching for next ride...");
  };

  return (
    <div
      ref={mainContainerRef}
      className="min-h-screen bg-[#FCF6F5] text-[#111111] selection:bg-[#990011] selection:text-white"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#111111]/10 bg-[#FCF6F5]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/captain-home" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-[#111111]">
              Uber<span className="text-[#990011]">.</span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider bg-[#111111] text-[#FCF6F5] px-2.5 py-1 rounded-md">
              Driver
            </span>
          </Link>

          <div className="hidden items-center gap-6 sm:flex">
            <button
              onClick={() => navigate("/captain-earnings")}
              className="flex items-center gap-2 text-sm font-bold text-[#111111]/80 transition hover:text-[#990011]"
            >
              <FaWallet className="text-[#990011]" />
              Earnings
            </button>

            <button
              onClick={() => navigate("/captain-profile")}
              className="flex items-center gap-2 text-sm font-bold text-[#111111]/80 transition hover:text-[#990011]"
            >
              <FaUserCircle className="text-[#990011]" />
              Profile
            </button>

            <button
              onClick={handleLogout}
              className="rounded-full border border-[#111111]/10 bg-[#111111] px-5 py-2 text-sm font-bold text-[#FCF6F5] transition hover:bg-[#990011] shadow-xs"
            >
              Log out
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full border border-[#111111]/10 bg-white p-3 sm:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-[#111111]/10 bg-white px-5 py-4 sm:hidden shadow-lg">
            <div className="mx-auto flex flex-col gap-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/captain-earnings");
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-[#111111] hover:bg-[#FCF6F5]"
              >
                <FaWallet className="text-[#990011]" /> Earnings
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/captain-profile");
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-[#111111] hover:bg-[#FCF6F5]"
              >
                <FaUserCircle className="text-[#990011]" /> Profile
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/captain-help");
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-[#111111] hover:bg-[#FCF6F5]"
              >
                <FaQuestionCircle className="text-[#990011]" /> Help Center
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-[#990011] hover:bg-[#990011]/10"
              >
                <FaPowerOff /> Log out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Dashboard */}
      <main className="mx-auto grid max-w-7xl gap-5 p-4 sm:p-6 lg:grid-cols-[1.7fr_1fr] lg:p-8">
        {/* Map Area Section */}
        <section
          ref={mapSectionRef}
          className="relative h-[480px] sm:h-[520px] lg:h-[calc(100vh-140px)] max-h-[620px] overflow-hidden rounded-3xl border border-[#111111]/10 bg-white shadow-sm"
        >
          <LiveMap
            center={currentCoords || [26.801, 75.8058]}
            zoom={14}
            markers={
              currentCoords
                ? [
                    {
                      position: currentCoords,
                      popup: "Your Live Location (Jaipur)",
                    },
                  ]
                : []
            }
          />
        </section>

        {/* Dashboard Controls Section */}
        <section ref={controlsSectionRef} className="flex flex-col gap-5">
          {/* Online / Offline Toggle Container */}
          <div
            className={`rounded-3xl border p-5 sm:p-6 shadow-xs transition-all duration-300 ${
              isOnline
                ? "bg-emerald-50/70 border-emerald-200"
                : "bg-white border-[#111111]/10"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className={`text-xs font-black uppercase tracking-wider ${
                    isOnline ? "text-emerald-700" : "text-[#990011]"
                  }`}
                >
                  Driving Status
                </p>
                <h1 className="mt-1 text-2xl font-black text-[#111111] sm:text-3xl">
                  {isOnline ? "You're online." : "You're offline."}
                </h1>
                <p className="mt-2 max-w-xs text-xs font-medium leading-relaxed text-zinc-600">
                  {isOnline
                    ? "Your status is active. Nearby rider requests will appear automatically on your screen."
                    : "Go online to start receiving ride requests in your city."}
                </p>
                {statusMessage && (
                  <p className="mt-2 text-xs font-semibold text-[#990011]">
                    {statusMessage}
                  </p>
                )}
              </div>

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition ${
                  isOnline
                    ? "bg-emerald-200 text-emerald-800"
                    : "bg-[#FCF6F5] text-zinc-400"
                }`}
              >
                <FaPowerOff className="text-xl" />
              </div>
            </div>

            {/* Main Online Toggle Button */}
            <button
              onClick={handleToggleOnline}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition shadow-xs ${
                isOnline
                  ? "bg-emerald-700 text-white hover:bg-emerald-800"
                  : "bg-[#990011] text-white hover:bg-[#7a000e]"
              }`}
            >
              <FaPowerOff />
              {isOnline ? "Go offline" : "Go online"}
            </button>
          </div>

          {/* Today's Earnings Card */}
          <div className="rounded-3xl border border-[#111111]/10 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#990011]">
                  Today's Earnings
                </p>
                <h2 className="mt-1 text-3xl font-black text-[#111111]">
                  ₹0.00
                </h2>
                <p className="mt-1 text-xs font-medium text-zinc-500">
                  Completed ride fares will accumulate here.
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FCF6F5] text-[#990011]">
                <FaWallet className="text-xl" />
              </div>
            </div>

            <button
              onClick={() => navigate("/captain-earnings")}
              className="mt-5 flex w-full items-center justify-between border-t border-[#111111]/10 pt-4 text-xs font-bold text-[#111111] transition hover:text-[#990011]"
            >
              View detailed earnings
              <FaArrowRight className="text-[#990011]" />
            </button>
          </div>

          {/* Summary Activity */}
          <div className="rounded-3xl border border-[#111111]/10 bg-white p-5 sm:p-6 shadow-xs">
            <h2 className="text-sm font-black text-[#111111] uppercase tracking-wider">
              Today's Summary
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#111111]/10 bg-[#FCF6F5] p-4">
                <FaRoute className="text-base text-[#990011]" />
                <p className="mt-3 text-2xl font-black text-[#111111]">0</p>
                <p className="mt-0.5 text-xs font-medium text-zinc-500">
                  Completed Trips
                </p>
              </div>

              <div className="rounded-2xl border border-[#111111]/10 bg-[#FCF6F5] p-4">
                <FaClock className="text-base text-[#990011]" />
                <p className="mt-3 text-2xl font-black text-[#111111]">0 hrs</p>
                <p className="mt-0.5 text-xs font-medium text-zinc-500">
                  Hours Online
                </p>
              </div>
            </div>
          </div>

          {/* Support Shortcut */}
          <button
            onClick={() => navigate("/captain-help")}
            className="flex items-center gap-4 rounded-3xl border border-[#111111]/10 bg-white p-5 text-left transition hover:border-[#990011]/40 shadow-xs"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FCF6F5] text-[#990011]">
              <FaBell className="text-base" />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-bold text-[#111111]">
                Help & Support
              </h3>
              <p className="mt-0.5 text-xs font-medium text-zinc-500">
                Contact support or view driver assistance FAQs.
              </p>
            </div>

            <FaArrowRight className="shrink-0 text-xs text-[#990011]" />
          </button>
        </section>
      </main>

      {/* Real-Time Incoming Ride Pop-up Overlay */}
      {activeRideRequest && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#111111]/10">
            <div className="flex items-center justify-between border-b border-[#111111]/10 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#990011]">
                New Ride Request
              </span>
              <span className="text-base font-black text-emerald-700">
                ₹{activeRideRequest.price || 145}
              </span>
            </div>

            <div className="my-4 space-y-3 text-xs font-semibold text-zinc-700">
              <p className="flex items-center gap-2 truncate">
                <FaLocationArrow className="text-emerald-600 shrink-0" />
                <span className="truncate">
                  <strong>Pickup:</strong> {activeRideRequest.pickup}
                </span>
              </p>
              <p className="flex items-center gap-2 truncate">
                <FaMapMarkerAlt className="text-[#990011] shrink-0" />
                <span className="truncate">
                  <strong>Dropoff:</strong> {activeRideRequest.destination}
                </span>
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDeclineRide}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#111111]/10 bg-zinc-100 py-3.5 text-xs font-bold text-zinc-600 hover:bg-zinc-200 transition"
              >
                <FaTimes /> Decline
              </button>
              <button
                onClick={handleAcceptRide}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#990011] py-3.5 text-xs font-bold text-white hover:bg-[#7a000e] transition shadow-xs"
              >
                <FaCheck /> Accept Ride
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-[#111111]/10 bg-white px-5 py-8 text-center text-xs font-medium text-zinc-500">
        <p className="font-bold text-[#111111]">Uber Captain Platform</p>
        <p className="mt-1">Drive when you want. Earn on your terms.</p>
      </footer>
    </div>
  );
};

export default CaptainHome;
