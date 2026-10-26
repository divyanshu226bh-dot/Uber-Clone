import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // Access token stored ONLY in memory
  const [loading, setLoading] = useState(true);

  // On initial app load/refresh, use the httpOnly refresh cookie to get a new access token
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await axios.post(
          'http://localhost:3000/api/auth/rotate-token',
          {},
          { withCredentials: true }
        );
        if (res.status === 200) {
          setToken(res.data.accessToken);
          setUser({ username: res.data.username, email: res.data.email, role: res.data.role });
        }
      } catch (err) {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);