import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/Api";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LiveMap from "../components/LiveMap";
import LocationSearchPanel from "../components/LocationSearchPanel.";
import VehicleSelectionPanel from "../components/VehicleSelectionPanel";
import { SocketContext } from "../context/SocketContext";
import {
  FaCar,
  FaArrowRight,
  FaClock,
  FaShieldAlt,
  FaWallet,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaCog,
  FaUser,
  FaSignOutAlt,
  FaHistory,
  FaHome,
  FaBriefcase,
  FaLocationArrow,
  FaCreditCard,
  FaQuestionCircle,
  FaRoute,
  FaStar,
  FaMotorcycle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { MdElectricRickshaw, MdOutlineDirectionsCar } from "react-icons/md";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const rideOptions = [
  {
    id: "car",
    name: "Uber Go",
    description: "Affordable everyday rides",
    time: "3 min away",
    price: 145,
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80",
    icon: FaCar,
  },
  {
    id: "auto",
    name: "Uber Auto",
    description: "Quick rides through the city",
    time: "2 min away",
    price: 82,
    image:
      "https://images.unsplash.com/photo-1609607847926-da4702f01fef?auto=format&fit=crop&w=400&q=80",
    icon: MdElectricRickshaw,
  },
  {
    id: "moto",
    name: "Uber Moto",
    description: "Beat the traffic",
    time: "1 min away",
    price: 58,
    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80",
    icon: FaMotorcycle,
  },
];

const UserHome = () => {
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  const { user, setUser, setToken } = useAuth();
  const userId = user?._id || user?.id;

  // Form, Step & Map State
  const [step, setStep] = useState("home"); // 'home' | 'search' | 'vehicle' | 'searching'
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [activeField, setActiveField] = useState("pickup"); // 'pickup' | 'destination'
  const [userLocation, setUserLocation] = useState([26.801, 75.8058]); // Default center (Jaipur)
  const [selectedRide, setSelectedRide] = useState("uber-go");
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const createdRideRef = useRef(null);

  // Live Location Autocomplete Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Refs for GSAP
  const mainContainerRef = useRef(null);
  const heroRef = useRef(null);
  const bookingCardRef = useRef(null);
  const quickAccessRef = useRef(null);
  const rideOptionsRef = useRef(null);
  const exploreBannerRef = useRef(null);
  const activityRef = useRef(null);

  const selectedRideData = rideOptions.find((ride) => ride.id === selectedRide);

  // 1. Join Socket Room on Mount
  useEffect(() => {
    if (userId && socket) {
      socket.emit("join", {
        userType: "user",
        userId: userId,
      });
    }
  }, [userId, socket]);

  // 2. Listen for Ride Acceptance over Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleRideAccepted = (data) => {
      console.log("✅ RIDE ACCEPTED EVENT:", data);

      const createdRide = createdRideRef.current;

      if (!createdRide || String(createdRide.rideId) !== String(data?.rideId)) {
        console.error("OTP missing or ride ID mismatch.", {
          createdRide,
          acceptedRide: data?.rideId,
        });

        setMessage(
          "Your ride was accepted, but the OTP wasn't received. Please refresh or retry.",
        );
        return;
      }

      navigate("/user-riding", {
        state: {
          rideId: data.rideId,
          userId,
          otp: createdRide.otp,
          captain: data.captain,
          pickup: data.pickup || pickup,
          destination: data.destination || destination,
          pickupCoords: data.pickupCoords,
          destinationCoords: data.destinationCoords,
          vehicleType: selectedRide,
          status: data.status,
        },
      });
    };

    socket.on("ride-accepted", handleRideAccepted);

    return () => {
      socket.off("ride-accepted", handleRideAccepted);
    };
  }, [socket, navigate, pickup, destination, selectedRide]);

  // 3. Real-time Location Lookup (OpenStreetMap API)
  useEffect(() => {
    const query = activeField === "pickup" ? pickup : destination;
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query,
          )}&addressdetails=1&limit=5`,
        );
        const data = await response.json();
        setSuggestions(data || []);
      } catch (err) {
        console.error("Error fetching map suggestions:", err);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [pickup, destination, activeField]);

  // 4. GSAP Animations
  useEffect(() => {
    let ctx;
    const animationFrame = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        if (heroRef.current) {
          gsap.fromTo(
            heroRef.current.querySelectorAll(".gsap-hero-item"),
            { opacity: 0, y: 25 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.12,
              ease: "power3.out",
            },
          );
        }

        if (bookingCardRef.current) {
          gsap.fromTo(
            bookingCardRef.current,
            { opacity: 0, y: 30, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              delay: 0.1,
              ease: "power3.out",
            },
          );
        }

        if (quickAccessRef.current) {
          gsap.fromTo(
            quickAccessRef.current.querySelectorAll(".gsap-quick-card"),
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: quickAccessRef.current,
                start: "top 92%",
                toggleActions: "play none none none",
              },
            },
          );
        }

        if (rideOptionsRef.current) {
          gsap.fromTo(
            rideOptionsRef.current.querySelectorAll(".gsap-ride-card"),
            { opacity: 0, y: 35 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.12,
              ease: "power3.out",
              scrollTrigger: {
                trigger: rideOptionsRef.current,
                start: "top 88%",
                toggleActions: "play none none none",
              },
            },
          );
        }

        if (exploreBannerRef.current) {
          gsap.fromTo(
            exploreBannerRef.current.children,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.15,
              ease: "power3.out",
              scrollTrigger: {
                trigger: exploreBannerRef.current,
                start: "top 88%",
                toggleActions: "play none none none",
              },
            },
          );
        }

        if (activityRef.current) {
          gsap.fromTo(
            activityRef.current.querySelectorAll(".gsap-activity-card"),
            { opacity: 0, y: 25 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: activityRef.current,
                start: "top 90%",
                toggleActions: "play none none none",
              },
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

  // Fetch Current Device Location

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          const coords = {
            lat: latitude,
            lng: longitude,
          };

          setPickupCoords(coords);
          setUserLocation([latitude, longitude]);

          setPickup(
            `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          );

          setMessage("Live GPS location acquired.");
        },
        (error) => {
          console.error("Geolocation Error:", error);
          setMessage("Unable to access device GPS location.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } else {
      setMessage("Geolocation is not supported by your browser.");
    }
  };

  const handleSeePrices = (e) => {
    if (e) e.preventDefault();

    if (!pickup.trim() || !destination.trim()) {
      setMessage("Please enter both pickup and destination addresses.");
      return;
    }

    if (pickup.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setMessage("Pickup and destination cannot be identical.");
      return;
    }

    setMessage("");
    setStep("vehicle");
  };

  useEffect(() => {
    if (!socket) return;

    const handleRideCreated = (data) => {
      console.log("✅ RIDE CREATED:", data);

      if (!data?.rideId || !data?.otp) {
        console.error("Ride created without ride ID or OTP:", data);
        return;
      }

      createdRideRef.current = {
        rideId: String(data.rideId),
        otp: String(data.otp),
        status: data.status,
      };
    };

    socket.on("ride-created", handleRideCreated);

    return () => {
      socket.off("ride-created", handleRideCreated);
    };
  }, [socket]);

  const handleConfirmRide = (rideId) => {
    console.log("🟢 CONFIRM RIDE CLICKED");
    console.log("User ID:", userId);
    console.log("Socket connected:", socket?.connected);
    console.log("Ride ID received:", rideId);
    console.log("Pickup:", pickup);
    console.log("Destination:", destination);

    if (!userId || !socket?.connected) {
      console.log("❌ Failed: user ID or socket");
      setMessage("Please log in and reconnect before requesting a ride.");
      setStep("home");
      return;
    }

    if (!pickup.trim() || !destination.trim()) {
      console.log("❌ Failed: pickup or destination");
      setMessage("Please enter both pickup and destination.");
      setStep("home");
      return;
    }

    if (!pickupCoords || !destinationCoords) {
      console.log("❌ Failed: location coordinates missing", {
        pickupCoords,
        destinationCoords,
      });

      setMessage(
        "Please select both pickup and destination from the map suggestions, or use current location for pickup.",
      );
      setStep("home");
      return;
    }

    const ride = rideOptions.find((item) => item.id === rideId);
    console.log("Matched ride:", ride);

    if (!ride) {
      console.log("❌ Failed: selected ride not found");
      setMessage("Please select a valid ride option.");
      setStep("home");
      return;
    }

    setSelectedRide(rideId);
    setMessage("");
    setStep("searching");

    console.log("📤 EMITTING CREATE-RIDE");

    socket.emit("create-ride", {
      userId,
      pickup: pickup.trim(),
      destination: destination.trim(),
      pickupCoords,
      destinationCoords,
      vehicleType: rideId,
      price: ride.price,
    });
  };
  useEffect(() => {
    if (!socket) return;

    const handleRideError = (data) => {
      setMessage(data?.message || "Something went wrong with your ride.");
      setStep("home");
    };

    socket.on("ride-error", handleRideError);

    return () => {
      socket.off("ride-error", handleRideError);
    };
  }, [socket]);
  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (error) {
      console.error("Rider logout request failed.");
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  const quickDestinations = [
    {
      title: "Home",
      subtitle: "Add your home address",
      icon: FaHome,
    },
    {
      title: "Work",
      subtitle: "Add your work address",
      icon: FaBriefcase,
    },
    {
      title: "Saved places",
      subtitle: "Your favourite destinations",
      icon: FaStar,
    },
  ];

  return (
    <div
      ref={mainContainerRef}
      className="min-h-screen bg-[#FCF6F5] text-[#111111] selection:bg-[#990011] selection:text-white"
    >
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#111111]/10 bg-[#FCF6F5]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/home" className="flex items-center gap-3">
            <span className="text-3xl font-black tracking-tighter text-[#111111]">
              Uber<span className="text-[#990011]">.</span>
            </span>
            <span className="hidden h-6 w-px bg-[#111111]/20 sm:block" />
            <span className="hidden text-xs font-bold uppercase tracking-wider text-zinc-500 sm:block">
              Rider
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <a
              href="#book-ride"
              className="text-sm font-bold text-[#111111]/80 transition hover:text-[#990011]"
            >
              Book a ride
            </a>
            <a
              href="#ride-options"
              className="text-sm font-bold text-[#111111]/80 transition hover:text-[#990011]"
            >
              Ride options
            </a>
            <a
              href="#activity"
              className="text-sm font-bold text-[#111111]/80 transition hover:text-[#990011]"
            >
              Activity
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden sm:block">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center gap-2 rounded-full border border-[#111111]/10 bg-white px-4 py-2 text-sm font-bold text-[#111111] transition hover:border-[#990011] hover:text-[#990011] shadow-xs"
              >
                <FaCog className="text-xs" />
                Settings
                <FaChevronDown className="text-xs" />
              </button>

              {settingsOpen && (
                <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-[#111111]/10 bg-white p-2 shadow-xl">
                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      navigate("/profile");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-[#111111] hover:bg-[#FCF6F5] hover:text-[#990011]"
                  >
                    <FaUser /> Profile settings
                  </button>
                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      navigate("/activity");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-[#111111] hover:bg-[#FCF6F5] hover:text-[#990011]"
                  >
                    <FaHistory /> Ride history
                  </button>
                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      navigate("/help");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-[#111111] hover:bg-[#FCF6F5] hover:text-[#990011]"
                  >
                    <FaQuestionCircle /> Help
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/profile")}
              aria-label="Open profile"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#111111]/10 bg-white text-[#111111] transition hover:border-[#990011] hover:text-[#990011] shadow-xs"
            >
              <FaUser className="text-sm" />
            </button>

            <button
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-full bg-[#111111] px-4 py-2 text-sm font-bold text-[#FCF6F5] transition hover:bg-[#990011] sm:flex shadow-xs"
            >
              <FaSignOutAlt />
              Logout
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#111111]/10 text-[#111111] text-lg md:hidden"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="border-t border-[#111111]/10 bg-white px-5 py-4 md:hidden shadow-lg">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              <a
                href="#book-ride"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-bold text-[#111111] hover:bg-[#FCF6F5]"
              >
                Book a ride
              </a>
              <a
                href="#ride-options"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-bold text-[#111111] hover:bg-[#FCF6F5]"
              >
                Ride options
              </a>
              <a
                href="#activity"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-bold text-[#111111] hover:bg-[#FCF6F5]"
              >
                Activity
              </a>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
                className="rounded-xl px-3 py-3 text-left text-sm font-bold text-[#111111] hover:bg-[#FCF6F5]"
              >
                Profile and settings
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-[#990011] hover:bg-[#990011]/10"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION WITH DYNAMIC LEAFLET MAP */}
      <div className="relative overflow-hidden border-b border-[#111111]/10 bg-[#FCF6F5]">
        <main className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
          <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Column: Hero Information */}
            <div ref={heroRef} className="lg:col-span-5">
              <div className="gsap-hero-item mb-6 inline-flex items-center gap-2 rounded-full border border-[#111111]/10 bg-white px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-[#990011] shadow-xs">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#990011]" />
                Live Driver Network Connected
              </div>

              <h1 className="gsap-hero-item mb-5 text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl text-[#111111]">
                Go anywhere. <br />
                <span className="mt-2 block text-[#990011]">
                  Your city awaits.
                </span>
              </h1>

              <p className="gsap-hero-item mb-8 max-w-lg text-base font-normal leading-relaxed text-zinc-600 sm:text-lg">
                Wherever life takes you, get there comfortably. Set your
                destination, choose your ride, and leave the rest to us.
              </p>

              <div className="gsap-hero-item grid grid-cols-3 gap-3 border-t border-[#111111]/10 pt-6 sm:gap-5">
                <div>
                  <FaShieldAlt className="mb-2 text-xl text-[#990011]" />
                  <p className="text-sm font-bold text-[#111111]">
                    Safety first
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-zinc-500">
                    OTP Verified Rides
                  </p>
                </div>
                <div>
                  <FaClock className="mb-2 text-xl text-[#990011]" />
                  <p className="text-sm font-bold text-[#111111]">
                    On your time
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-zinc-500">
                    24/7 Dispatching
                  </p>
                </div>
                <div>
                  <FaWallet className="mb-2 text-xl text-[#990011]" />
                  <p className="text-sm font-bold text-[#111111]">
                    Know the price
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-zinc-500">
                    Upfront Transparency
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Booking Card + Integrated Live Leaflet Map */}
            <div
              id="book-ride"
              ref={bookingCardRef}
              className="scroll-mt-28 lg:col-span-7"
            >
              <div className="overflow-hidden rounded-3xl border border-[#111111]/10 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-5 sm:px-7">
                  <div>
                    <p className="mb-1 text-xs font-black uppercase tracking-wider text-[#990011]">
                      Your journey
                    </p>
                    <h2 className="text-2xl font-black tracking-tight text-[#111111] sm:text-3xl">
                      Where to?
                    </h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FCF6F5] border border-[#111111]/5 text-[#990011]">
                    <FaRoute className="text-xl" />
                  </div>
                </div>

                {/* Map View */}
                <div className="relative h-64 sm:h-72 w-full border-b border-[#111111]/10 overflow-hidden">
                  <LiveMap
                    center={userLocation}
                    zoom={14}
                    markers={[
                      {
                        position: userLocation,
                        popup: "Pickup Location (You)",
                      },
                    ]}
                  />
                </div>

                <form onSubmit={handleSeePrices} className="p-5 sm:p-7">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto]">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex w-5 shrink-0 flex-col items-center pt-4">
                          <span className="h-3 w-3 rounded-full bg-[#990011]" />
                          <span className="my-1 h-10 border-l-2 border-dashed border-[#111111]/30" />
                          <span className="h-3 w-3 bg-[#111111]" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-3">
                          <div>
                            <label
                              htmlFor="pickup"
                              className="mb-1.5 block text-xs font-bold text-[#111111]"
                            >
                              Pickup location
                            </label>
                            <input
                              id="pickup"
                              value={pickup}
                              onFocus={() => {
                                setActiveField("pickup");
                                setStep("search");
                              }}
                              onChange={(e) => {
                                setPickup(e.target.value);
                                setPickupCoords(null);
                              }}
                              placeholder="Enter pickup address"
                              className="w-full rounded-2xl border border-[#111111]/15 bg-[#FCF6F5] px-4 py-3 text-sm text-[#111111] font-medium outline-hidden transition placeholder:text-zinc-400 focus:border-[#990011] focus:bg-white cursor-pointer"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="destination"
                              className="mb-1.5 block text-xs font-bold text-[#111111]"
                            >
                              Destination
                            </label>
                            <input
                              id="destination"
                              value={destination}
                              onFocus={() => {
                                setActiveField("destination");
                                setStep("search");
                              }}
                              onChange={(e) => {
                                setDestination(e.target.value);
                                setDestinationCoords(null);
                              }}
                              placeholder="Where do you want to go?"
                              className="w-full rounded-2xl border border-[#111111]/15 bg-[#FCF6F5] px-4 py-3 text-sm text-[#111111] font-medium outline-hidden transition placeholder:text-zinc-400 focus:border-[#990011] focus:bg-white cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row gap-2 sm:flex-col sm:justify-start">
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 sm:flex-none sm:justify-start sm:px-4"
                      >
                        <FaLocationArrow className="text-emerald-700" />
                        <span className="sm:hidden">Current</span>
                        <span className="hidden sm:inline">
                          Use current location
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPickup("");
                          setDestination("");
                          setStep("home");
                          setMessage("");
                        }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#111111]/10 bg-[#FCF6F5] px-3 py-3 text-xs font-bold text-zinc-600 transition hover:bg-zinc-100 sm:flex-none sm:justify-start sm:px-4"
                      >
                        Clear fields
                      </button>
                    </div>
                  </div>

                  {/* Real-time Map API Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2 border-t border-[#111111]/10 pt-4">
                      <p className="text-[10px] font-black uppercase text-zinc-400">
                        Map Search Results
                      </p>
                      {suggestions.map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            const coords = {
                              lat: Number(sug.lat),
                              lng: Number(sug.lon),
                            };

                            if (
                              !Number.isFinite(coords.lat) ||
                              !Number.isFinite(coords.lng) ||
                              coords.lat < -90 ||
                              coords.lat > 90 ||
                              coords.lng < -180 ||
                              coords.lng > 180
                            ) {
                              setMessage(
                                "Invalid location coordinates. Please select another result.",
                              );
                              return;
                            }

                            if (activeField === "pickup") {
                              setPickup(sug.display_name);
                              setPickupCoords(coords);
                              setUserLocation([coords.lat, coords.lng]);
                            } else {
                              setDestination(sug.display_name);
                              setDestinationCoords(coords);
                            }

                            setMessage("");
                            setSuggestions([]);
                          }}
                          className="flex items-center gap-3 rounded-xl p-2 text-left hover:bg-[#FCF6F5] transition"
                        >
                          <FaMapMarkerAlt className="text-xs text-[#990011] shrink-0" />
                          <div className="overflow-hidden">
                            <p className="truncate text-xs font-bold text-[#111111]">
                              {sug.display_name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {message && (
                    <p
                      role="status"
                      className="mt-4 rounded-2xl border border-[#990011]/30 bg-[#990011]/10 px-4 py-3 text-xs font-semibold text-[#990011]"
                    >
                      {message}
                    </p>
                  )}

                  <div className="mt-6 flex flex-col gap-3 border-t border-[#111111]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-medium text-zinc-500">
                      <FaShieldAlt className="mr-1.5 inline text-[#990011]" />
                      Review fare estimates prior to request
                    </p>
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-3 rounded-2xl bg-[#990011] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#7a000e] shadow-xs"
                    >
                      See prices
                      <FaArrowRight />
                    </button>
                  </div>
                </form>
              </div>

              {/* QUICK DESTINATIONS */}
              <div ref={quickAccessRef} className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                    Quick access
                  </h3>
                  <span className="text-xs font-medium text-zinc-500">
                    Saved locations
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {quickDestinations.map((place) => {
                    const Icon = place.icon;

                    return (
                      <button
                        key={place.title}
                        onClick={() => {
                          setDestination(place.title);
                          setMessage(`Destination set to ${place.title}.`);
                          setStep("search");
                        }}
                        className="gsap-quick-card flex min-w-0 items-center gap-3 rounded-2xl border border-[#111111]/10 bg-white p-4 text-left transition hover:border-[#990011]/40 shadow-xs"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FCF6F5] text-[#990011]">
                          <Icon className="text-sm" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#111111]">
                            {place.title}
                          </p>
                          <p className="mt-0.5 truncate text-xs font-medium text-zinc-500">
                            {place.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* RIDE OPTIONS OVERVIEW */}
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:py-14">
        <section
          id="ride-options"
          ref={rideOptionsRef}
          className="scroll-mt-28 mt-8 border-t border-[#111111]/10 pt-12 sm:mt-12 sm:pt-16"
        >
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-wider text-[#990011]">
                Made for your journey
              </p>
              <h2 className="text-3xl font-black tracking-tight text-[#111111] sm:text-4xl">
                Find your ride.
              </h2>
              <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-zinc-500 sm:text-base">
                From quick city trips to everyday travel, choose an option that
                works for you.
              </p>
            </div>

            <span className="w-fit rounded-full border border-[#111111]/10 bg-white px-4 py-2 text-xs font-bold text-[#111111] shadow-xs">
              <FaCar className="mr-2 inline text-[#990011]" />
              Multiple vehicle options
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {rideOptions.map((ride) => {
              const RideIcon = ride.icon;
              const isSelected = selectedRide === ride.id;

              return (
                <button
                  key={ride.id}
                  onClick={() => {
                    setSelectedRide(ride.id);
                    if (pickup.trim() && destination.trim()) {
                      setStep("vehicle");
                    } else {
                      setStep("search");
                    }
                  }}
                  className={`gsap-ride-card group overflow-hidden rounded-3xl border text-left transition duration-300 shadow-xs ${
                    isSelected
                      ? "border-[#990011] bg-white ring-2 ring-[#990011]/20"
                      : "border-[#111111]/10 bg-white hover:border-[#990011]/40"
                  }`}
                >
                  <div className="relative h-44 overflow-hidden bg-zinc-100">
                    <img
                      src={ride.image}
                      alt={ride.name}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                      <RideIcon className="text-sm text-[#990011]" />
                      {ride.name}
                    </span>

                    {isSelected && (
                      <span className="absolute right-4 top-4 rounded-full bg-[#990011] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                        Selected
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-[#111111]">
                          {ride.name}
                        </h3>
                        <p className="mt-0.5 text-xs font-medium text-zinc-500">
                          {ride.description}
                        </p>
                      </div>
                      <p className="shrink-0 text-lg font-black text-[#990011]">
                        ₹{ride.price}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#111111]/10 pt-4">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                        <FaClock className="text-[#990011]" />
                        {ride.time}
                      </span>
                      <span className="flex items-center gap-2 text-xs font-bold text-[#111111]">
                        Select <FaArrowRight className="text-[#990011]" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* EXPLORE BANNER */}
        <section
          ref={exploreBannerRef}
          className="mt-20 grid grid-cols-1 gap-6 sm:mt-24 lg:grid-cols-2"
        >
          <div className="group relative min-h-72 overflow-hidden rounded-3xl border border-[#111111]/10 bg-white shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80"
              alt="City skyline at night"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/90 via-[#111111]/60 to-transparent" />

            <div className="relative flex min-h-72 max-w-lg flex-col items-start justify-center p-7 sm:p-10">
              <span className="mb-4 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white backdrop-blur-xs">
                YOUR CITY, YOUR WAY
              </span>
              <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">
                Make every journey count.
              </h2>
              <p className="mt-4 text-sm font-normal leading-relaxed text-zinc-300">
                Plan your next trip, explore new places, and get where you need
                to be smoothly.
              </p>
              <a
                href="#book-ride"
                className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-[#990011] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#7a000e] shadow-xs"
              >
                Plan a ride <FaArrowRight />
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-[#111111]/10 bg-white p-7 sm:p-10 shadow-xs">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FCF6F5] border border-[#111111]/5 text-[#990011]">
                <MdOutlineDirectionsCar className="text-2xl" />
              </div>
              <h2 className="max-w-sm text-3xl font-black leading-tight text-[#111111] sm:text-4xl">
                Your ride. Your choice.
              </h2>
              <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-zinc-500 sm:text-base">
                Compare available ride categories and choose the one that fits
                your route and budget. Review your trip details before
                requesting a driver.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#111111]/10 pt-6">
              <div>
                <FaWallet className="mb-2 text-lg text-[#990011]" />
                <p className="text-sm font-bold text-[#111111]">
                  Clear estimates
                </p>
                <p className="mt-0.5 text-xs font-medium text-zinc-500">
                  See fares before choosing
                </p>
              </div>
              <div>
                <FaShieldAlt className="mb-2 text-lg text-[#990011]" />
                <p className="text-sm font-bold text-[#111111]">
                  Ride with care
                </p>
                <p className="mt-0.5 text-xs font-medium text-zinc-500">
                  Review trip details first
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ACTIVITY SECTION */}
        <section
          id="activity"
          ref={activityRef}
          className="scroll-mt-28 mt-20 border-t border-[#111111]/10 pt-12 sm:mt-24 sm:pt-16"
        >
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-wider text-[#990011]">
                Keep everything together
              </p>
              <h2 className="text-3xl font-black tracking-tight text-[#111111]">
                Your activity.
              </h2>
              <p className="mt-2 text-sm font-medium text-zinc-500">
                Shortcuts to manage your rider account.
              </p>
            </div>
            <FaHistory className="mb-1 hidden text-2xl text-[#990011] sm:block" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FaHistory,
                title: "Ride history",
                description: "Review your past journeys and receipts.",
                path: "/activity",
              },
              {
                icon: FaCreditCard,
                title: "Payment methods",
                description: "Manage how you pay for your rides.",
                path: "/payments",
              },
              {
                icon: FaUser,
                title: "Your account",
                description: "Manage your profile and personal details.",
                path: "/profile",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  onClick={() => navigate(item.path)}
                  className="gsap-activity-card flex items-start gap-4 rounded-2xl border border-[#111111]/10 bg-white p-5 text-left transition hover:border-[#990011]/40 shadow-xs"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FCF6F5] text-[#990011]">
                    <Icon className="text-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#111111]">{item.title}</h3>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-500">
                      {item.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#111111]">
                      Open <FaArrowRight className="text-[#990011]" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-[#111111]/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <Link
                to="/home"
                className="text-3xl font-black tracking-tighter text-[#111111]"
              >
                Uber<span className="text-[#990011]">.</span>
              </Link>
              <p className="mt-3 text-xs font-medium leading-relaxed text-zinc-500">
                Your city, your journey. A full-stack Uber-inspired rider
                experience built for this project.
              </p>
              <a
                href="#book-ride"
                className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#111111] hover:text-[#990011] transition"
              >
                Back to booking <FaArrowRight className="text-xs" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-xs font-bold text-zinc-600 sm:gap-x-16">
              <a href="#book-ride" className="transition hover:text-[#990011]">
                Book a ride
              </a>
              <a
                href="#ride-options"
                className="transition hover:text-[#990011]"
              >
                Ride options
              </a>
              <Link to="/profile" className="transition hover:text-[#990011]">
                Profile
              </Link>
              <Link to="/activity" className="transition hover:text-[#990011]">
                Ride history
              </Link>
              <Link to="/help" className="transition hover:text-[#990011]">
                Help center
              </Link>
              <button
                onClick={handleLogout}
                className="text-left transition hover:text-[#990011]"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-[#111111]/10 pt-6 text-xs font-semibold text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Uber Technologies Inc. Clone.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <a href="#privacy" className="transition hover:text-[#111111]">
                Privacy
              </a>
              <a href="#terms" className="transition hover:text-[#111111]">
                Terms
              </a>
              <a href="#security" className="transition hover:text-[#111111]">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* OVERLAY COMPONENTS ACCORDING TO USER NAVIGATION STEP */}

      {/* STEP 2: Location Search Panel Overlay */}
      {step === "search" && (
        <LocationSearchPanel
          pickup={pickup}
          setPickup={setPickup}
          destination={destination}
          setDestination={setDestination}
          activeField={activeField}
          setActiveField={setActiveField}
          setPickupCoords={setPickupCoords}
          setDestinationCoords={setDestinationCoords}
          setUserLocation={setUserLocation}
          onProceed={() => setStep("vehicle")}
          onClose={() => setStep("home")}
        />
      )}

      {/* STEP 3: Vehicle Selection Overlay */}
      {step === "vehicle" && (
        <VehicleSelectionPanel
          pickup={pickup}
          destination={destination}
          onConfirmRide={handleConfirmRide}
          onBack={() => setStep("search")}
        />
      )}

      {/* STEP 4: Searching Driver Loader */}
      {step === "searching" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-xs">
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#990011] border-t-transparent" />
            <h3 className="text-xl font-black text-[#111111]">
              Searching for Nearby Drivers
            </h3>
            <p className="text-xs text-zinc-500">
              Connecting your request with drivers near{" "}
              {pickup || "your location"}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHome;
