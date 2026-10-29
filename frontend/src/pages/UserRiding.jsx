import React, { useContext, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import LiveMap from "../components/LiveMap";
import {
  FaArrowLeft,
  FaCar,
  FaPhoneAlt,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaLocationArrow,
  FaClock,
} from "react-icons/fa";

const DEFAULT_CENTER = [26.801, 75.8058];

const UserRiding = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { socket } = useContext(SocketContext);

  // Support the ride data passed from UserHome.
  const ride = state?.ride || state || {};

  const {
    rideId,
    captain,
    pickup = "",
    destination = "",
    pickupCoords = null,
    destinationCoords = null,
    selectedRide = "",
  } = ride;

  const captainId = captain?._id || captain?.id;

  const [captainLocation, setCaptainLocation] = useState(null);
  const [locationReceived, setLocationReceived] = useState(false);
  const [rideOtp, setRideOtp] = useState(ride?.otp || "");
  const [rideStatus, setRideStatus] = useState(ride?.status || "");
  const [routePositions, setRoutePositions] = useState([]);
  const [routeError, setRouteError] = useState(false);
  const redirectTimer = useRef(null);

  // Listen for this captain's live GPS updates.
  useEffect(() => {
    if (!socket || !captainId) return;

    const eventName = `captain-location-${captainId}`;

    const handleCaptainLocation = (location) => {
      const lat = Number(location?.ltd ?? location?.lat);
      const lng = Number(location?.lng ?? location?.long);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      setCaptainLocation([lat, lng]);
      setLocationReceived(true);
    };

    socket.on(eventName, handleCaptainLocation);

    return () => {
      socket.off(eventName, handleCaptainLocation);
    };
  }, [socket, captainId]);

  useEffect(() => {
    if (rideStatus === "completed") {
      setRoutePositions([]);
      return;
    }

    if (!captainLocation || !pickupCoords || !destinationCoords) {
      setRoutePositions([]);
      return;
    }

    const target = rideStatus === "ongoing" ? destinationCoords : pickupCoords;

    const [startLat, startLng] = captainLocation;
    const endLat = Number(target.lat);
    const endLng = Number(target.lng);

    if (![startLat, startLng, endLat, endLng].every(Number.isFinite)) {
      setRoutePositions([]);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${startLng},${startLat};${endLng},${endLat}` +
          `?overview=full&geometries=geojson`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Route request failed");

        const data = await response.json();
        const coordinates = data.routes?.[0]?.geometry?.coordinates;

        if (coordinates?.length) {
          setRoutePositions(coordinates.map(([lng, lat]) => [lat, lng]));
          setRouteError(false);
        } else {
          setRoutePositions([]);
          setRouteError(true);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setRoutePositions([]);
          setRouteError(true);
        }
      }
    }, 700);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [captainLocation, pickupCoords, destinationCoords, rideStatus]);

  useEffect(() => {
    if (rideStatus !== "completed") return;

    redirectTimer.current = setTimeout(() => {
      navigate("/home", { replace: true });
    }, 5000);

    return () => clearTimeout(redirectTimer.current);
  }, [rideStatus, navigate]);

  useEffect(() => {
    if (!socket || !rideId) return;

    const handleRideCreated = (data) => {
      if (String(data?.rideId) !== String(rideId)) return;

      if (data?.otp) {
        setRideOtp(String(data.otp));
      }
    };

    socket.on("ride-created", handleRideCreated);

    return () => {
      socket.off("ride-created", handleRideCreated);
    };
  }, [socket, rideId]);

  useEffect(() => {
    if (!socket || !rideId) return;

    const handleRideStatus = (data, expectedStatus) => {
      if (String(data?.rideId) !== String(rideId)) return;

      console.log(`Ride status received: ${expectedStatus}`, data);
      setRideStatus(expectedStatus);
    };

    const handleArrived = (data) => handleRideStatus(data, "arrived");

    const handleStarted = (data) => handleRideStatus(data, "ongoing");

    const handleCompleted = (data) => handleRideStatus(data, "completed");

    socket.on("captain-arrived", handleArrived);
    socket.on("ride-started", handleStarted);
    socket.on("ride-completed", handleCompleted);

    return () => {
      socket.off("captain-arrived", handleArrived);
      socket.off("ride-started", handleStarted);
      socket.off("ride-completed", handleCompleted);
    };
  }, [socket, rideId]);

  const mapCenter = captainLocation || DEFAULT_CENTER;

  const markers = captainLocation
    ? [
        {
          position: captainLocation,
          popup: `${captain?.fullname?.firstname || "Your"} Captain`,
        },
      ]
    : [];

  const captainName =
    captain?.username ||
    captain?.name ||
    [captain?.fullname?.firstname, captain?.fullname?.lastname]
      .filter(Boolean)
      .join(" ") ||
    "Your Captain";

  const vehicleName =
    captain?.vehicle?.vehicleType || selectedRide || "Your ride";

  return (
    <div className="min-h-screen bg-[#FCF6F5] text-[#111111]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#111111]/10 bg-[#FCF6F5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-full border border-[#111111]/10 bg-white px-4 py-2.5 text-sm font-bold transition hover:border-[#990011]/40"
          >
            <FaArrowLeft className="text-[#990011]" />
            <span>Back</span>
          </button>

          <span className="text-xl font-black tracking-tight">
            Uber<span className="text-[#990011]">.</span>
          </span>

          <span className="rounded-full bg-[#990011]/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#990011]">
            Your Trip
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
        {/* Trip status */}
        <section className="rounded-3xl border border-[#111111]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#990011]/10 text-[#990011]">
              <FaCar className="text-xl" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-wider text-[#990011]">
                Ride confirmed
              </p>

              <h1 className="mt-1 text-xl font-black sm:text-2xl">
                {{
                  accepted: "Your captain is on the way",
                  arrived: "Your captain has arrived",
                  ongoing: "Your trip is in progress",
                  completed: "Trip completed",
                }[rideStatus] || "Your ride is being updated"}
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {{
                  accepted: "Your captain is heading to your pickup location.",
                  arrived: "Your captain has reached the pickup point.",
                  ongoing: "You're on your way to your destination.",
                  completed: "You've reached the end of your trip.",
                }[rideStatus] || "Waiting for a ride status update."}
              </p>
            </div>

            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-500" />
          </div>
        </section>

        {/* Ride OTP */}
        <section className="rounded-3xl border border-[#990011]/20 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-[#990011]">
                Your ride OTP
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-[0.3em] text-[#990011]">
                {rideOtp || "----"}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Share this code with your captain only when you're together and
                ready to start the ride.
              </p>
            </div>

            <div className="rounded-2xl bg-[#990011]/10 p-3 text-[#990011]">
              <FaShieldAlt className="text-xl" />
            </div>
          </div>
        </section>

        {/* Live map */}
        <section className="relative h-[350px] overflow-hidden rounded-3xl border border-[#111111]/10 bg-white shadow-sm sm:h-[440px] lg:h-[500px]">
          <LiveMap
            center={mapCenter}
            zoom={15}
            markers={markers}
            pickupPosition={
              rideStatus !== "ongoing" &&
              rideStatus !== "completed" &&
              pickupCoords
                ? [Number(pickupCoords.lat), Number(pickupCoords.lng)]
                : null
            }
            destinationPosition={
              destinationCoords
                ? [Number(destinationCoords.lat), Number(destinationCoords.lng)]
                : null
            }
            routePositions={routePositions}
            showPickup={rideStatus !== "ongoing" && rideStatus !== "completed"}
            showDestination={rideStatus !== "completed"}
            showCaptain={false}
            vehicleType={selectedRide}
          />

          <div className="absolute left-3 top-3 z-[400] rounded-2xl border border-[#111111]/10 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  locationReceived ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <span className="text-xs font-bold">
                {locationReceived ? "Live location" : "Waiting for GPS"}
              </span>
            </div>
          </div>
        </section>

        {/* Captain details */}
        <section className="rounded-3xl border border-[#111111]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-[#990011]">
                Your captain
              </p>

              <h2 className="mt-1 text-xl font-black">{captainName}</h2>

              <p className="mt-1 text-sm text-zinc-500">
                {vehicleName}
                {captain?.vehicle?.plate ? ` · ${captain.vehicle.plate}` : ""}
              </p>
            </div>

            {captain?.phone ? (
              <a
                href={`tel:${captain.phone}`}
                aria-label="Call your captain"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#990011] text-white transition hover:bg-[#7a000e]"
              >
                <FaPhoneAlt />
              </a>
            ) : (
              <div
                title="Captain phone number unavailable"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FCF6F5] text-zinc-400"
              >
                <FaPhoneAlt />
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex min-w-0 gap-3 rounded-2xl border border-[#111111]/10 bg-[#FCF6F5] p-4">
              <FaLocationArrow className="mt-1 shrink-0 text-emerald-700" />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Pickup
                </p>
                <p className="mt-1 break-words text-sm font-semibold">
                  {pickup || "Pickup location unavailable"}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 gap-3 rounded-2xl border border-[#111111]/10 bg-[#FCF6F5] p-4">
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

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#111111]/10 p-4">
            <FaShieldAlt className="mt-0.5 shrink-0 text-[#990011]" />
            <div>
              <p className="text-sm font-bold">Travel safely</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                Verify your captain and vehicle before boarding. Never share
                your ride OTP until you are with your captain and ready to
                start.
              </p>
            </div>
          </div>
        </section>

        {/* Trip reference */}
        <section className="flex items-center gap-3 rounded-2xl border border-[#111111]/10 bg-white p-4">
          <FaClock className="shrink-0 text-[#990011]" />
          <div className="min-w-0">
            <p className="text-xs font-bold">Ride reference</p>
            <p className="mt-1 truncate text-xs text-zinc-500">
              {rideId || "Ride ID unavailable"}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserRiding;
