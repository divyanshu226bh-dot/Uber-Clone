import React, { createContext, useContext, useState, useEffect } from "react";

import {
  getAccessToken,
  setAccessToken,
  subscribeToAccessToken,
} from "./authTokenStore.js";

import api, { refreshAccessToken } from "../services/Api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getAccessToken);
  const [loading, setLoading] = useState(true);

  const updateToken = (newToken) => {
    setAccessToken(newToken);
    setTokenState(newToken || null);
  };

  useEffect(() => {
    const unsubscribe = subscribeToAccessToken(setTokenState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      try {
        // First refresh the access token using the refresh-token cookie.
        await refreshAccessToken();

        if (cancelled) return;

        // Then fetch the complete, latest user profile.
        const response = await api.get("/auth/get-me");

        if (cancelled) return;

        const data = response.data;

        setUser({
          _id: data.id || data._id,
          username: data.username,
          email: data.email,
          phone: data.phone || "",
          role: data.role,
        });
      } catch (error) {
        if (cancelled) return;

        console.error("Auth initialization error:", error);

        updateToken(null);
        setUser(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken: updateToken,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
