import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef  = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Only connect socket when a staff member is logged in
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Create socket connection
    socketRef.current = io("/", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: {
        token: localStorage.getItem("accessToken"),
      },
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setConnected(true);
      console.log("✅ Socket connected:", socket.id);

      // Auto-join the correct room based on staff role
      if (user.role === "kitchen") socket.emit("join:kitchen");
      if (user.role === "waiter")  socket.emit("join:waiter");
      if (user.role === "admin") {
        socket.emit("join:admin");
        socket.emit("join:kitchen"); // Admin sees kitchen too
        socket.emit("join:waiter");  // Admin sees waiter too
      }
    });

    socket.on("disconnect", (reason) => {
      setConnected(false);
      console.warn("⚠️ Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user]);

  // Expose socket instance and connection status
  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside <SocketProvider>");
  return ctx;
};