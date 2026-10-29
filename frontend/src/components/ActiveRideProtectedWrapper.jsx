import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/Api.js";
import { useAuth } from "../context/AuthContext.jsx";

const ActiveRideProtectedWrapper = ({ role, children }) => {
  const { user, token, loading: authLoading } = useAuth();

  const [checkingRide, setCheckingRide] = useState(true);
  const [hasActiveRide, setHasActiveRide] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);

  useEffect(() => {
    if (authLoading || !token || !user || user.role !== role) {
      setCheckingRide(false);
      return;
    }

    let cancelled = false;

    const checkActiveRide = async () => {
      setCheckingRide(true);
      setCheckFailed(false);
      setHasActiveRide(false);

      try {
        const response = await api.get("/rides/active");

        if (!cancelled) {
          setHasActiveRide(response.data?.active === true);
        }
      } catch (error) {
        if (cancelled) return;

        if (error.response?.status === 404) {
          setHasActiveRide(false);
        } else {
          // Fail closed if the server cannot verify the ride.
          setCheckFailed(true);
        }
      } finally {
        if (!cancelled) setCheckingRide(false);
      }
    };

    checkActiveRide();

    return () => {
      cancelled = true;
    };
  }, [authLoading, token, user, role]);

  if (authLoading) {
    return <div className="p-6">Checking authentication...</div>;
  }

  if (!token || !user) {
    return (
      <Navigate
        to={role === "rider" ? "/login" : "/captain-login"}
        replace
      />
    );
  }

  if (user.role !== role) {
    return (
      <Navigate
        to={user.role === "rider" ? "/home" : "/captain-home"}
        replace
      />
    );
  }

  if (checkingRide) {
    return <div className="p-6">Verifying your active ride...</div>;
  }

  if (checkFailed) {
    return <Navigate to={role === "rider" ? "/home" : "/captain-home"} replace />;
  }

  if (!hasActiveRide) {
    return <Navigate to={role === "rider" ? "/home" : "/captain-home"} replace />;
  }

  return children;
};

export default ActiveRideProtectedWrapper;