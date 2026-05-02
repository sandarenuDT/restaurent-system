import { useState, useEffect } from "react";
import { Calendar, TrendingUp, DollarSign, ShoppingBag, Users, Download, RefreshCw } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import { PageSpinner } from "../../components/ui/Spinner.jsx";
import api from "../../api/axios.js";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4"];

const StatBox = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card p-5">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={19} className="text-white" />
      </div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
    <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

export default function Reports() {
  const [loading,    setLoading]    = useState(true);
  const [period,     setPeriod]     = useState("week");  // week | month
  const [data,       setData]       = useState(null);
  const [startDate,  setStartDate]  = useState("");
  const [endDate,    setEndDate]    = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = { period };
      if (startDate) params.startDate = startDate;
      if (endDate)   params.endDate   = endDate;
      const { data: res } = await api.get("/admin/reports", { params });
      setData(res.data);
    } catch { toast.error("Failed to load report data."); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, [period]);

  const handleExport = () => {
    if (!data) return;
    const csv = [
      ["Date", "Revenue", "Orders", "Bills"],
      ...(data.revenueChart || []).map((r) => [r.date || r.day, r.revenue, r.orders, r.bills]),
    ].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `report-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Reports & Analytics">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2">
          {["week", "month"].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`btn btn-md capitalize ${period === p ? "btn-primary" : "btn-outline"}`}>
              {p === "week" ? "Last 7 Days" : "Last 30 Days"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center ml-auto">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input w-auto text-sm" />
          <span className="text-gray-400 text-sm">to</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input w-auto text-sm" />
          <button onClick={load} className="btn btn-outline btn-md gap-1.5">
            <RefreshCw size={14} /> Apply
          </button>
          <button onClick={handleExport} className="btn btn-outline btn-md gap-1.5">
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {loading ? <PageSpinner text="Generating report..." /> : !data ? (
        <div className="text-center py-20 text-gray-400">No report data available</div>
      ) : (
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatBox icon={DollarSign} label="Total Revenue"  value={`LKR ${data.totalRevenue?.toLocaleString() || 0}`}  sub={`${period === "week" ? "7" : "30"} days`} color="bg-brand-500" />
            <StatBox icon={ShoppingBag}label="Total Orders"   value={data.totalOrders  || 0} sub="orders placed"         color="bg-blue-500"    />
            <StatBox icon={TrendingUp}  label="Avg Order Value" value={`LKR ${Math.round(data.avgOrderValue || 0).toLocaleString()}`} sub="per order" color="bg-emerald-500" />
            <StatBox icon={Users}       label="Customers Served" value={data.customersServed || 0} sub="guest count"     color="bg-purple-500"  />
          </div>

          {/* Revenue over time */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-gray-800 mb-4">Revenue Over Time</h3>
            {data.revenueChart?.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey={period === "week" ? "day" : "date"} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                    formatter={(v) => [`LKR ${v?.toLocaleString()}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5}
                    dot={{ fill: "#f97316", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data</div>}
          </div>

          {/* Orders per day + Category breakdown */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-display font-bold text-gray-800 mb-4">Orders Per Day</h3>
              {data.revenueChart?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey={period === "week" ? "day" : "date"} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data</div>}
            </div>

            <div className="card p-5">
              <h3 className="font-display font-bold text-gray-800 mb-4">Sales by Category</h3>
              {data.categoryBreakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={data.categoryBreakdown} dataKey="revenue" nameKey="category"
                      cx="50%" cy="50%" outerRadius={75} label={({ category, percent }) =>
                        `${category.replace(/_/g, " ")} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {data.categoryBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`LKR ${v?.toLocaleString()}`, "Revenue"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data</div>}
            </div>
          </div>

          {/* Top performing items */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-gray-800 mb-4">Top Menu Items</h3>
            {data.topItems?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2.5 font-semibold text-gray-600 rounded-l-xl">#</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-gray-600">Item</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-gray-600 hidden sm:table-cell">Category</th>
                      <th className="text-right px-3 py-2.5 font-semibold text-gray-600">Qty Sold</th>
                      <th className="text-right px-3 py-2.5 font-semibold text-gray-600 rounded-r-xl">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.topItems.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold
                            ${i === 0 ? "bg-yellow-100 text-yellow-700"
                            : i === 1 ? "bg-gray-100 text-gray-600"
                            : i === 2 ? "bg-orange-100 text-orange-700"
                            : "text-gray-400"}`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-gray-800">{item.name}</td>
                        <td className="px-3 py-2.5 hidden sm:table-cell">
                          <span className="badge badge-blue capitalize">{item.category?.replace(/_/g, " ")}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right text-gray-600">{item.count}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-gray-800">
                          LKR {item.revenue?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-center text-gray-400 py-8 text-sm">No sales data</p>}
          </div>

          {/* Peak hours */}
          {data.peakHours?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display font-bold text-gray-800 mb-4">Peak Hours</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                    tickFormatter={(h) => `${h}:00`} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip labelFormatter={(h) => `${h}:00 – ${h + 1}:00`}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}