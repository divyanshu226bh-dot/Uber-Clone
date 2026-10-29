import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const CaptainProtectWrapper = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-400 font-medium">
            Verifying driver credentials...
          </span>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/captain-login" replace />;
  }

  if (user.role !== "captain") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default CaptainProtectWrapper;
