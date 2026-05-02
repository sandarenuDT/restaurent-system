import { useState } from "react";
import { Plus, Minus, Flame, Leaf, Star } from "lucide-react";
import { useCart } from "../../../context/CartContext.jsx";
import toast from "react-hot-toast";

export default function MenuItemCard({ item }) {
  const { addItem, items, updateQty } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState(false);

  // Find this item in cart
  const variantKey = `${item._id}-${selectedVariant?.option || "default"}`;
  const cartItem   = items.find((i) => i.key === variantKey);
  const qty        = cartItem?.quantity || 0;

  const handleAdd = () => {
    if (item.variants?.length > 0 && !selectedVariant) {
      // If item has variants, expand to show options first
      setExpanded(true);
      return;
    }
    addItem(item, 1, selectedVariant, note);
    toast.success(`${item.name} added!`, { duration: 1500, icon: "🛒" });
  };

  const finalPrice = item.price + (selectedVariant?.extraPrice || 0);

  return (
    <div className="card overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Image */}
        {item.image?.url && (
          <img
            src={item.image.url}
            alt={item.name}
            className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
          />
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {/* Badges */}
              <div className="flex items-center gap-1 mb-1 flex-wrap">
                {item.tags?.isChefSpecial && (
                  <span className="flex items-center gap-0.5 text-xs bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-full border border-brand-200 font-medium">
                    <Star size={10} fill="currentColor" /> Chef's Special
                  </span>
                )}
                {item.tags?.isPopular && (
                  <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full border border-red-200 font-medium">
                    Popular
                  </span>
                )}
                {item.tags?.isSpicy && <Flame size={14} className="text-red-500" />}
                {item.tags?.isVegetarian && <Leaf size={14} className="text-green-500" />}
              </div>

              <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</h3>

              {item.description && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
              )}

              <p className="text-xs text-gray-400 mt-1">~{item.prepTimeMinutes} min</p>
            </div>

            {/* Price + Add button */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <p className="font-bold text-gray-900 text-sm">
                LKR {finalPrice.toLocaleString()}
              </p>

              {/* Quantity controls or Add button */}
              {qty > 0 ? (
                <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-xl p-1">
                  <button
                    onClick={() => updateQty(variantKey, qty - 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-brand-200 flex items-center justify-center
                               text-brand-600 hover:bg-brand-500 hover:text-white transition-colors"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-5 text-center font-bold text-brand-700 text-sm">{qty}</span>
                  <button
                    onClick={handleAdd}
                    className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center
                               text-white hover:bg-brand-600 transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={!item.isAvailable}
                  className="w-8 h-8 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200
                             flex items-center justify-center text-white transition-colors active:scale-90"
                >
                  <Plus size={17} />
                </button>
              )}
            </div>
          </div>

          {/* Unavailable overlay */}
          {!item.isAvailable && (
            <p className="text-xs text-red-500 font-medium mt-1">Currently unavailable</p>
          )}
        </div>
      </div>

      {/* Variant selector (expanded) */}
      {expanded && item.variants?.length > 0 && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          {item.variants.map((variant) => (
            <div key={variant.name} className="mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">{variant.name}</p>
              <div className="flex flex-wrap gap-2">
                {variant.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setSelectedVariant({ name: variant.name, option: opt.label, extraPrice: opt.extraPrice })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                      ${selectedVariant?.option === opt.label
                        ? "bg-brand-500 text-white border-brand-500"
                        : "bg-white text-gray-700 border-gray-200 hover:border-brand-300"
                      }`}
                  >
                    {opt.label}
                    {opt.extraPrice > 0 && <span className="ml-1 opacity-70">+{opt.extraPrice}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <input
            type="text"
            placeholder="Special instructions (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input text-xs py-2 mt-1"
          />

          <button
            onClick={() => {
              if (!selectedVariant && item.variants?.length > 0) {
                toast.error("Please select an option"); return;
              }
              addItem(item, 1, selectedVariant, note);
              setExpanded(false);
              toast.success(`${item.name} added!`, { duration: 1500 });
            }}
            className="btn-primary btn-sm w-full mt-3"
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}