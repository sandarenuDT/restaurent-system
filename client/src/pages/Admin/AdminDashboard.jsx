import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, Users, ShoppingBag, UtensilsCrossed,
  AlertCircle, ArrowUpRight, RefreshCw, Clock,
  CheckCircle2, ChefHat, Receipt, Wifi, WifiOff,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import AdminLayout    from "../../components/layout/AdminLayout.jsx";
import { PageSpinner } from "../../components/ui/Spinner.jsx";
import StatusBadge    from "../../components/ui/StatusBadge.jsx";
import { useSocket }  from "../../context/SocketContext.jsx";
import { useAuth }    from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";
import toast from "react-hot-toast";

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div className="card p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full
          ${trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
          {trend >= 0 ? "+" : ""}{trend}%
        </span>
      )}
    </div>
    <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

// ── Table status pill ─────────────────────────────────────────────────────────
const TablePill = ({ table }) => {
  const styles = {
    available:      "bg-emerald-50 border-emerald-300 text-emerald-700",
    occupied:       "bg-blue-50   border-blue-300   text-blue-700",
    bill_requested: "bg-orange-50 border-orange-400 text-orange-700 animate-pulse",
    reserved:       "bg-purple-50 border-purple-300 text-purple-700",
    unavailable:    "bg-gray-100  border-gray-200   text-gray-400",
  };
  return (
    <div className={`aspect-square rounded-xl border-2 flex flex-col items-center
                     justify-center text-sm font-bold transition-colors
                     ${styles[table.status] || styles.unavailable}`}>
      <span>{table.number}</span>
      {table.status === "bill_requested" && (
        <span className="text-[9px] font-medium mt-0.5">BILL</span>
      )}
    </div>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, text, sub }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-2">
    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
      <Icon size={22} className="text-gray-300" />
    </div>
    <p className="text-sm font-medium text-gray-400">{text}</p>
    {sub && <p className="text-xs text-gray-300">{sub}</p>}
  </div>
);

// ── Time formatter ────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
};

