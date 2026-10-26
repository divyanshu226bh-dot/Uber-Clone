import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LiveMap from "../components/LiveMap";
import { SocketContext } from "../context/SocketContext";
import { FaPhoneAlt, FaShieldAlt, FaStar, FaChevronLeft } from "react-icons/fa";

const UserRiding = () => {
  const navigate = useNavigate();
  const locationState = useLocation().state || {};
  const { socket } = useContext(SocketContext);

  const [driverCoords, setDriverCoords] = useState([26.801, 75.8058]);

  // Listen for active driver updates over Socket.io
  useEffect(() => {
    if (!socket) return;

    socket.on("captain-location-updated", (data) => {
      if (data.location) {
        setDriverCoords([data.location.ltd, data.location.lng]);
      }
    });

    return () => socket.off("captain-location-updated");
  }, [socket]);

  return (
    <div className="relative h-screen w-full bg-[#FCF6F5]">
      {/* Live Driver Tracking Map */}
      <div className="h-[65%] w-full">
        <LiveMap
          center={driverCoords}
          zoom={15}
          markers={[{ position: driverCoords, popup: "Driver (En Route)" }]}
        />
      </div>

      {/* Driver Card Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-4 rounded-t-3xl border-t border-[#111111]/10 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#111111]/10 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-[#990011]">Driver Arriving</span>
            <h2 className="text-2xl font-black text-[#111111]">4 mins away</h2>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-right border border-emerald-200">
            <p className="text-[10px] font-black uppercase text-emerald-800">OTP PIN</p>
            <p className="text-lg font-black tracking-widest text-emerald-900">4829</p>
          </div>
        </div>

        {/* Driver Profile */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#990011] text-lg font-bold text-white">
              PD
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111111]">Pushpa Devi</h3>
              <p className="flex items-center gap-1 text-xs text-zinc-500">
                <FaStar className="text-amber-500" /> 4.9 • White Swift Dzire (RJ-14-CA-1029)
              </p>
            </div>
          </div>

          <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white">
            <FaPhoneAlt />
          </button>
        </div>

        <button
          onClick={() => navigate("/home")}
          className="w-full rounded-2xl border border-[#111111]/10 bg-[#FCF6F5] py-3 text-xs font-bold text-zinc-700"
        >
          Cancel Ride
        </button>
      </div>
    </div>
  );
};

export default UserRiding;