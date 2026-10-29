import React, { createContext, useContext, useState, useEffect } from "react";

import {
  getAccessToken,
  setAccessToken,
  subscribeToAccessToken,
} from "./authTokenStore.js";

import { refreshAccessToken } from "../services/Api.js"

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
        const data = await refreshAccessToken();

        if (cancelled) return;

        setUser({
          _id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
        });
      } catch {
        if (cancelled) return;

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
