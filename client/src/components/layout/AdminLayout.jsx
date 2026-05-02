import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, UtensilsCrossed, Grid3x3, Users,
  ClipboardList, BarChart2, LogOut, Menu, X, ChefHat,
  Wifi, WifiOff,
} from "lucide-react";
import { useAuth }   from "../../context/AuthContext.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import toast from "react-hot-toast";

const navItems = [
  { to: "/admin",          icon: LayoutDashboard, label: "Dashboard"   },
  { to: "/admin/menu",     icon: UtensilsCrossed, label: "Menu Items"  },
  { to: "/admin/tables",   icon: Grid3x3,         label: "Tables"      },
  { to: "/admin/staff",    icon: Users,           label: "Staff"       },
  { to: "/admin/orders",   icon: ClipboardList,   label: "Orders"      },
  { to: "/admin/reports",  icon: BarChart2,       label: "Reports"     },
];

export default function AdminLayout({ children, title }) {
  const { user, logout }   = useAuth();
  const { connected }      = useSocket();
  const location           = useLocation();
  const navigate           = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
          <ChefHat size={20} className="text-white" />
        </div>
        <div>
          <p className="font-display font-bold text-gray-900 text-sm leading-none">RestaurantOS</p>
          <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`nav-link ${active ? "nav-link-active" : ""}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user info + logout */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        {/* Socket connection indicator */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium
          ${connected ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"}`}>
          {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
          {connected ? "Live updates on" : "Reconnecting..."}
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center
                          text-brand-700 font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>

        <button onClick={handleLogout}
          className="nav-link w-full text-red-500 hover:text-red-600 hover:bg-red-50">
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-60 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 flex flex-col">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <h1 className="font-display font-bold text-gray-900 text-xl">{title}</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scroll">
          {children}
        </main>
      </div>
    </div>
  );
}