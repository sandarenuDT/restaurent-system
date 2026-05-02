
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

// Role → home page
const ROLE_HOME = {
  admin:   "/admin",
  waiter:  "/waiter",
  kitchen: "/kitchen",
};

// ── Spinner ───────────────────────────────────────────────────────────────────
const AuthLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  </div>
);

// ── ProtectedRoute ────────────────────────────────────────────────────────────
// Usage: <ProtectedRoute roles={["admin"]}>  OR  <ProtectedRoute> (any role)
// Combines auth check + role check in ONE component to avoid nested Navigate loops
export const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Always wait — never redirect while auth state is still being resolved
  if (loading) return <AuthLoader />;

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrong role → go to their correct home
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || "/login"} replace />;
  }

  return children;
};

// ── RoleRoute (kept for backward compat, just wraps ProtectedRoute) ───────────
export const RoleRoute = ({ children, roles }) => (
  <ProtectedRoute roles={roles}>{children}</ProtectedRoute>
);

// ── GuestRoute ────────────────────────────────────────────────────────────────
export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoader />;

  if (user) {
    return <Navigate to={ROLE_HOME[user.role] || "/admin"} replace />;
  }

  return children;
};