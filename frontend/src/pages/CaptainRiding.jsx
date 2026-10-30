import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import LiveMap from "../components/LiveMap";
import {
  FaArrowLeft,
  FaCar,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
  FaUser,
  FaWallet,
} from "react-icons/fa";

const DEFAULT_CENTER = [26.801, 75.8058];

const CaptainRiding = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { socket } = useContext(SocketContext);

  const ride = state?.ride || state || {};

  const {
    rideId,
    userId,
    rider = {},
    pickup = "",
    destination = "",
    pickupCoords = null,
    destinationCoords = null,
    price = 0,
    paymentMethod = "cash",
    status: initialStatus = "accepted",
  } = ride;

  const rawCaptain = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("captain") || "{}");
    } catch {
      return {};
    }
  }, []);

  const captain = rawCaptain.captain || rawCaptain;
  const captainId =
    captain._id || captain.id || localStorage.getItem("captainId");

  const [rideStatus, setRideStatus] = useState(initialStatus);
  const [otp, setOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [captainLocation, setCaptainLocation] = useState(null);
  const [locationReceived, setLocationReceived] = useState(false);
  const [busy, setBusy] = useState(false);
  const [routePositions, setRoutePositions] = useState([]);
  const [routeError, setRouteError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showRiderPhone, setShowRiderPhone] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);

  const isArrived = rideStatus === "arrived";
  const isOngoing = rideStatus === "ongoing";
  const isCompleted = rideStatus === "completed";

  const handleCopyPhone = async () => {
    if (!rider?.phone) return;

    try {
      await navigator.clipboard.writeText(rider.phone);
      setPhoneCopied(true);

      setTimeout(() => {
        setPhoneCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Unable to copy phone number:", error);
    }
  };

  // Join the captain's personal room.
  useEffect(() => {
    if (!socket || !captainId) return;

    socket.emit("join", {
      userType: "captain",
      userId: captainId,
    });
  }, [socket, captainId]);

  // If the captain opens this page without ride details, return to dashboard.
  useEffect(() => {
    if (!rideId || !userId || !captainId) {
      setErrorMessage(
        "Ride details are missing. Please return to your dashboard.",
      );
    }
  }, [rideId, userId, captainId]);

  // Stream captain GPS while this ride screen is active.
  useEffect(() => {
    if (!socket || !captainId || isCompleted) return;

    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by this browser.");
      return;
    }

    let watchId;

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          ltd: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCaptainLocation([location.ltd, location.lng]);
        setLocationReceived(true);

        socket.emit("update-location-captain", {
          captainId,
          location,
        });
      },
      (error) => {
        console.error("Captain GPS error:", error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      },
    );

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [socket, captainId, isCompleted]);

  useEffect(() => {
    // Don't draw a route before GPS is available or after completion.
    if (!captainLocation || isCompleted) {
      setRoutePositions([]);
      setRouteError("");
      return;
    }

    // Before the ride starts: pickup.
    // After OTP verification: destination.
    const targetCoords = isOngoing ? destinationCoords : pickupCoords;

    if (
      !targetCoords ||
      !Number.isFinite(Number(targetCoords.lat)) ||
      !Number.isFinite(Number(targetCoords.lng))
    ) {
      setRoutePositions([]);
      setRouteError("Route coordinates are unavailable.");
      return;
    }

    const controller = new AbortController();

    const fetchRoute = async () => {
      try {
        const start = `${captainLocation[1]},${captainLocation[0]}`;
        const end = `${targetCoords.lng},${targetCoords.lat}`;

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Route service request failed.");
        }

        const data = await response.json();

        if (data.code !== "Ok" || !data.routes?.length) {
          throw new Error("No driving route found.");
        }

        const positions = data.routes[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng],
        );

        setRoutePositions(positions);
        setRouteError("");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Route fetch error:", error);
          setRouteError("Unable to load the driving route.");
        }
      }
    };

    fetchRoute();

    return () => controller.abort();
  }, [
    captainLocation,
    pickupCoords,
    destinationCoords,
    isOngoing,
    isCompleted,
  ]);

  useEffect(() => {
    if (rideStatus !== "completed") return;

    const timer = setTimeout(() => {
      navigate("/captain-home", { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [rideStatus, navigate]);

  // Listen for ride status and OTP responses from the backend.
  useEffect(() => {
    if (!socket) return;

    const handleArrival = (data) => {
      if (data?.rideId !== rideId) return;

      setRideStatus("arrived");
      setErrorMessage("");
      setBusy(false);
    };

    const handleStarted = (data) => {
      if (data?.rideId !== rideId) return;
      setRideStatus("ongoing");
      setOtpMessage("OTP verified. Ride started.");
      setErrorMessage("");
      setBusy(false);
    };

    const handleCompleted = (data) => {
      if (data?.rideId !== rideId) return;
      setRideStatus("completed");
      setBusy(false);
    };

    const handleOtpResult = (data) => {
      setBusy(false);
      setOtpMessage(data?.message || "");

      if (data?.success) {
        setRideStatus("ongoing");
        setOtp("");
        setErrorMessage("");
      }
    };

    const handleRideError = (data) => {
      setBusy(false);
      setErrorMessage(data?.message || "Something went wrong.");
    };

    const handleStatusUpdate = (data) => {
      if (data?.rideId !== rideId) return;

      if (["arrived", "ongoing", "completed"].includes(data.status)) {
        setRideStatus(data.status);
        setBusy(false);
      }
    };

    socket.on("captain-arrived", handleArrival);
    socket.on("ride-started", handleStarted);
    socket.on("ride-completed", handleCompleted);
    socket.on("otp-verification-result", handleOtpResult);
    socket.on("ride-error", handleRideError);
    socket.on("ride-status-updated", handleStatusUpdate);

    return () => {
      socket.off("captain-arrived", handleArrival);
      socket.off("ride-started", handleStarted);
      socket.off("ride-completed", handleCompleted);
      socket.off("otp-verification-result", handleOtpResult);
      socket.off("ride-error", handleRideError);
      socket.off("ride-status-updated", handleStatusUpdate);
    };
  }, [socket, rideId]);

  // Handle ride cancellation
  useEffect(() => {
    if (!socket || !rideId) return;

    const handleRideCancelled = (data) => {
      if (String(data?.rideId) !== String(rideId)) return;

      console.log("🚫 Ride cancelled:", data);

      setIsCancelling(false);
      setRideStatus("cancelled");
      setBusy(false);
      setErrorMessage(data?.message || "This ride has been cancelled.");

      navigate("/captain-home", {
        replace: true,
        state: {
          message: data?.message || "This ride has been cancelled.",
        },
      });
    };

    socket.on("ride-cancelled", handleRideCancelled);

    return () => {
      socket.off("ride-cancelled", handleRideCancelled);
    };
  }, [socket, rideId, navigate]);

  const handleArrived = () => {
    if (!socket || !rideId || !userId || !captainId || busy) return;

    setBusy(true);
    setErrorMessage("");

    socket.emit("captain-arrived", {
      rideId,
      userId,
      captainId,
    });
  };

  const handleVerifyOtp = (event) => {
    event.preventDefault();

    if (!/^\d{4}$/.test(otp)) {
      setOtpMessage("Enter the four-digit OTP given by the rider.");
      return;
    }

    if (!socket || !rideId || !captainId || busy) return;

    setBusy(true);
    setErrorMessage("");
    setOtpMessage("");

    socket.emit("verify-ride-otp", {
      rideId,
      captainId,
      otp,
    });
  };

  const handleCompleteRide = () => {
    if (!socket || !rideId || !captainId || busy) return;

    setBusy(true);
    setErrorMessage("");

    socket.emit("complete-ride", {
      rideId,
      captainId,
    });
  };

  const handleCancelRide = () => {
    if (!socket?.connected || !rideId || !captainId || isCancelling) return;

    setIsCancelling(true);
    setErrorMessage("");

    socket.emit("cancel-ride", {
      rideId,
      userId,
      captainId,
      cancelledBy: "captain",
    });
  };

  const mapCenter = captainLocation || DEFAULT_CENTER;

  const markers = captainLocation
    ? [
        {
          position: captainLocation,
          popup: "Your live location",
        },
      ]
    : [];

  const riderName = rider.username || "Rider";
  const riderEmail = rider.email || "";

  const statusLabel =
    {
      accepted: "Heading to pickup",
      arrived: "Arrived at pickup",
      ongoing: "Ride in progress",
      completed: "Ride completed",
    }[rideStatus] || "Ride confirmed";

  return (
    <div className="min-h-screen bg-[#FCF6F5] text-[#111111]">
      <header className="sticky top-0 z-40 border-b border-[#111111]/10 bg-[#FCF6F5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button
            onClick={() => navigate("/captain-home")}
            className="flex items-center gap-2 rounded-full border border-[#111111]/10 bg-white px-4 py-2.5 text-sm font-bold transition hover:border-[#990011]/40"
          >
            <FaArrowLeft className="text-[#990011]" />
            Dashboard
          </button>

          <span className="text-xl font-black tracking-tight">
            Uber<span className="text-[#990011]">.</span>
          </span>

          <span className="rounded-full bg-[#990011]/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#990011]">
            Captain
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 p-4 sm:p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
        <div className="space-y-5">
          <section className="rounded-3xl border border-[#111111]/10 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#990011]/10 text-[#990011]">
                {isCompleted ? (
                  <FaCheckCircle className="text-xl" />
                ) : (
                  <FaCar className="text-xl" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-wider text-[#990011]">
                  Current trip
                </p>
                <h1 className="mt-1 text-xl font-black sm:text-2xl">
                  {statusLabel}
                </h1>
                <p className="mt-2 text-sm text-zinc-600">
                  {isCompleted
                    ? "This trip is complete. Thanks for driving."
                    : isOngoing
                      ? "Follow the route to the destination and finish the trip when you arrive."
                      : isArrived
                        ? "Meet the rider and ask them for the four-digit ride OTP."
                        : "Follow the pickup details and mark your arrival when you reach the rider."}
                </p>
              </div>

              <span
                className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                  isCompleted
                    ? "bg-zinc-400"
                    : isOngoing
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                }`}
              />
            </div>

            {["accepted", "arrived"].includes(rideStatus) && (
              <button
                type="button"
                onClick={handleCancelRide}
                disabled={isCancelling || busy}
                className="mt-4 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel ride"}
              </button>
            )}
          </section>

          <section className="relative h-[350px] overflow-hidden rounded-3xl border border-[#111111]/10 bg-white shadow-sm sm:h-[440px] lg:h-[520px]">
            <LiveMap
              center={mapCenter}
              zoom={15}
              markers={markers}
              pickupPosition={
                pickupCoords
                  ? [Number(pickupCoords.lat), Number(pickupCoords.lng)]
                  : null
              }
              destinationPosition={
                destinationCoords
                  ? [
                      Number(destinationCoords.lat),
                      Number(destinationCoords.lng),
                    ]
                  : null
              }
              routePositions={routePositions}
            />

            {routeError && (
              <p className="absolute bottom-3 left-3 right-3 z-[400] rounded-xl bg-white p-3 text-xs font-semibold text-red-700 shadow">
                {routeError}
              </p>
            )}

            <div className="absolute left-3 top-3 z-[400] rounded-2xl border border-[#111111]/10 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    locationReceived ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="text-xs font-bold">
                  {locationReceived ? "GPS active" : "Waiting for GPS"}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#111111]/10 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-wider text-[#990011]">
              Trip details
            </p>

            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <FaLocationArrow className="mt-1 shrink-0 text-emerald-700" />
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Pickup
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold">
                    {pickup || "Pickup unavailable"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <FaMapMarkerAlt className="mt-1 shrink-0 text-[#990011]" />
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Destination
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold">
                    {destination || "Destination unavailable"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#111111]/10 bg-[#FCF6F5] p-4">
                <FaWallet className="text-[#990011]" />
                <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Fare
                </p>
                <p className="mt-1 text-xl font-black">
                  ₹{Number(price || 0).toFixed(2)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#111111]/10 bg-[#FCF6F5] p-4">
                <FaClock className="text-[#990011]" />
                <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Payment
                </p>
                <p className="mt-1 text-xl font-black capitalize">
                  {paymentMethod}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-3xl border border-[#111111]/10 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-wider text-[#990011]">
              Rider information
            </p>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#990011]/10 text-[#990011]">
                <FaUser className="text-lg" />
              </div>
              <div className="min-w-0">
                <h2 className="break-words text-lg font-black">{riderName}</h2>
                {riderEmail ? (
                  <p className="mt-1 flex items-center gap-2 break-all text-xs text-zinc-500">
                    <FaEnvelope className="shrink-0 text-[#990011]" />
                    {riderEmail}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-zinc-500">
                    Rider email unavailable
                  </p>
                )}
              </div>
            </div>

            <div className="relative mt-4">
              <button
                type="button"
                onClick={() => setShowRiderPhone((prev) => !prev)}
                disabled={!rider?.phone}
                aria-label="Show rider phone number"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#990011] text-white transition hover:bg-[#7a000e] disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                <FaPhoneAlt />
              </button>

              {showRiderPhone && rider?.phone && (
                <div className="mt-3 w-full rounded-2xl border border-[#111111]/10 bg-[#FCF6F5] p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Rider's phone number
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="break-all text-sm font-bold text-[#111111]">
                      {rider.phone}
                    </p>

                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="shrink-0 rounded-xl bg-[#990011]/10 px-3 py-2 text-xs font-bold text-[#990011] transition hover:bg-[#990011]/20"
                    >
                      {phoneCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#111111]/10 bg-[#FCF6F5] p-4">
              <FaShieldAlt className="mt-0.5 shrink-0 text-[#990011]" />
              <p className="text-xs leading-relaxed text-zinc-600">
                Confirm you're with the correct rider before asking for the OTP.
                Never start a trip without server verification.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-[#111111]/10 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-wider text-[#990011]">
              Ride actions
            </p>

            {errorMessage && (
              <p
                role="alert"
                className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700"
              >
                {errorMessage}
              </p>
            )}

            {isCompleted ? (
              <div className="mt-5 rounded-2xl bg-emerald-50 p-5 text-center">
                <FaCheckCircle className="mx-auto text-3xl text-emerald-700" />
                <h2 className="mt-3 text-lg font-black text-emerald-800">
                  Trip completed
                </h2>
                <p className="mt-1 text-sm text-emerald-700">
                  This ride has been marked as completed.
                </p>
                <button
                  onClick={() => navigate("/captain-home")}
                  className="mt-5 w-full rounded-2xl bg-[#990011] py-3.5 text-sm font-bold text-white transition hover:bg-[#7a000e]"
                >
                  Back to dashboard
                </button>
              </div>
            ) : !isArrived && !isOngoing ? (
              <div className="mt-5">
                <p className="text-sm leading-relaxed text-zinc-600">
                  When you've reached the pickup point, notify the rider that
                  you've arrived.
                </p>
                <button
                  onClick={handleArrived}
                  disabled={busy || !rideId || !userId || !captainId}
                  className="mt-4 w-full rounded-2xl bg-[#990011] py-4 text-sm font-bold text-white transition hover:bg-[#7a000e] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  I've arrived
                </button>
              </div>
            ) : isArrived ? (
              <form onSubmit={handleVerifyOtp} className="mt-5">
                <label
                  htmlFor="ride-otp"
                  className="text-sm font-bold text-[#111111]"
                >
                  Enter rider's 4-digit OTP
                </label>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  Ask the rider to tell you their OTP in person.
                </p>

                <input
                  id="ride-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 4));
                    setOtpMessage("");
                  }}
                  placeholder="••••"
                  className="mt-4 w-full rounded-2xl border border-[#111111]/15 bg-[#FCF6F5] px-4 py-4 text-center text-2xl font-black tracking-[0.5em] outline-none transition focus:border-[#990011]"
                />

                {otpMessage && (
                  <p
                    role="status"
                    className={`mt-3 text-sm font-semibold ${
                      otpMessage.toLowerCase().includes("incorrect") ||
                      otpMessage.toLowerCase().includes("enter")
                        ? "text-red-600"
                        : "text-emerald-700"
                    }`}
                  >
                    {otpMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy || otp.length !== 4}
                  className="mt-4 w-full rounded-2xl bg-[#990011] py-4 text-sm font-bold text-white transition hover:bg-[#7a000e] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Verifying..." : "Verify OTP & start ride"}
                </button>
              </form>
            ) : (
              <div className="mt-5">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <FaCheckCircle />
                    <p className="text-sm font-bold">OTP verified</p>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-emerald-700">
                    The ride is in progress. Complete the trip once you've
                    reached the destination.
                  </p>
                </div>

                <button
                  onClick={handleCompleteRide}
                  disabled={busy}
                  className="mt-4 w-full rounded-2xl bg-[#111111] py-4 text-sm font-bold text-white transition hover:bg-[#990011] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Updating ride..." : "Complete ride"}
                </button>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[#111111]/10 bg-white p-4">
            <p className="text-xs font-bold">Ride reference</p>
            <p className="mt-1 break-all text-xs text-zinc-500">
              {rideId || "Ride ID unavailable"}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CaptainRiding;
