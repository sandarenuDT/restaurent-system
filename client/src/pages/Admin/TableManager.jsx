import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, QrCode, RefreshCw, Download } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout   from "../../components/layout/AdminLayout.jsx";
import Modal         from "../../components/ui/Modal.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import StatusBadge   from "../../components/ui/StatusBadge.jsx";
import { PageSpinner } from "../../components/ui/Spinner.jsx";
import { getTables, createTable, updateTable, deleteTable, regenerateQR } from "../../api/tableApi.js";

const EMPTY_FORM = { number: "", name: "", capacity: 4, location: "indoor" };
const LOCATIONS  = ["indoor", "outdoor", "bar", "private"];

export default function TableManager() {
  const [tables,    setTables]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModal,   setQrModal]   = useState(null);   // table object
  const [deleteId,  setDeleteId]  = useState(null);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [regenId,   setRegenId]   = useState(null);

  const load = async () => {
    try {
      const { data } = await getTables();
      setTables(data.data || []);
    } catch { toast.error("Failed to load tables."); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit   = (t)  => {
    setEditing(t);
    setForm({ number: t.number, name: t.name || "", capacity: t.capacity, location: t.location });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.number) { toast.error("Table number is required."); return; }
    if (!form.capacity || form.capacity < 1) { toast.error("Capacity must be at least 1."); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateTable(editing._id, form);
        toast.success("Table updated!");
      } else {
        await createTable(form);
        toast.success("Table created! QR code generated automatically.");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save table.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTable(deleteId);
      toast.success("Table deleted.");
      setDeleteId(null);
      load();
    } catch { toast.error("Failed to delete table."); }
    finally  { setDeleting(false); }
  };

  const handleRegenQR = async (table) => {
    setRegenId(table._id);
    try {
      const { data } = await regenerateQR(table._id);
      toast.success("New QR code generated!");
      setQrModal(data.data);
      load();
    } catch { toast.error("Failed to regenerate QR."); }
    finally  { setRegenId(null); }
  };

  const downloadQR = (table) => {
    if (!table.qrCode) return;
    const link   = document.createElement("a");
    link.href    = table.qrCode;
    link.download = `table-${table.number}-qr.png`;
    link.click();
  };

  if (loading) return <AdminLayout title="Table Manager"><PageSpinner /></AdminLayout>;

  const statusGroups = {
    available:      tables.filter((t) => t.status === "available").length,
    occupied:       tables.filter((t) => t.status === "occupied").length,
    bill_requested: tables.filter((t) => t.status === "bill_requested").length,
  };

  return (
    <AdminLayout title="Table Manager">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Available",     count: statusGroups.available,      color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Occupied",      count: statusGroups.occupied,        color: "text-blue-600",   bg: "bg-blue-50"    },
          { label: "Bill Needed",   count: statusGroups.bill_requested,  color: "text-orange-600", bg: "bg-orange-50"  },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`card p-4 text-center ${bg}`}>
            <p className={`text-3xl font-display font-bold ${color}`}>{count}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{tables.length} tables total</p>
        <button onClick={openCreate} className="btn btn-primary btn-md gap-2">
          <Plus size={16} /> Add Table
        </button>
      </div>

      {/* Grid of table cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.sort((a, b) => a.number - b.number).map((table) => (
          <div key={table._id} className="card p-4 hover:shadow-md transition-shadow">
            {/* Number + status */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-display font-bold text-2xl text-gray-900">{table.number}</p>
                {table.name && <p className="text-xs text-gray-400">{table.name}</p>}
              </div>
              <StatusBadge type="table" status={table.status} />
            </div>

            {/* Info */}
            <div className="space-y-1 mb-4 text-xs text-gray-500">
              <p>👥 Capacity: {table.capacity}</p>
              <p>📍 {table.location.charAt(0).toUpperCase() + table.location.slice(1)}</p>
            </div>

            {/* QR preview */}
            {table.qrCode && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-xl">
                <img src={table.qrCode} alt="QR" className="w-12 h-12 rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700">QR Code</p>
                  <p className="text-xs text-gray-400 truncate">Table {table.number} menu link</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={() => { setQrModal(table); }}
                className="btn btn-outline btn-sm flex-1 gap-1">
                <QrCode size={13} /> QR
              </button>
              <button onClick={() => openEdit(table)}
                className="btn btn-outline btn-sm flex-1 gap-1">
                <Pencil size={13} /> Edit
              </button>
              <button onClick={() => setDeleteId(table._id)}
                className="btn btn-sm hover:bg-red-50 hover:text-red-500 border border-gray-200 text-gray-400 rounded-xl p-1.5">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? `Edit Table ${editing.number}` : "Add New Table"} size="sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Table Number *</label>
              <input type="number" min="1" value={form.number}
                onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))}
                placeholder="1" className="input" disabled={!!editing} />
            </div>
            <div>
              <label className="label">Capacity *</label>
              <input type="number" min="1" max="20" value={form.capacity}
                onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                className="input" />
            </div>
          </div>
          <div>
            <label className="label">Display Name (optional)</label>
            <input value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Window Seat, VIP Room" className="input" />
          </div>
          <div>
            <label className="label">Location</label>
            <select value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="input">
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>
          </div>
          {!editing && (
            <p className="text-xs text-gray-400 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
              💡 A QR code will be automatically generated when you create this table.
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={() => setModalOpen(false)} className="btn btn-outline btn-md flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-md flex-1">
              {saving
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : editing ? "Save Changes" : "Create Table"
              }
            </button>
          </div>
        </div>
      </Modal>

      {/* ── QR Code Modal ───────────────────────────────────────────────── */}
      <Modal isOpen={!!qrModal} onClose={() => setQrModal(null)}
        title={`Table ${qrModal?.number} QR Code`} size="sm">
        {qrModal && (
          <div className="flex flex-col items-center gap-4">
            {qrModal.qrCode ? (
              <img src={qrModal.qrCode} alt="QR Code"
                className="w-56 h-56 border border-gray-200 rounded-2xl" />
            ) : (
              <div className="w-56 h-56 bg-gray-100 rounded-2xl flex items-center justify-center">
                <QrCode size={40} className="text-gray-300" />
              </div>
            )}
            <p className="text-xs text-gray-400 text-center">
              Customers scan this QR code to access the digital menu for Table {qrModal.number}
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => handleRegenQR(qrModal)}
                disabled={regenId === qrModal._id}
                className="btn btn-outline btn-md flex-1 gap-1.5"
              >
                <RefreshCw size={14} className={regenId === qrModal._id ? "animate-spin" : ""} />
                Regenerate
              </button>
              <button
                onClick={() => downloadQR(qrModal)}
                disabled={!qrModal.qrCode}
                className="btn btn-primary btn-md flex-1 gap-1.5"
              >
                <Download size={14} /> Download
              </button>
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-center">
              ⚠️ Regenerating invalidates the old printed QR code for this table.
            </p>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} loading={deleting}
        title="Delete Table?" message="This will remove the table and its QR code permanently."
        confirmLabel="Delete" danger
      />
    </AdminLayout>
  );
}