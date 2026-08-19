import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, ImageOff } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout    from "../../components/layout/AdminLayout.jsx";
import Modal          from "../../components/ui/Modal.jsx";
import ConfirmDialog  from "../../components/ui/ConfirmDialog.jsx";
import { PageSpinner } from "../../components/ui/Spinner.jsx";
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailable } from "../../api/menuApi.js";

const CATEGORIES = [
  { value: "starters",         label: "Starters"        },
  { value: "mains",            label: "Mains"           },
  { value: "rice_and_noodles", label: "Rice & Noodles"  },
  { value: "grills",           label: "Grills"          },
  { value: "seafood",          label: "Seafood"         },
  { value: "vegetarian",       label: "Vegetarian"      },
  { value: "desserts",         label: "Desserts"        },
  { value: "beverages",        label: "Beverages"       },
  { value: "specials",         label: "Today's Specials"},
];

const EMPTY_FORM = {
  name: "", description: "", category: "mains", price: "",
  prepTimeMinutes: 15, isVegetarian: false, isVegan: false,
  isGlutenFree: false, isSpicy: false, isPopular: false, isChefSpecial: false,
  image: null,
};

export default function MenuManager() {
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterCat,   setFilterCat]   = useState("all");
  const [modalOpen,   setModalOpen]   = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [imagePreview,setImagePreview]= useState(null);

  const load = async () => {
    try {
      const { data } = await getMenuItems();
      //object desturture
      //const data = {
      // }
      setItems(data.data || []);
    } catch { toast.error("Failed to load menu items."); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    console.log(item);
    setForm({
      name: item.name, description: item.description || "",
      category: item.category, price: item.price,
      prepTimeMinutes: item.prepTimeMinutes || 15,
      isVegetarian:  item.tags?.isVegetarian  || false,
      isVegan:       item.tags?.isVegan       || false,
      isGlutenFree:  item.tags?.isGlutenFree  || false,
      isSpicy:       item.tags?.isSpicy       || false,
      isPopular:     item.tags?.isPopular     || false,
      isChefSpecial: item.tags?.isChefSpecial || false,
      image: null,
    });
    setImagePreview(item.image?.url || null);
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((p) => ({ ...p, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    console.log(form);
    if (!form.name.trim()) { toast.error("Name is required."); return; }
    if (!form.price || isNaN(form.price)) { toast.error("Valid price is required."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name",            form.name);
      fd.append("description",     form.description);
      fd.append("category",        form.category);
      fd.append("price",           form.price);
      fd.append("prepTimeMinutes", form.prepTimeMinutes);
      fd.append("tags[isVegetarian]",  form.isVegetarian);
      fd.append("tags[isVegan]",       form.isVegan);
      fd.append("tags[isGlutenFree]",  form.isGlutenFree);
      fd.append("tags[isSpicy]",       form.isSpicy);
      fd.append("tags[isPopular]",     form.isPopular);
      fd.append("tags[isChefSpecial]", form.isChefSpecial);
      if (form.image) fd.append("image", form.image);

      if (editing) {
        await updateMenuItem(editing.id, fd);
        toast.success("Item updated!");
      } else {
        await createMenuItem(fd);
        toast.success("Item created!");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMenuItem(deleteId);
      toast.success("Item deleted.");
      setDeleteId(null);
      load();
    } catch { toast.error("Failed to delete item."); }
    finally  { setDeleting(false); }
  };

  const handleToggle = async (item) => {
    try {
      await toggleAvailable(item.id, !item.isAvailable);
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i));
      toast.success(item.isAvailable ? "Item marked unavailable" : "Item marked available");
    } catch { toast.error("Failed to update availability."); }
  };

  const filtered = items.filter((i) => {
    const matchCat    = filterCat === "all" || i.category === filterCat;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) return <AdminLayout title="Menu Manager"><PageSpinner /></AdminLayout>;

  return (
    <AdminLayout title="Menu Manager">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..." className="input pl-9" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input w-auto">
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button onClick={openCreate} className="btn btn-primary btn-md gap-2 flex-shrink-0">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-4 text-sm text-gray-500">
        <span>{items.length} total items</span>
        <span className="text-emerald-600">{items.filter((i) => i.isAvailable).length} available</span>
        <span className="text-red-500">{items.filter((i) => !i.isAvailable).length} unavailable</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Item</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Tags</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">No items found</td>
                </tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image?.url ? (
                        <img src={item.image.url} alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <ImageOff size={16} className="text-gray-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-gray-400 truncate max-w-[180px]">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="badge badge-blue capitalize">{item.category.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    LKR {item.price?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {item.tags?.isSpicy       && <span className="badge badge-red">🌶 Spicy</span>}
                      {item.tags?.isVegetarian  && <span className="badge badge-green">🌿 Veg</span>}
                      {item.tags?.isPopular     && <span className="badge badge-orange">⭐ Popular</span>}
                      {item.tags?.isChefSpecial && <span className="badge badge-purple">👨‍🍳 Chef's</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(item)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors
                        ${item.isAvailable ? "text-emerald-600 hover:text-emerald-700" : "text-red-500 hover:text-red-600"}`}>
                      {item.isAvailable
                        ? <><ToggleRight size={18} /> Available</>
                        : <><ToggleLeft  size={18} /> Unavailable</>
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(item)}
                        className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteId(item.id)}
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

      {/* ── Create / Edit Modal ─────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? "Edit Menu Item" : "Add Menu Item"} size="lg">
        <div className="space-y-4">
          {/* Image upload */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
              {imagePreview
                ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><ImageOff size={20} className="text-gray-300" /></div>
              }
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Item Photo</p>
              <label className="btn btn-outline btn-sm cursor-pointer">
                Choose Image
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · Max 5MB</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Item Name *</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Grilled Chicken" className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea rows={2} value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Short description shown to customers..." className="input resize-none" />
            </div>
            <div>
              <label className="label">Category *</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="input">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Price (LKR) *</label>
              <input type="number" min="0" value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                placeholder="0" className="input" />
            </div>
            <div>
              <label className="label">Prep Time (minutes)</label>
              <input type="number" min="0" value={form.prepTimeMinutes}
                onChange={(e) => setForm((p) => ({ ...p, prepTimeMinutes: e.target.value }))}
                className="input" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="label">Tags</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: "isVegetarian",  label: "🌿 Vegetarian"    },
                { key: "isVegan",       label: "🌱 Vegan"          },
                { key: "isGlutenFree",  label: "🌾 Gluten Free"    },
                { key: "isSpicy",       label: "🌶 Spicy"          },
                { key: "isPopular",     label: "⭐ Popular"        },
                { key: "isChefSpecial", label: "👨‍🍳 Chef's Special" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl
                  border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all">
                  <input type="checkbox" checked={form[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
                    className="w-4 h-4 accent-brand-500" />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn btn-outline btn-md flex-1" disabled={saving}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-md flex-1">
              {saving
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : editing ? "Save Changes" : "Add Item"
              }
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} loading={deleting}
        title="Delete Item?" message="This action cannot be undone."
        confirmLabel="Delete" danger
      />
    </AdminLayout>
  );
}