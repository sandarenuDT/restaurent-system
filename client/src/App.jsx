import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Context providers
import { AuthProvider }   from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { CartProvider }   from "./context/CartContext.jsx";

// Route guards
import { ProtectedRoute, RoleRoute, GuestRoute } from "./components/shared/RouteGuards.jsx";

// ── Auth pages ────────────────────────────────────────────────────────────────
import LoginPage from "./pages/Auth/LoginPage.jsx";

// ── Customer Menu pages (public - accessed via QR code) ───────────────────────
import MenuPage     from "./pages/CustomerMenu/MenuPage.jsx";
import OrderStatus  from "./pages/CustomerMenu/OrderStatus.jsx";
import BillView     from "./pages/CustomerMenu/BillView.jsx";

// ── Kitchen pages (role: kitchen) ─────────────────────────────────────────────
import KitchenDisplay from "./pages/Kitchen/KitchenDisplay.jsx";

// ── Waiter pages (role: waiter) ───────────────────────────────────────────────
import WaiterDashboard from "./pages/Waiter/WaiterDashboard.jsx";
import TableDetail     from "./pages/Waiter/TableDetail.jsx";

// ── Admin pages (role: admin) ─────────────────────────────────────────────────
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import MenuManager    from "./pages/Admin/MenuManager.jsx";
import TableManager   from "./pages/Admin/TableManager.jsx";
import StaffManager   from "./pages/Admin/StaffManager.jsx";
import OrderHistory   from "./pages/Admin/OrderHistory.jsx";
import Reports        from "./pages/Admin/Reports.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>

            {/* Toast notifications - top right corner */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontFamily: "Inter, sans-serif",
                },
                success: {
                  style: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
                  iconTheme: { primary: "#16a34a", secondary: "#f0fdf4" },
                },
                error: {
                  style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
                  iconTheme: { primary: "#dc2626", secondary: "#fef2f2" },
                },
              }}
            />

            <Routes>
              {/* ── Public: Customer QR Menu ──────────────────────────────── */}
              {/* Customers land here after scanning QR code on their table    */}
              <Route path="/menu/:tableToken"          element={<MenuPage />} />
              <Route path="/menu/:tableToken/orders"   element={<OrderStatus />} />
              <Route path="/menu/:tableToken/bill"     element={<BillView />} />

              {/* ── Auth ─────────────────────────────────────────────────── */}
              <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />

              {/* ── Kitchen Display (role: kitchen) ───────────────────────── */}
              <Route
                path="/kitchen"
                element={
                  <ProtectedRoute>
                    <RoleRoute roles={["kitchen", "admin"]}>
                      <KitchenDisplay />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />

              {/* ── Waiter App (role: waiter) ─────────────────────────────── */}
              <Route
                path="/waiter"
                element={
                  <ProtectedRoute>
                    <RoleRoute roles={["waiter", "admin"]}>
                      <WaiterDashboard />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/waiter/table/:tableId"
                element={
                  <ProtectedRoute>
                    <RoleRoute roles={["waiter", "admin"]}>
                      <TableDetail />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />

              {/* ── Admin Panel (role: admin) ─────────────────────────────── */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <RoleRoute roles={["admin"]}>
                      <AdminDashboard />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/menu"    element={<ProtectedRoute><RoleRoute roles={["admin"]}><MenuManager /></RoleRoute></ProtectedRoute>} />
              <Route path="/admin/tables"  element={<ProtectedRoute><RoleRoute roles={["admin"]}><TableManager /></RoleRoute></ProtectedRoute>} />
              <Route path="/admin/staff"   element={<ProtectedRoute><RoleRoute roles={["admin"]}><StaffManager /></RoleRoute></ProtectedRoute>} />
              <Route path="/admin/orders"  element={<ProtectedRoute><RoleRoute roles={["admin"]}><OrderHistory /></RoleRoute></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute><RoleRoute roles={["admin"]}><Reports /></RoleRoute></ProtectedRoute>} />

              {/* ── Default redirects ─────────────────────────────────────── */}
              <Route path="/"  element={<Navigate to="/login" replace />} />
              <Route path="*"  element={<Navigate to="/login" replace />} />
            </Routes>

          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}