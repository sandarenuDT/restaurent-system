import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, ChefHat, Search, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext.jsx";
import { getMenuByTable } from "../../api/menuApi.js";
import { placeOrder } from "../../api/orderApi.js";
import MenuItemCard from "./components/MenuItemCard.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import CategoryTabs from "./components/CategoryTabs.jsx";
import { PageSpinner } from "../../components/ui/Spinner.jsx";

const CATEGORY_LABELS = {
  starters:        "Starters",
  mains:           "Mains",
  rice_and_noodles:"Rice & Noodles",
  grills:          "Grills",
  seafood:         "Seafood",
  vegetarian:      "Vegetarian",
  desserts:        "Desserts",
  beverages:       "Beverages",
  specials:        "Today's Specials",
};

export default function MenuPage() {
  const { tableToken }          = useParams();
  const navigate                = useNavigate();
  const { items, itemCount, clearCart } = useCart();

  const [menuData,    setMenuData]    = useState(null);   // { table, menuByCategory }
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [cartOpen,    setCartOpen]    = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search,      setSearch]      = useState("");
  const [placing,     setPlacing]     = useState(false);

  // ── Fetch menu ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getMenuByTable(tableToken);
        setMenuData(data.data);
        // Set first available category as active
        const cats = Object.keys(data.data.menuByCategory);
        if (cats.length > 0) setActiveCategory(cats[0]);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load menu. Please scan QR again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tableToken]);

  // ── Place order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async (orderNote) => {
    if (items.length === 0) return;
    setPlacing(true);
    try {
      const payload = {
        items: items.map((i) => ({
          menuItemId:           i.menuItemId,
          quantity:             i.quantity,
          variant:              i.variant,
          specialInstructions:  i.specialInstructions,
        })),
        orderNote,
      };
      await placeOrder(tableToken, payload);
      clearCart();
      setCartOpen(false);
      toast.success("Order placed! Kitchen is preparing your food 🍳", { duration: 4000 });
      navigate(`/menu/${tableToken}/orders`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  // ── Filter by search ───────────────────────────────────────────────────────
  const getFilteredItems = () => {
    if (!menuData) return [];
    if (search.trim()) {
      const q = search.toLowerCase();
      return Object.values(menuData.menuByCategory)
        .flat()
        .filter((item) => item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q));
    }
    return menuData.menuByCategory[activeCategory] || [];
  };

  if (loading) return <PageSpinner text="Loading menu..." />;

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="text-center space-y-3">
        <AlertCircle size={40} className="text-red-400 mx-auto" />
        <p className="text-gray-700 font-medium">{error}</p>
        <p className="text-gray-400 text-sm">Please scan the QR code on your table again.</p>
      </div>
    </div>
  );

  const categories = Object.keys(menuData.menuByCategory);
  const filteredItems = getFilteredItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <ChefHat size={16} className="text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-gray-900 text-sm leading-none">RestaurantOS</p>
                <p className="text-xs text-gray-400">{menuData.table.label}</p>
              </div>
            </div>

            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative btn-primary btn-md gap-2"
            >
              <ShoppingCart size={17} />
              Order
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white
                                  text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="relative pb-3">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 py-2.5 text-sm"
            />
          </div>

          {/* Category tabs (hidden when searching) */}
          {!search && (
            <CategoryTabs
              categories={categories}
              active={activeCategory}
              onChange={setActiveCategory}
              labels={CATEGORY_LABELS}
            />
          )}
        </div>
      </header>

      {/* ── Menu Items ──────────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 py-4">
        {search && (
          <p className="text-sm text-gray-500 mb-4">
            {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""} for "{search}"
          </p>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No items found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <MenuItemCard key={item._id} item={item} />
            ))}
          </div>
        )}

        {/* Bottom padding for cart button */}
        <div className="h-24" />
      </main>

      {/* ── Floating cart button (mobile) ───────────────────────────────────── */}
      {itemCount > 0 && !cartOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
          <button
            onClick={() => setCartOpen(true)}
            className="btn-primary btn-lg w-full shadow-2xl shadow-brand-500/40"
          >
            <ShoppingCart size={18} />
            View Cart · {itemCount} item{itemCount !== 1 ? "s" : ""}
          </button>
        </div>
      )}

      {/* ── Cart Drawer ──────────────────────────────────────────────────────── */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onPlaceOrder={handlePlaceOrder}
        placing={placing}
        tableLabel={menuData.table.label}
      />
    </div>
  );
}