import React from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaArrowRight, FaShieldAlt, FaClock, FaWallet } from 'react-icons/fa';
import { TbSteeringWheelFilled } from "react-icons/tb";

const Start = () => {
  return (
    <div className="min-h-screen bg-[#FCF6F5] text-[#111111] flex flex-col justify-between selection:bg-[#990011] selection:text-white">
      
      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#111111]/10">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black tracking-tighter text-[#111111]">
            Uber<span className="text-[#990011]">.</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-bold text-[#111111]/80 hover:text-[#990011] transition-colors px-3 py-2"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm font-bold bg-[#111111] text-[#FCF6F5] px-5 py-2.5 rounded-full hover:bg-[#990011] transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main Hero Container */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto">
        
        {/* Left Column - Hero Text */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#111111]/10 text-[#990011] text-xs font-black uppercase tracking-wider w-fit mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#990011] animate-pulse"></span>
            Seamless City Travel & Earnings
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.08] mb-6 text-[#111111]">
            Go anywhere. <br />
            <span className="text-[#990011]">Earn on your terms.</span>
          </h1>

          <p className="text-zinc-600 text-lg sm:text-xl max-w-xl font-normal leading-relaxed mb-10">
            Request a ride in seconds or take the wheel as a Captain. Built with smooth real-time booking and security.
          </p>

          {/* Value Props Grid */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#111111]/10 max-w-lg">
            <div className="flex flex-col gap-1">
              <FaShieldAlt className="text-xl text-[#990011] mb-1" />
              <span className="text-sm font-bold text-[#111111]">Safe Rides</span>
              <span className="text-xs text-zinc-500 font-medium">OTP Verified</span>
            </div>
            <div className="flex flex-col gap-1">
              <FaClock className="text-xl text-[#990011] mb-1" />
              <span className="text-sm font-bold text-[#111111]">24/7 Service</span>
              <span className="text-xs text-zinc-500 font-medium">Anytime booking</span>
            </div>
            <div className="flex flex-col gap-1">
              <FaWallet className="text-xl text-[#990011] mb-1" />
              <span className="text-sm font-bold text-[#111111]">Fair Pricing</span>
              <span className="text-xs text-zinc-500 font-medium">Upfront estimates</span>
            </div>
          </div>
        </div>

        {/* Right Column - Action Cards & Image Banner */}
        <div className="lg:col-span-5 flex flex-col gap-5 w-full max-w-md mx-auto lg:max-w-none">
          
          {/* Hero Banner Image Box */}
          <div className="w-full h-48 sm:h-56 bg-white rounded-3xl border border-[#111111]/10 relative overflow-hidden flex items-center justify-center group shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=80" 
              alt="Uber Travel" 
              className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
              <span className="text-xs font-black uppercase tracking-wider text-[#FCF6F5]">City Rides & Deliveries</span>
              <span className="text-xs bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[#111111] font-bold border border-[#111111]/10">Live Driver Match</span>
            </div>
          </div>

          {/* Rider Card */}
          <div className="bg-white border border-[#111111]/10 hover:border-[#990011]/40 p-6 rounded-3xl transition-all duration-300 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#FCF6F5] rounded-2xl text-[#990011] border border-[#111111]/5">
                  <FaCar className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#111111]">Ride with Uber</h3>
                  <p className="text-xs font-semibold text-zinc-500">Book a comfortable trip to your destination</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 bg-[#990011] text-white font-bold text-sm py-3 rounded-2xl hover:bg-[#7a000e] transition-colors shadow-xs"
              >
                Rider Login <FaArrowRight className="text-xs" />
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center bg-[#FCF6F5] text-[#111111] font-bold text-sm py-3 rounded-2xl border border-[#111111]/10 hover:bg-zinc-100 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Captain Card */}
          <div className="bg-white border border-[#111111]/10 hover:border-[#990011]/40 p-6 rounded-3xl transition-all duration-300 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#FCF6F5] rounded-2xl text-[#111111] border border-[#111111]/5">
                  <TbSteeringWheelFilled className="text-xl text-[#990011]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#111111]">Drive as Captain</h3>
                  <p className="text-xs font-semibold text-zinc-500">Earn money on your own schedule</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <Link
                to="/captain-login"
                className="flex items-center justify-center gap-2 bg-[#111111] text-[#FCF6F5] font-bold text-sm py-3 rounded-2xl hover:bg-[#990011] transition-colors shadow-xs"
              >
                Captain Login <FaArrowRight className="text-xs" />
              </Link>
              <Link
                to="/captain-register"
                className="flex items-center justify-center bg-[#FCF6F5] text-[#111111] font-bold text-sm py-3 rounded-2xl border border-[#111111]/10 hover:bg-zinc-100 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-[#111111]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <p className="font-semibold">&copy; {new Date().getFullYear()} Uber Technologies Inc. Clone.</p>
        <div className="flex items-center gap-6 font-semibold">
          <span className="hover:text-[#990011] transition-colors cursor-pointer">Privacy</span>
          <span className="hover:text-[#990011] transition-colors cursor-pointer">Terms</span>
          <span className="hover:text-[#990011] transition-colors cursor-pointer">Security</span>
        </div>
      </footer>
    </div>
  );
};

export default Start;