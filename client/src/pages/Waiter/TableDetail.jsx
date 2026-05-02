import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Users, Clock, RefreshCw, Receipt,
  CheckCircle2, ChefHat, Utensils, Plus, AlertCircle,
  CreditCard, Banknote, Smartphone,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSocket } from "../../context/SocketContext.jsx";
import { getTableById, updateTableStatus } from "../../api/tableApi.js";
import { getTableOrders, updateItemStatus } from "../../api/orderApi.js";
import { getSessionBill, settleBill, applyDiscount } from "../../api/billingApi.js";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { PageSpinner } from "../../components/ui/Spinner.jsx";

// ── Item status badge ─────────────────────────────────────────────────────────
const ItemDot = ({ status }) => {
  const colors = {
    pending:   "bg-orange-400",
    preparing: "bg-yellow-400",
    ready:     "bg-emerald-400 animate-pulse",
    served:    "bg-gray-300",
    cancelled: "bg-red-400",
  };
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors[status] || "bg-gray-300"}`} />;
};

// ── Elapsed time helper ───────────────────────────────────────────────────────
const elapsed = (date) => {
  if (!date) return "";
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

export default function TableDetail() {
  const { tableId }        = useParams();
  const navigate           = useNavigate();
  const { socket }         = useSocket();

  const [table,    setTable]    = useState(null);
  const [orders,   setOrders]   = useState([]);
  const [bill,     setBill]     = useState(null);
  const [loading,  setLoading]  = useState(true);

  // Modal states
  const [billModalOpen,    setBillModalOpen]    = useState(false);
  const [settleModalOpen,  setSettleModalOpen]  = useState(false);
  const [discountModalOpen,setDiscountModalOpen]= useState(false);
  const [paymentMethod,    setPaymentMethod]    = useState("cash");
  const [discountAmount,   setDiscountAmount]   = useState("");
  const [discountNote,     setDiscountNote]     = useState("");
  const [settling,         setSettling]         = useState(false);

  // ── Load table + orders ───────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [tableRes, ordersRes] = await Promise.all([
        getTableById(tableId),
        getTableOrders(tableId),   // waiter uses tableId not token here
      ]);
      setTable(tableRes.data.data);
      setOrders(ordersRes.data.data || []);
    } catch (err) {
      toast.error("Failed to load table data.");
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Load bill preview ─────────────────────────────────────────────────────
  const loadBill = useCallback(async () => {
    if (!table?.activeSession) return;
    try {
      const { data } = await getSessionBill(table.activeSession);
      setBill(data.data);
    } catch {
      toast.error("Could not load bill.");
    }
  }, [table?.activeSession]);

  // ── Real-time updates ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on("order:new", (order) => {
      if (order.tableNumber === table?.number) {
        setOrders((prev) => [order, ...prev]);
        toast.success(`New order arrived — Table ${order.tableNumber}`);
      }
    });

    socket.on("order:updated", (updated) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? { ...o, ...updated } : o))
      );
    });

    socket.on("order:item:updated", ({ orderId, itemId, status }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, items: o.items.map((i) => (i._id === itemId ? { ...i, status } : i)) }
            : o
        )
      );
    });

    socket.on("table:status:updated", ({ tableId: tid, status }) => {
      if (tid === tableId) setTable((prev) => ({ ...prev, status }));
    });

    return () => {
      socket.off("order:new");
      socket.off("order:updated");
      socket.off("order:item:updated");
      socket.off("table:status:updated");
    };
  }, [socket, table?.number, tableId]);

  // ── Mark item as served ───────────────────────────────────────────────────
  const handleServeItem = async (orderId, itemId) => {
    try {
      await updateItemStatus(orderId, itemId, "served");
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, items: o.items.map((i) => (i._id === itemId ? { ...i, status: "served" } : i)) }
            : o
        )
      );
      toast.success("Item marked as served");
    } catch {
      toast.error("Failed to update item.");
    }
  };

  // ── Open bill modal ───────────────────────────────────────────────────────
  const handleOpenBill = async () => {
    await loadBill();
    setBillModalOpen(true);
  };

  // ── Settle bill ───────────────────────────────────────────────────────────
  const handleSettle = async () => {
    if (!table?.activeSession) return;
    setSettling(true);
    try {
      await settleBill(table.activeSession, { paymentMethod });
      toast.success("Bill settled! Table is now available.");
      setBillModalOpen(false);
      setSettleModalOpen(false);
      navigate("/waiter");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to settle bill.");
    } finally {
      setSettling(false);
    }
  };

  // ── Apply discount ────────────────────────────────────────────────────────
  const handleApplyDiscount = async () => {
    if (!discountAmount || isNaN(discountAmount)) {
      toast.error("Enter a valid discount amount."); return;
    }
    try {
      await applyDiscount(table.activeSession, {
        discountAmount: parseFloat(discountAmount),
        discountNote,
      });
      toast.success("Discount applied!");
      setDiscountModalOpen(false);
      await loadBill();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply discount.");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <PageSpinner text="Loading table..." />
    </div>
  );

  if (!table) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <AlertCircle size={36} className="text-red-400 mx-auto mb-2" />
        <p className="text-gray-600 font-medium">Table not found</p>
        <button onClick={() => navigate("/waiter")} className="btn btn-outline btn-md mt-4">
          Back to Tables
        </button>
      </div>
    </div>
  );

  const allItems     = orders.flatMap((o) => o.items.filter((i) => i.status !== "cancelled"));
  const readyItems   = allItems.filter((i) => i.status === "ready");
  const pendingItems = allItems.filter((i) => i.status === "pending" || i.status === "preparing");
  const servedItems  = allItems.filter((i) => i.status === "served");
  const subtotal     = orders.reduce((s, o) => s + (o.subtotal || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/waiter")}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft size={19} />
          </button>

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <ChefHat size={17} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-gray-900 leading-none">
                Table {table.number}
                {table.name && <span className="text-gray-400 font-normal text-sm ml-1.5">· {table.name}</span>}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge type="table" status={table.status} />
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Users size={11} /> Capacity {table.capacity}
                </span>
              </div>
            </div>
          </div>

          <button onClick={loadData}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-4 pb-28">

        {/* ── Ready to serve alert ──────────────────────────────────────── */}
        {readyItems.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-slide-down">
            <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
            <p className="text-emerald-800 font-medium text-sm">
              <span className="font-bold">{readyItems.length}</span> item{readyItems.length > 1 ? "s" : ""} ready to serve at this table!
            </p>
          </div>
        )}

        {/* ── Summary row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending",   count: pendingItems.length, color: "text-orange-600", bg: "bg-orange-50",  border: "border-orange-200" },
            { label: "Ready",     count: readyItems.length,   color: "text-emerald-600",bg: "bg-emerald-50", border: "border-emerald-200" },
            { label: "Served",    count: servedItems.length,  color: "text-gray-500",   bg: "bg-gray-50",    border: "border-gray-200"   },
          ].map(({ label, count, color, bg, border }) => (
            <div key={label} className={`rounded-2xl border ${border} ${bg} p-3 text-center`}>
              <p className={`text-2xl font-display font-bold ${color}`}>{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Orders list ───────────────────────────────────────────────── */}
        {orders.length === 0 ? (
          <div className="card p-10 text-center">
            <Utensils size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No orders yet</p>
            <p className="text-gray-300 text-sm mt-1">Customer hasn't ordered yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order._id} className="card overflow-hidden">
                {/* Order header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center
                                     text-brand-700 font-bold text-xs">
                      #{order.orderNumber}
                    </span>
                    <StatusBadge type="order" status={order.status} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock size={12} />
                    {elapsed(order.placedAt)}
                  </div>
                </div>

                {/* Order items */}
                <div className="divide-y divide-gray-50">
                  {order.items
                    .filter((i) => i.status !== "cancelled")
                    .map((item) => (
                      <div key={item._id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                        <ItemDot status={item.status} />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {item.quantity}× {item.name}
                          </p>
                          {item.variant?.option && (
                            <p className="text-xs text-gray-400">{item.variant.option}</p>
                          )}
                          {item.specialInstructions && (
                            <p className="text-xs text-amber-600 italic mt-0.5">
                              "{item.specialInstructions}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">
                            LKR {item.lineTotal?.toLocaleString()}
                          </p>
                          {/* Serve button — only for ready items */}
                          {item.status === "ready" && (
                            <button
                              onClick={() => handleServeItem(order._id, item._id)}
                              className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white
                                         opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <CheckCircle2 size={13} /> Serve
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Order note */}
                {order.orderNote && (
                  <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
                    <p className="text-xs text-amber-700">📝 {order.orderNote}</p>
                  </div>
                )}

                {/* Order subtotal */}
                <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex justify-between">
                  <span className="text-xs text-gray-400">Order subtotal</span>
                  <span className="text-sm font-semibold text-gray-700">
                    LKR {order.subtotal?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Sticky bottom action bar ──────────────────────────────────────── */}
      {orders.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-20">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-400">Running total</p>
              <p className="font-display font-bold text-gray-900 text-lg leading-none mt-0.5">
                LKR {subtotal.toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleOpenBill}
              className="btn btn-primary btn-lg gap-2 flex-shrink-0"
            >
              <Receipt size={17} />
              View Bill
            </button>
          </div>
        </div>
      )}

      {/* ── Bill Preview Modal ─────────────────────────────────────────── */}
      <Modal isOpen={billModalOpen} onClose={() => setBillModalOpen(false)} title="Bill Preview" size="md">
        {bill ? (
          <div className="space-y-4">
            {/* Line items */}
            <div className="space-y-2">
              {bill.lineItems?.map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm">
                  <div>
                    <p className="text-gray-800 font-medium">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.quantity} × LKR {item.unitPrice?.toLocaleString()}</p>
                  </div>
                  <p className="font-medium text-gray-800">LKR {item.lineTotal?.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-dashed border-gray-200 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>LKR {bill.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax ({bill.taxRate}%)</span>
                <span>LKR {bill.taxAmount?.toLocaleString()}</span>
              </div>
              {bill.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount {bill.discountNote && `(${bill.discountNote})`}</span>
                  <span>− LKR {bill.discountAmount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-lg pt-1 border-t border-gray-200">
                <span>Total</span>
                <span>LKR {bill.total?.toLocaleString()}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDiscountModalOpen(true)}
                className="btn btn-outline btn-md flex-1"
              >
                Apply Discount
              </button>
              <button
                onClick={() => setSettleModalOpen(true)}
                className="btn btn-primary btn-md flex-1"
              >
                <CreditCard size={15} /> Settle Bill
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        )}
      </Modal>

      {/* ── Settle Bill Modal ──────────────────────────────────────────── */}
      <Modal isOpen={settleModalOpen} onClose={() => setSettleModalOpen(false)} title="Settle Payment" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Select payment method:</p>

          {/* Payment method selector */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "cash",   label: "Cash",   icon: Banknote   },
              { value: "card",   label: "Card",   icon: CreditCard },
              { value: "online", label: "Online", icon: Smartphone },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setPaymentMethod(value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all
                  ${paymentMethod === value
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-500"
                  }`}
              >
                <Icon size={22} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* Total reminder */}
          <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Amount to collect</span>
            <span className="font-display font-bold text-xl text-gray-900">
              LKR {bill?.total?.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleSettle}
            disabled={settling}
            className="btn btn-primary btn-lg w-full"
          >
            {settling
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : `Confirm ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} Payment`
            }
          </button>
        </div>
      </Modal>

      {/* ── Discount Modal ─────────────────────────────────────────────── */}
      <Modal isOpen={discountModalOpen} onClose={() => setDiscountModalOpen(false)} title="Apply Discount" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Discount Amount (LKR)</label>
            <input
              type="number"
              placeholder="e.g. 500"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              className="input"
              min="0"
            />
          </div>
          <div>
            <label className="label">Reason (optional)</label>
            <input
              type="text"
              placeholder="e.g. Loyalty discount, staff discount..."
              value={discountNote}
              onChange={(e) => setDiscountNote(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setDiscountModalOpen(false)} className="btn btn-outline btn-md flex-1">
              Cancel
            </button>
            <button onClick={handleApplyDiscount} className="btn btn-primary btn-md flex-1">
              Apply
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}