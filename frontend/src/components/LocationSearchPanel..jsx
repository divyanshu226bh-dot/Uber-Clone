import React, { useState, useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaLocationArrow,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

const LocationSearchPanel = ({
  pickup,
  setPickup,
  destination,
  setDestination,
  activeField,
  setActiveField,
  onProceed,
  onClose,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Real-time location search via OpenStreetMap Nominatim API
  useEffect(() => {
    const query = activeField === "pickup" ? pickup : destination;

    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query,
          )}&addressdetails=1&limit=5`,
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Failed to fetch address suggestions:", err);
      } finally {
        setLoading(false);
      }
    }, 400); // Debounce API calls by 400ms

    return () => clearTimeout(timer);
  }, [pickup, destination, activeField]);

  // Handle GPS location click
  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPickup(
            `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          );
          setActiveField("destination");
          setLoading(false);
        },
        () => {
          alert("Unable to fetch current GPS location.");
          setLoading(false);
        },
      );
    }
  };

  const handleSelectLocation = (place) => {
    const addressName = place.display_name;
    if (activeField === "pickup") {
      setPickup(addressName);
      setActiveField("destination");
    } else {
      setDestination(addressName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FCF6F5] p-5 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#111111]/10 pb-4">
        <h2 className="text-xl font-black text-[#111111]">Select Locations</h2>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#111111]/10 text-[#111111]"
        >
          <FaTimes />
        </button>
      </div>

      {/* Input Fields */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="relative">
          <input
            type="text"
            value={pickup}
            onFocus={() => setActiveField("pickup")}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Enter pickup address..."
            className={`w-full rounded-2xl border px-4 py-4 pl-11 text-sm font-semibold outline-hidden transition ${
              activeField === "pickup"
                ? "border-[#990011] bg-white ring-2 ring-[#990011]/20"
                : "border-[#111111]/15 bg-[#FCF6F5]"
            }`}
          />
          <FaLocationArrow className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
        </div>

        <div className="relative">
          <input
            type="text"
            value={destination}
            onFocus={() => setActiveField("destination")}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Where to? (Destination)..."
            className={`w-full rounded-2xl border px-4 py-4 pl-11 text-sm font-semibold outline-hidden transition ${
              activeField === "destination"
                ? "border-[#990011] bg-white ring-2 ring-[#990011]/20"
                : "border-[#111111]/15 bg-[#FCF6F5]"
            }`}
          />
          <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[#990011]" />
        </div>
      </div>

      {/* GPS Current Location Button */}
      {activeField === "pickup" && (
        <button
          onClick={handleUseCurrentLocation}
          className="mt-4 flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-left transition hover:bg-emerald-100"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <FaLocationArrow />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900">
              Use Current Location
            </h4>
            <p className="text-xs font-medium text-emerald-700">
              Detect device GPS location
            </p>
          </div>
        </button>
      )}

      {/* Live Search Results */}
      <div className="mt-4 flex-1 overflow-y-auto">
        <p className="mb-2 text-xs font-black uppercase text-zinc-400">
          {loading ? "Searching places..." : "Matching Addresses"}
        </p>

        {loading && (
          <div className="flex items-center justify-center py-6 text-zinc-500">
            <FaSpinner className="animate-spin text-xl text-[#990011]" />
          </div>
        )}

        {!loading &&
          suggestions.map((item, index) => (
            <div
              key={index}
              onClick={() => handleSelectLocation(item)}
              className="flex items-center gap-4 border-b border-[#111111]/10 p-4 hover:bg-white cursor-pointer rounded-xl transition"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FCF6F5] text-[#990011]">
                <FaMapMarkerAlt />
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="truncate text-sm font-bold text-[#111111]">
                  {item.display_name}
                </h4>
                <p className="truncate text-xs text-zinc-500">
                  {item.address?.city || item.address?.state || item.type}
                </p>
              </div>
            </div>
          ))}
      </div>

      {/* Confirm Location Button */}
      <button
        disabled={!pickup.trim() || !destination.trim()}
        onClick={onProceed}
        className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[#990011] py-4 text-sm font-bold text-white transition hover:bg-[#7a000e] disabled:opacity-50"
      >
        Select Ride Options
      </button>
    </div>
  );
};

export default LocationSearchPanel;
