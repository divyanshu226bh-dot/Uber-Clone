import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Make sure port 3000 matches your backend port in config.PORT
const socket = io(BACKEND_URL, {
  autoConnect: true,
  withCredentials: true,
});

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log("⚡ Connected to Socket server:", socket.id);
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log("❌ Disconnected from Socket server");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}

      <div
        style={{
          position: "fixed",
          bottom: 10,
          right: 10,
          zIndex: 99999,
          background: isConnected ? "#166534" : "#991b1b",
          color: "white",
          padding: "10px 14px",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: "bold",
          boxShadow: "0 2px 10px #0003",
        }}
      >
        Socket: {isConnected ? "CONNECTED" : "DISCONNECTED"}
      </div>
    </SocketContext.Provider>
  );
};
