import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true while checking existing session

  // ── On app load: check if we have a valid token ───────────────────────────
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const decoded = jwtDecode(token);
        // If token expires within 60 seconds, try to refresh it
        if (decoded.exp * 1000 - Date.now() < 60_000) {
          await refresh();
        } else {
          const { data } = await api.get("/auth/me");
          setUser(data.staff);
        }
      } catch {
        localStorage.removeItem("accessToken");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Login: save token and user to state ───────────────────────────────────
  const login = useCallback((staffData, token) => {
    localStorage.setItem("accessToken", token);
    setUser(staffData);
  }, []);

  // ── Logout: clear everything ──────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await api.post("/auth/logout"); } catch (_) {}
    localStorage.removeItem("accessToken");
    setUser(null);
  }, []);

  // ── Refresh: get new access token using httpOnly refresh cookie ───────────
  const refresh = useCallback(async () => {
    try {
      const { data } = await api.post("/auth/refresh");
      localStorage.setItem("accessToken", data.accessToken);
      const me = await api.get("/auth/me");
      setUser(me.data.staff);
      return data.accessToken;
    } catch {
      localStorage.removeItem("accessToken");
      setUser(null);
      return null;
    }
  }, []);

  // ── Update user state without refetching ─────────────────────────────────
  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh, updateUser,
      isAdmin:   user?.role === "admin",
      isWaiter:  user?.role === "waiter",
      isKitchen: user?.role === "kitchen",
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};