export default function AdminDashboard() {
  const { user }            = useAuth();
  const { socket, connected } = useSocket();

  const [stats,        setStats]        = useState(null);
  const [revenueData,  setRevenueData]  = useState([]);
  const [topItems,     setTopItems]     = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [tables,       setTables]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  // ── Load all dashboard data ───────────────────────────────────────────────
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else         setRefreshing(true);
    try {
      const [statsRes, ordersRes, tablesRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/orders?limit=6"),
        api.get("/tables"),
      ]);

      const s = statsRes.data.data || {};
      setStats(s);
      setRevenueData(s.weeklyRevenue || []);
      setTopItems(s.topItems        || []);
      setRecentOrders(ordersRes.data.data || []);
      setTables(tablesRes.data.data       || []);
    } catch (err) {
      if (!silent) toast.error("Failed to load dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Real-time: update table statuses live ─────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onTableStatus = ({ tableId, status }) => {
      setTables((prev) =>
        prev.map((t) => (t._id === tableId ? { ...t, status } : t))
      );
    };

    const onNewOrder = (order) => {
      setRecentOrders((prev) => [order, ...prev].slice(0, 6));
      setStats((prev) => prev
        ? { ...prev, activeOrders: (prev.activeOrders || 0) + 1 }
        : prev
      );
    };

    socket.on("table:status:updated", onTableStatus);
    socket.on("order:new",            onNewOrder);

    return () => {
      socket.off("table:status:updated", onTableStatus);
      socket.off("order:new",            onNewOrder);
    };
  }, [socket]);

  // ── Derived table counts ──────────────────────────────────────────────────
  const activeTables    = tables.filter((t) => t.isActive);
  const occupied        = activeTables.filter((t) => t.status === "occupied").length;
  const billRequested   = activeTables.filter((t) => t.status === "bill_requested").length;
  const available       = activeTables.filter((t) => t.status === "available").length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return (
    <AdminLayout title="Dashboard">
      <PageSpinner text="Loading dashboard..." />
    </AdminLayout>
  );

  return (
    <AdminLayout title="Dashboard">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900">
            {greeting()}, {user?.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString("en-LK", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium
            ${connected
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "bg-red-50   text-red-500   border border-red-200"}`}>
            {connected
              ? <><Wifi size={11} /> Live</>
              : <><WifiOff size={11} /> Offline</>
            }
          </div>
          <button onClick={() => load(true)} disabled={refreshing}
            className="btn btn-outline btn-sm gap-1.5">
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Alert: tables needing attention ─────────────────────────────────── */}
      {billRequested > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5
                        flex items-center gap-3 animate-slide-down">
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle size={18} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-800">
              {billRequested} table{billRequested > 1 ? "s" : ""} requesting the bill
            </p>
            <p className="text-xs text-orange-600 mt-0.5">Assign a waiter to collect payment</p>
          </div>
          <Link to="/waiter" className="btn btn-sm bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0">
            View Tables
          </Link>
        </div>
      )}

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={TrendingUp}
          label="Today's Revenue"
          value={`LKR ${(stats?.todayRevenue || 0).toLocaleString()}`}
          sub={`${stats?.todayBills || 0} bills settled`}
          color="bg-brand-500"
        />
        <StatCard
          icon={ShoppingBag}
          label="Active Orders"
          value={stats?.activeOrders || 0}
          sub="in kitchen now"
          color="bg-blue-500"
        />
        <StatCard
          icon={UtensilsCrossed}
          label="Tables Occupied"
          value={`${occupied} / ${activeTables.length}`}
          sub={`${available} available`}
          color="bg-emerald-500"
        />
        <StatCard
          icon={Users}
          label="Staff Online"
          value={stats?.totalStaff || 0}
          sub="active accounts"
          color="bg-purple-500"
        />
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4 mb-5">

        {/* Weekly revenue line chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-gray-800">Weekly Revenue</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
            </div>
            <span className="badge badge-green">
              LKR {(stats?.todayRevenue || 0).toLocaleString()} today
            </span>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f97316" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                  formatter={(v) => [`LKR ${v.toLocaleString()}`, "Revenue"]}
                  cursor={{ stroke: "#f97316", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5}
                  dot={{ fill: "#f97316", r: 4, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, stroke: "#f97316", strokeWidth: 2, fill: "#fff" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={TrendingUp} text="No revenue data yet"
              sub="Revenue will appear after bills are settled" />
          )}
        </div>

        {/* Top items bar chart */}
        <div className="card p-5">
          <div className="mb-5">
            <h3 className="font-display font-bold text-gray-800">Top Items Today</h3>
            <p className="text-xs text-gray-400 mt-0.5">By quantity ordered</p>
          </div>
          {topItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={topItems} layout="vertical"
                margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  width={72} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  formatter={(v) => [v, "Ordered"]}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {topItems.map((_, i) => (
                    <Cell key={i}
                      fill={["#f97316","#fb923c","#fdba74","#fcd34d","#86efac"][i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={ChefHat} text="No orders yet today"
              sub="Items will appear as orders come in" />
          )}
        </div>
      </div>

      {/* ── Bottom row ──────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-gray-800">Recent Orders</h3>
              <p className="text-xs text-gray-400 mt-0.5">Latest activity</p>
            </div>
            <Link to="/admin/orders"
              className="text-xs text-brand-500 hover:text-brand-600 font-medium
                         flex items-center gap-0.5 transition-colors">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <EmptyState icon={ShoppingBag} text="No orders today"
              sub="Orders will appear here as customers place them" />
          ) : (
            <div className="space-y-1">
              {recentOrders.map((order) => (
                <div key={order._id}
                  className="flex items-center justify-between gap-3 p-3
                             rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    {/* Order number bubble */}
                    <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center
                                    justify-center text-brand-600 font-bold text-xs flex-shrink-0
                                    group-hover:bg-brand-100 transition-colors">
                      #{order.orderNumber}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 leading-none">
                        Table {order.tableNumber}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock size={10} className="text-gray-300" />
                        <p className="text-xs text-gray-400">{timeAgo(order.createdAt)}</p>
                        <span className="text-gray-200">·</span>
                        <p className="text-xs text-gray-400">
                          {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge type="order" status={order.status} />
                    <p className="text-sm font-semibold text-gray-700">
                      LKR {order.subtotal?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live table floor plan */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-gray-800">Table Floor Plan</h3>
              <p className="text-xs text-gray-400 mt-0.5">Live status</p>
            </div>
            <Link to="/admin/tables"
              className="text-xs text-brand-500 hover:text-brand-600 font-medium
                         flex items-center gap-0.5">
              Manage <ArrowUpRight size={12} />
            </Link>
          </div>

          {/* Status legend */}
          <div className="flex flex-wrap gap-3 mb-4">
            {[
              { color: "bg-emerald-400", label: `Available (${available})` },
              { color: "bg-blue-400",    label: `Occupied (${occupied})`   },
              { color: "bg-orange-400",  label: `Bill (${billRequested})`  },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>

          {activeTables.length === 0 ? (
            <EmptyState icon={UtensilsCrossed} text="No tables set up yet"
              sub="Add tables in the Tables section" />
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {activeTables
                .sort((a, b) => a.number - b.number)
                .map((table) => (
                  <TablePill key={table._id} table={table} />
                ))}
            </div>
          )}

          {/* Summary strip */}
          {activeTables.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
              {[
                { label: "Available", count: available,     cls: "text-emerald-600" },
                { label: "Occupied",  count: occupied,       cls: "text-blue-600"   },
                { label: "Bill",      count: billRequested,  cls: "text-orange-600" },
              ].map(({ label, count, cls }) => (
                <div key={label} className="text-center">
                  <p className={`text-xl font-display font-bold ${cls}`}>{count}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick actions row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {[
          { to: "/kitchen",      icon: ChefHat,         label: "Kitchen View",   color: "text-orange-500", bg: "bg-orange-50 hover:bg-orange-100" },
          { to: "/waiter",       icon: UtensilsCrossed, label: "Waiter View",    color: "text-blue-500",   bg: "bg-blue-50   hover:bg-blue-100"   },
          { to: "/admin/orders", icon: ShoppingBag,     label: "All Orders",     color: "text-purple-500", bg: "bg-purple-50 hover:bg-purple-100" },
          { to: "/admin/reports",icon: TrendingUp,      label: "Reports",        color: "text-emerald-500",bg: "bg-emerald-50 hover:bg-emerald-100"},
        ].map(({ to, icon: Icon, label, color, bg }) => (
          <Link key={to} to={to}
            className={`${bg} rounded-2xl p-4 flex flex-col items-center gap-2
                        transition-colors group`}>
            <Icon size={22} className={`${color} group-hover:scale-110 transition-transform`} />
            <span className="text-xs font-medium text-gray-600">{label}</span>
          </Link>
        ))}
      </div>

    </AdminLayout>
  );
}