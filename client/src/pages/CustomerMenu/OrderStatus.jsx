import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, LogOut, Wifi, WifiOff, RefreshCw, CheckCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth }   from "../../context/AuthContext.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import { getActiveOrders, updateOrderStatus, updateItemStatus } from "../../api/orderApi.js";

const STATUS_COLOR = {
  pending:   "order-pending",
  confirmed: "order-confirmed",
  preparing: "order-preparing",
  ready:     "order-ready",
};

const ITEM_STATUS_NEXT = {
  pending:   "preparing",
  preparing: "ready",
  ready:     "served",
};

// Format elapsed time e.g. "3m ago"
const elapsed = (date) => {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
};

export default function KitchenDisplay() {
  const { user, logout } = useAuth();
  const { connected }    = useSocket();
  const { socket }       = useSocket();
  const navigate         = useNavigate();

  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tick,      setTick]      = useState(0); // Forces re-render for elapsed times

  // Refresh elapsed times every 30s
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await getActiveOrders();
      setOrders(data.data || []);
    } catch { toast.error("Could not load orders."); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // ── Real-time socket listeners ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // New order came in
    socket.on("order:new", (order) => {
      setOrders((prev) => [order, ...prev]);
      toast("🔔 New order — Table " + order.tableNumber, {
        style: { background: "#1e293b", color: "#f1f5f9" },
        duration: 5000,
      });
      // Play a beep sound
      try { new Audio("/beep.mp3").play(); } catch (_) {}
    });

    // Order status updated
    socket.on("order:updated", (updated) => {
      setOrders((prev) =>
        updated.status === "served"
          ? prev.filter((o) => o._id !== updated._id)   // Remove when fully served
          : prev.map((o) => (o._id === updated._id ? { ...o, ...updated } : o))
      );
    });

    // Individual item updated
    socket.on("order:item:updated", ({ orderId, itemId, status }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, items: o.items.map((i) => (i._id === itemId ? { ...i, status } : i)) }
            : o
        )
      );
    });

    return () => {
      socket.off("order:new");
      socket.off("order:updated");
      socket.off("order:item:updated");
    };
  }, [socket]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleItemClick = async (order, item) => {
    const nextStatus = ITEM_STATUS_NEXT[item.status];
    if (!nextStatus) return;
    try {
      await updateItemStatus(order._id, item._id, nextStatus);
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? { ...o, items: o.items.map((i) => (i._id === item._id ? { ...i, status: nextStatus } : i)) }
            : o
        )
      );
      if (nextStatus === "ready") {
        toast.success(`${item.name} is ready!`, { style: { background: "#1e293b", color: "#f1f5f9" } });
      }
    } catch { toast.error("Failed to update item."); }
  };

  const markAllReady = async (order) => {
    try {
      await updateOrderStatus(order._id, "ready");
      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? { ...o, status: "ready", items: o.items.map((i) => ({ ...i, status: "ready" })) }
            : o
        )
      );
      toast.success(`Order #${order.orderNumber} marked ready!`, { style: { background: "#1e293b", color: "#f1f5f9" } });
    } catch { toast.error("Failed to update order."); }
  };

  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <div className="kitchen-screen min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <ChefHat size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">Kitchen Display</p>
            <p className="text-xs text-slate-400 mt-0.5">{orders.length} active order{orders.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full
            ${connected ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
            {connected
              ? <><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-dot" /> LIVE</>
              : <><WifiOff size={12} /> OFFLINE</>
            }
          </div>

          <button onClick={loadOrders}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <RefreshCw size={16} />
          </button>

          <button onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── Orders grid ──────────────────────────────────────────────────────── */}
      <main className="flex-1 p-4 overflow-auto custom-scroll">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <CheckCheck size={40} className="text-emerald-500" />
            <p className="text-slate-400 text-lg font-medium">All caught up!</p>
            <p className="text-slate-600 text-sm">No pending orders right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders.map((order) => (
              <div key={order._id}
                className={`rounded-2xl border overflow-hidden ${STATUS_COLOR[order.status] || ""}`}
                style={{ background: "#1e293b", borderColor: "#334155" }}
              >
                {/* Order header */}
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ background: order.status === "pending" ? "#7c3a0f33" : order.status === "preparing" ? "#71360533" : "#16653433" }}>
                  <div>
                    <p className="font-bold text-white text-sm">#{order.orderNumber}</p>
                    <p className="text-xs text-slate-300">Table {order.tableNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{elapsed(order.placedAt)}</p>
                    <p className="text-xs font-medium text-amber-400 capitalize">{order.status}</p>
                  </div>
                </div>

                {/* Items — tap to advance status */}
                <div className="p-3 space-y-2">
                  {order.items
                    .filter((i) => i.status !== "cancelled")
                    .map((item) => (
                      <button
                        key={item._id}
                        onClick={() => handleItemClick(order, item)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all
                          ${item.status === "ready" || item.status === "served"
                            ? "border-emerald-500/30 bg-emerald-500/10 opacity-60"
                            : item.status === "preparing"
                              ? "border-yellow-500/30 bg-yellow-500/10"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0
                              ${item.status === "ready" || item.status === "served" ? "bg-emerald-400"
                                : item.status === "preparing" ? "bg-yellow-400"
                                : "bg-orange-400"}`}
                            />
                            <span className="text-white text-sm font-medium truncate">
                              {item.quantity}× {item.name}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 flex-shrink-0 capitalize">{item.status}</span>
                        </div>
                        {item.specialInstructions && (
                          <p className="text-xs text-amber-400 mt-1 ml-4">⚠ {item.specialInstructions}</p>
                        )}
                        {item.variant?.option && (
                          <p className="text-xs text-slate-400 mt-0.5 ml-4">{item.variant.option}</p>
                        )}
                      </button>
                    ))}

                  {order.orderNote && (
                    <div className="mt-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <p className="text-xs text-amber-400">📝 {order.orderNote}</p>
                    </div>
                  )}
                </div>

                {/* Mark all ready button */}
                {order.status !== "ready" && order.status !== "served" && (
                  <div className="px-3 pb-3">
                    <button
                      onClick={() => markAllReady(order)}
                      className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30
                                 text-emerald-400 text-sm font-medium border border-emerald-500/30
                                 transition-all active:scale-95"
                    >
                      Mark All Ready ✓
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}