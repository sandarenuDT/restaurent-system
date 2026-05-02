import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Grid3x3, Bell, LogOut, RefreshCw, ChefHat, Wifi, WifiOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth }   from "../../context/AuthContext.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import { getTables } from "../../api/tableApi.js";
import StatusBadge   from "../../components/ui/StatusBadge.jsx";

const STATUS_STYLE = {
  available:      "bg-emerald-50 border-emerald-200 hover:border-emerald-400",
  occupied:       "bg-blue-50   border-blue-200   hover:border-blue-400",
  bill_requested: "bg-orange-50 border-orange-200 hover:border-orange-400 animate-pulse",
  reserved:       "bg-purple-50 border-purple-200 hover:border-purple-400",
  unavailable:    "bg-gray-100  border-gray-200   opacity-60",
};

export default function WaiterDashboard() {
  const { user, logout } = useAuth();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();

  const [tables,      setTables]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [notifications, setNotifications] = useState([]);

  const loadTables = useCallback(async () => {
    try {
      const { data } = await getTables();
      setTables(data.data || []);
    } catch { toast.error("Could not load tables."); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { loadTables(); }, [loadTables]);

  // ── Real-time table status updates ────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on("table:status:updated", ({ tableId, status }) => {
      setTables((prev) =>
        prev.map((t) => (t._id === tableId ? { ...t, status } : t))
      );
    });

    socket.on("order:ready", ({ tableNumber, orderNumber }) => {
      const msg = `Table ${tableNumber} — Order #${orderNumber} is ready!`;
      setNotifications((prev) => [msg, ...prev.slice(0, 4)]);
      toast.success(msg, { duration: 8000, icon: "🔔" });
    });

    socket.on("bill:requested", ({ tableNumber }) => {
      const msg = `Table ${tableNumber} requested the bill`;
      setNotifications((prev) => [msg, ...prev.slice(0, 4)]);
      toast(`💳 ${msg}`, { duration: 10000, style: { background: "#fff7ed", color: "#9a3412", border: "1px solid #fed7aa" } });
    });

    return () => {
      socket.off("table:status:updated");
      socket.off("order:ready");
      socket.off("bill:requested");
    };
  }, [socket]);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );

  const statCounts = {
    available:      tables.filter((t) => t.status === "available").length,
    occupied:       tables.filter((t) => t.status === "occupied").length,
    bill_requested: tables.filter((t) => t.status === "bill_requested").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <ChefHat size={16} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-gray-900 text-sm leading-none">Waiter View</p>
              <p className="text-xs text-gray-400">{user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full
              ${connected ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
              {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
              {connected ? "Live" : "Offline"}
            </div>

            {notifications.length > 0 && (
              <div className="relative">
                <Bell size={20} className="text-gray-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs
                                  rounded-full flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              </div>
            )}

            <button onClick={loadTables} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
              <RefreshCw size={16} />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-red-500">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Available",       count: statCounts.available,      color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Occupied",        count: statCounts.occupied,        color: "text-blue-600",   bg: "bg-blue-50"    },
            { label: "Need Attention",  count: statCounts.bill_requested,  color: "text-orange-600", bg: "bg-orange-50"  },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`card p-3 text-center ${bg}`}>
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent notifications */}
        {notifications.length > 0 && (
          <div className="card p-4 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
                <Bell size={14} /> Notifications
              </p>
              <button onClick={() => setNotifications([])}
                className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
            </div>
            {notifications.map((n, i) => (
              <div key={i} className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-xl">{n}</div>
            ))}
          </div>
        )}

        {/* Tables grid */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Grid3x3 size={16} className="text-gray-400" />
            <h2 className="font-semibold text-gray-800 text-sm">All Tables</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {tables
              .filter((t) => t.isActive)
              .sort((a, b) => a.number - b.number)
              .map((table) => (
                <button
                  key={table._id}
                  onClick={() => navigate(`/waiter/table/${table._id}`)}
                  disabled={table.status === "unavailable"}
                  className={`card p-4 text-left border-2 transition-all active:scale-95
                    ${STATUS_STYLE[table.status] || ""}`}
                >
                  <p className="font-display font-bold text-gray-900 text-xl">{table.number}</p>
                  <p className="text-xs text-gray-500 mb-2">{table.name || `Cap. ${table.capacity}`}</p>
                  <StatusBadge type="table" status={table.status} />

                  {table.status === "bill_requested" && (
                    <p className="text-xs text-orange-600 font-medium mt-1.5 flex items-center gap-1">
                      💳 Bill needed
                    </p>
                  )}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}