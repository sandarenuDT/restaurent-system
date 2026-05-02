
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider }   from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { CartProvider }   from "./context/CartContext.jsx";

import { ProtectedRoute, GuestRoute } from "./components/shared/RouteGuards.jsx";

// Pages
import LoginPage       from "./pages/Auth/LoginPage.jsx";
import MenuPage        from "./pages/CustomerMenu/MenuPage.jsx";
import OrderStatus     from "./pages/CustomerMenu/OrderStatus.jsx";
import BillView        from "./pages/CustomerMenu/BillView.jsx";
import KitchenDisplay  from "./pages/Kitchen/KitchenDisplay.jsx";
import WaiterDashboard from "./pages/Waiter/WaiterDashboard.jsx";
import TableDetail     from "./pages/Waiter/TableDetail.jsx";
import AdminDashboard  from "./pages/Admin/AdminDashboard.jsx";
import MenuManager     from "./pages/Admin/MenuManager.jsx";
import TableManager    from "./pages/Admin/TableManager.jsx";
import StaffManager    from "./pages/Admin/StaffManager.jsx";
import OrderHistory    from "./pages/Admin/OrderHistory.jsx";
import Reports         from "./pages/Admin/Reports.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: { borderRadius: "12px", fontSize: "14px", fontFamily: "Inter, sans-serif" },
                success: { style: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }, iconTheme: { primary: "#16a34a", secondary: "#f0fdf4" } },
                error:   { style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }, iconTheme: { primary: "#dc2626", secondary: "#fef2f2" } },
              }}
            />

            <Routes>
              {/* ── Public: customer QR menu (no auth needed) ─────────────── */}
              <Route path="/menu/:tableToken"         element={<MenuPage />} />
              <Route path="/menu/:tableToken/orders"  element={<OrderStatus />} />
              <Route path="/menu/:tableToken/bill"    element={<BillView />} />

              {/* ── Auth ──────────────────────────────────────────────────── */}
              <Route path="/login" element={
                <GuestRoute><LoginPage /></GuestRoute>
              } />

              {/* ── Kitchen (kitchen + admin) ──────────────────────────────── */}
              <Route path="/kitchen" element={
                <ProtectedRoute roles={["kitchen", "admin"]}>
                  <KitchenDisplay />
                </ProtectedRoute>
              } />

              {/* ── Waiter (waiter + admin) ────────────────────────────────── */}
              <Route path="/waiter" element={
                <ProtectedRoute roles={["waiter", "admin"]}>
                  <WaiterDashboard />
                </ProtectedRoute>
              } />
              <Route path="/waiter/table/:tableId" element={
                <ProtectedRoute roles={["waiter", "admin"]}>
                  <TableDetail />
                </ProtectedRoute>
              } />

              {/* ── Admin only ─────────────────────────────────────────────── */}
              <Route path="/admin" element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/menu" element={
                <ProtectedRoute roles={["admin"]}><MenuManager /></ProtectedRoute>
              } />
              <Route path="/admin/tables" element={
                <ProtectedRoute roles={["admin"]}><TableManager /></ProtectedRoute>
              } />
              <Route path="/admin/staff" element={
                <ProtectedRoute roles={["admin"]}><StaffManager /></ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute roles={["admin"]}><OrderHistory /></ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute roles={["admin"]}><Reports /></ProtectedRoute>
              } />

              {/* ── Fallback ───────────────────────────────────────────────── */}
              <Route path="/"  element={<Navigate to="/login" replace />} />
              <Route path="*"  element={<Navigate to="/login" replace />} />
            </Routes>

          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}