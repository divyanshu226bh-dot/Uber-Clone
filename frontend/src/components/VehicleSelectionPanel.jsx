import React, { useState } from "react";
import {
  FaCar,
  FaMotorcycle,
  FaTaxi,
  FaArrowLeft,
  FaCheck,
} from "react-icons/fa";

const VehicleSelectionPanel = ({
  pickup,
  destination,
  onConfirmRide,
  onBack,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState("car");

  const rides = [
    {
      id: "car",
      name: "UberGo",
      capacity: "4",
      fare: "₹185.00",
      icon: FaCar,
      time: "3 mins",
    },
    {
      id: "auto",
      name: "UberAuto",
      capacity: "3",
      fare: "₹110.00",
      icon: FaTaxi,
      time: "2 mins",
    },
    {
      id: "moto",
      name: "UberMoto",
      capacity: "1",
      fare: "₹75.00",
      icon: FaMotorcycle,
      time: "1 min",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-xs">
      <div className="flex flex-col gap-4 rounded-t-3xl border-t border-[#111111]/10 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#111111]/10 pb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-zinc-600"
          >
            <FaArrowLeft /> Change Route
          </button>
          <span className="text-xs font-black uppercase text-[#990011]">
            Choose a Ride
          </span>
        </div>

        {/* Selected Route Summary */}
        <div className="rounded-2xl bg-[#FCF6F5] p-3 text-xs font-semibold text-zinc-700">
          <p className="truncate">
            📍 <span className="font-bold">Pickup:</span> {pickup}
          </p>
          <p className="truncate mt-1">
            🏁 <span className="font-bold">Dropoff:</span> {destination}
          </p>
        </div>

        {/* Vehicle Choices */}
        <div className="flex flex-col gap-3">
          {rides.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedVehicle === r.id;

            return (
              <div
                key={r.id}
                onClick={() => setSelectedVehicle(r.id)}
                className={`flex items-center justify-between rounded-2xl border p-4 transition cursor-pointer ${
                  isSelected
                    ? "border-[#990011] bg-[#990011]/5"
                    : "border-[#111111]/10 bg-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${isSelected ? "bg-[#990011] text-white" : "bg-[#FCF6F5] text-[#990011]"}`}
                  >
                    <Icon className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">
                      {r.name}
                    </h4>
                    <p className="text-xs text-zinc-500">
                      {r.time} away • {r.capacity} seats
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-[#111111]">
                    {r.fare}
                  </p>
                  {isSelected && (
                    <FaCheck className="ml-auto text-xs text-[#990011]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onConfirmRide(selectedVehicle)}
          className="mt-2 flex w-full items-center justify-center rounded-2xl bg-[#990011] py-4 text-sm font-bold text-white transition hover:bg-[#7a000e]"
        >
          Confirm Ride & Search Driver
        </button>
      </div>
    </div>
  );
};

export default VehicleSelectionPanel;
