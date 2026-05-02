import { useState, useEffect } from "react";
import { Search, Filter, ChevronDown, ChevronUp, RefreshCw, Eye } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout   from "../../components/layout/AdminLayout.jsx";
import Modal         from "../../components/ui/Modal.jsx";
import StatusBadge   from "../../components/ui/StatusBadge.jsx";
import { PageSpinner } from "../../components/ui/Spinner.jsx";
import { getAllOrders, getOrderById, cancelOrder } from "../../api/orderApi.js";

const STATUS_OPTIONS = ["all", "pending", "confirmed", "preparing", "ready", "served", "cancelled"];

export default function OrderHistory() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [status,     setStatus]     = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [detail,     setDetail]     = useState(null);  // order object for detail modal
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const LIMIT = 20;

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, sort: "-createdAt" };
      if (status !== "all")  params.status = status;
      if (dateFilter)        params.date   = dateFilter;
      if (search)            params.tableNumber = search;

      const { data } = await getAllOrders(params);
      setOrders(data.data  || []);
      setTotal(data.total  || 0);
    } catch { toast.error("Failed to load orders."); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, status, dateFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const openDetail = async (order) => {
    setLoadingDetail(true);
    setDetail({ loading: true });
    try {
      const { data } = await getOrderById(order._id);
      setDetail(data.data);
    } catch { toast.error("Failed to load order details."); setDetail(null); }
    finally  { setLoadingDetail(false); }
  };

  const handleCancel = async (orderId) => {
    try {
      await cancelOrder(orderId, "Cancelled by admin");
      toast.success("Order cancelled.");
      setDetail(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to cancel order."); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminLayout title="Order History">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by table number..." className="input pl-9" />
        </form>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input w-auto">
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <input type="date" value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} className="input w-auto" />
        <button onClick={() => { setSearch(""); setStatus("all"); setDateFilter(""); setPage(1); }}
          className="btn btn-outline btn-md gap-1.5">
          <RefreshCw size={14} /> Reset
        </button>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-4 text-sm text-gray-500">
        <span>{total} total orders</span>
        <span>Page {page} of {totalPages || 1}</span>
      </div>

      {/* Table */}
      {loading ? <PageSpinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Order</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Table</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Items</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Time</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">No orders found</td></tr>
                ) : orders.map((order) => (
                  <>
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-brand-600">#{order.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        Table {order.tableNumber}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-500">
                        {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        LKR {order.subtotal?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge type="order" status={order.status} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleString("en-LK", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openDetail(order)}
                            className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                            {expandedId === order._id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline expanded items */}
                    {expandedId === order._id && (
                      <tr key={`${order._id}-expand`}>
                        <td colSpan={7} className="px-6 pb-3 bg-gray-50">
                          <div className="space-y-1.5 pt-1">
                            {order.items?.map((item) => (
                              <div key={item._id} className="flex items-center justify-between text-xs text-gray-600">
                                <span>{item.quantity}× {item.name}
                                  {item.variant?.option && <span className="text-gray-400 ml-1">({item.variant.option})</span>}
                                </span>
                                <div className="flex items-center gap-3">
                                  <StatusBadge type="order" status={item.status} />
                                  <span className="font-medium">LKR {item.lineTotal?.toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                            {order.orderNote && (
                              <p className="text-xs text-amber-600 italic mt-1">📝 {order.orderNote}</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="btn btn-outline btn-sm">Previous</button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="btn btn-outline btn-sm">Next</button>
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Order Details" size="md">
        {detail?.loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono font-bold text-brand-600 text-lg">#{detail.orderNumber}</p>
                <p className="text-sm text-gray-500">Table {detail.tableNumber}</p>
              </div>
              <StatusBadge type="order" status={detail.status} />
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-3">
              {detail.items?.map((item) => (
                <div key={item._id} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {item.quantity}× {item.name}
                      {item.variant?.option && <span className="text-gray-400 text-xs ml-1">({item.variant.option})</span>}
                    </p>
                    {item.specialInstructions && (
                      <p className="text-xs text-amber-600 italic">{item.specialInstructions}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge type="order" status={item.status} />
                    <span className="text-sm font-medium">LKR {item.lineTotal?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
              <span>Subtotal</span>
              <span>LKR {detail.subtotal?.toLocaleString()}</span>
            </div>

            {detail.status !== "cancelled" && detail.status !== "served" && (
              <button onClick={() => handleCancel(detail._id)}
                className="btn btn-danger btn-md w-full mt-2">
                Cancel This Order
              </button>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}