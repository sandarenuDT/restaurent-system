import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Eye, EyeOff, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout   from "../../components/layout/AdminLayout.jsx";
import Modal         from "../../components/ui/Modal.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import { PageSpinner } from "../../components/ui/Spinner.jsx";
import { getStaff, createStaff, updateStaff, deleteStaff, toggleStaffActive, resetStaffPin } from "../../api/staffApi.js";

const ROLES = [
  { value: "admin",   label: "Admin",   desc: "Full access — manage everything",    color: "badge-purple" },
  { value: "waiter",  label: "Waiter",  desc: "Tables, orders, billing",             color: "badge-blue"   },
  { value: "kitchen", label: "Kitchen", desc: "Kitchen display, update order status", color: "badge-orange" },
];

const EMPTY_FORM = { name: "", email: "", password: "", role: "waiter", pin: "" };

export default function StaffManager() {
  const [staff,     setStaff]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [pinModal,  setPinModal]  = useState(null);  // staff object
  const [deleteId,  setDeleteId]  = useState(null);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [newPin,    setNewPin]    = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [filterRole,setFilterRole]= useState("all");

  const load = async () => {
    try {
      const { data } = await getStaff();
      setStaff(data.data || []);
    } catch { toast.error("Failed to load staff."); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowPass(false); setModalOpen(true); };
  const openEdit   = (s) => {
    setEditing(s);
    setForm({ name: s.name, email: s.email, password: "", role: s.role, pin: "" });
    setShowPass(false);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim())  { toast.error("Name is required.");  return; }
    if (!form.email.trim()) { toast.error("Email is required."); return; }
    if (!editing && form.password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, role: form.role };
      if (form.password) payload.password = form.password;
      if (form.pin)      payload.pin      = form.pin;

      if (editing) {
        await updateStaff(editing._id, payload);
        toast.success("Staff updated!");
      } else {
        await createStaff(payload);
        toast.success("Staff account created!");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save staff.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteStaff(deleteId);
      toast.success("Staff account deleted.");
      setDeleteId(null);
      load();
    } catch { toast.error("Failed to delete staff."); }
    finally  { setDeleting(false); }
  };

  const handleToggle = async (s) => {
    try {
      await toggleStaffActive(s._id);
      setStaff((prev) => prev.map((m) => m._id === s._id ? { ...m, isActive: !m.isActive } : m));
      toast.success(s.isActive ? "Account deactivated" : "Account activated");
    } catch { toast.error("Failed to update status."); }
  };

  const handleResetPin = async () => {
    if (!newPin || newPin.length !== 4 || isNaN(newPin)) {
      toast.error("PIN must be exactly 4 digits."); return;
    }
    try {
      await resetStaffPin(pinModal._id, newPin);
      toast.success("PIN updated!");
      setPinModal(null);
      setNewPin("");
    } catch { toast.error("Failed to reset PIN."); }
  };

  const filtered = staff.filter((s) => filterRole === "all" || s.role === filterRole);

  if (loading) return <AdminLayout title="Staff Manager"><PageSpinner /></AdminLayout>;

  return (
    <AdminLayout title="Staff Manager">
      {/* Role summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {ROLES.map(({ value, label, color }) => (
          <div key={value} className="card p-4 text-center">
            <p className="text-2xl font-display font-bold text-gray-900">
              {staff.filter((s) => s.role === value).length}
            </p>
            <span className={`badge ${color} mt-1`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <button onClick={() => setFilterRole("all")}
            className={`btn btn-sm ${filterRole === "all" ? "btn-primary" : "btn-outline"}`}>All</button>
          {ROLES.map(({ value, label }) => (
            <button key={value} onClick={() => setFilterRole(value)}
              className={`btn btn-sm ${filterRole === value ? "btn-primary" : "btn-outline"}`}>{label}</button>
          ))}
        </div>
        <button onClick={openCreate} className="btn btn-primary btn-md gap-2">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Staff Member</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Last Login</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No staff found</td></tr>
              ) : filtered.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center
                                      text-brand-700 font-bold text-sm flex-shrink-0">
                        {member.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${ROLES.find((r) => r.value === member.role)?.color || "badge-gray"} capitalize`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-400">
                    {member.lastLogin
                      ? new Date(member.lastLogin).toLocaleDateString("en-LK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                      : "Never"
                    }
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(member)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors
                        ${member.isActive ? "text-emerald-600" : "text-red-500"}`}>
                      {member.isActive
                        ? <><ToggleRight size={18} /> Active</>
                        : <><ToggleLeft  size={18} /> Inactive</>
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {member.role === "kitchen" && (
                        <button onClick={() => { setPinModal(member); setNewPin(""); }}
                          className="p-2 rounded-xl hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition-colors"
                          title="Reset PIN">
                          <KeyRound size={15} />
                        </button>
                      )}
                      <button onClick={() => openEdit(member)}
                        className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteId(member._id)}
                        className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create / Edit Modal ────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? "Edit Staff" : "Add Staff Member"} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Kasun Perera" className="input" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="staff@restaurant.com" className="input" disabled={!!editing} />
          </div>
          <div>
            <label className="label">Role *</label>
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="input">
              {ROLES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {ROLES.find((r) => r.value === form.role)?.desc}
            </p>
          </div>
          <div>
            <label className="label">{editing ? "New Password (leave blank to keep current)" : "Password *"}</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder={editing ? "Enter new password..." : "Min. 6 characters"}
                className="input pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          {form.role === "kitchen" && (
            <div>
              <label className="label">4-Digit PIN (for kitchen tablet)</label>
              <input type="number" value={form.pin} maxLength={4}
                onChange={(e) => setForm((p) => ({ ...p, pin: e.target.value.slice(0, 4) }))}
                placeholder="e.g. 1234" className="input font-mono tracking-widest" />
              <p className="text-xs text-gray-400 mt-1">Used for quick login on shared kitchen tablet</p>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={() => setModalOpen(false)} className="btn btn-outline btn-md flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-md flex-1">
              {saving
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : editing ? "Save Changes" : "Create Account"
              }
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Reset PIN Modal ───────────────────────────────────────────── */}
      <Modal isOpen={!!pinModal} onClose={() => setPinModal(null)} title="Reset Kitchen PIN" size="sm">
        {pinModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Set a new 4-digit PIN for <strong>{pinModal.name}</strong></p>
            <input type="number" value={newPin} maxLength={4}
              onChange={(e) => setNewPin(e.target.value.slice(0, 4))}
              placeholder="Enter 4-digit PIN"
              className="input font-mono text-2xl tracking-[0.5em] text-center" />
            <div className="flex gap-3">
              <button onClick={() => setPinModal(null)} className="btn btn-outline btn-md flex-1">Cancel</button>
              <button onClick={handleResetPin} className="btn btn-primary btn-md flex-1">Update PIN</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} loading={deleting}
        title="Delete Staff Account?"
        message="This will permanently remove their account and access."
        confirmLabel="Delete" danger
      />
    </AdminLayout>
  );
}