
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios.js";

const AuthContext = createContext(null);

const extractUser = (data) => data?.staff || data?.user || null;

export const AuthProvider = ({ children }) => {
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [initialized, setInitialized] = useState(false);
  const refreshRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const { data: rd } = await api.post("/auth/refresh");
      localStorage.setItem("accessToken", rd.accessToken);
      const { data: md } = await api.get("/auth/me");
      const u = extractUser(md);
      setUser(u ? { ...u, role: u.role?.toLowerCase() } : null);
      return rd.accessToken;
    } catch {
      localStorage.removeItem("accessToken");
      setUser(null);
      return null;
    }
  }, []);

  refreshRef.current = refresh;

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        if (!cancelled) { setLoading(false); setInitialized(true); }
        return;
      }
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 - Date.now() < 60_000) {
          await refreshRef.current();
        } else {
          const { data } = await api.get("/auth/me");
          const u = extractUser(data);
          if (!cancelled) setUser(u ? { ...u, role: u.role?.toLowerCase() } : null);
        }
      } catch {
        localStorage.removeItem("accessToken");
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) { setLoading(false); setInitialized(true); }
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem("accessToken", token);
    setUser({ ...userData, role: userData.role?.toLowerCase() });
  }, []);

  const logout = useCallback(async () => {
    try { await api.post("/auth/logout"); } catch (_) {}
    localStorage.removeItem("accessToken");
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  // loading=true OR not yet initialized → still bootstrapping
  const isReady = initialized && !loading;

  return (
    <AuthContext.Provider value={{
      user,
      loading: !isReady,   // single source of truth: loading until fully initialized
      login,
      logout,
      refresh,
      updateUser,
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
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
};