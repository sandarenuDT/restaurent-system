import { useState } from "react";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "../../../context/CartContext.jsx";

export default function CartDrawer({ isOpen, onClose, onPlaceOrder, placing, tableLabel }) {
  const { items, subtotal, updateQty, removeItem, orderNote, setOrderNote, itemCount } = useCart();
  const TAX_RATE   = 10;
  const taxAmount  = (subtotal * TAX_RATE) / 100;
  const total      = subtotal + taxAmount;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl
                      max-h-[85vh] flex flex-col animate-slide-up max-w-2xl mx-auto">
        {/* Handle */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand-500" />
            <h2 className="font-display font-bold text-gray-900">Your Order</h2>
            <span className="badge badge-orange">{tableLabel}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 custom-scroll">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Your cart is empty</p>
              <p className="text-gray-300 text-xs mt-1">Add items from the menu</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.key} className="flex gap-3 items-start">
                {item.image && (
                  <img src={item.image} alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                  {item.variant && (
                    <p className="text-xs text-gray-400">{item.variant.option}</p>
                  )}
                  {item.specialInstructions && (
                    <p className="text-xs text-brand-500 italic">{item.specialInstructions}</p>
                  )}
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">
                    LKR {item.unitPrice.toLocaleString()}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQty(item.key, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center
                               text-gray-600 hover:bg-gray-100 transition-colors">
                    {item.quantity === 1 ? <Trash2 size={12} className="text-red-400" /> : <Minus size={12} />}
                  </button>
                  <span className="w-5 text-center font-bold text-gray-800 text-sm">{item.quantity}</span>
                  <button onClick={() => updateQty(item.key, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center
                               text-white hover:bg-brand-600 transition-colors">
                    <Plus size={12} />
                  </button>
                </div>

                <p className="text-sm font-bold text-gray-900 w-20 text-right flex-shrink-0">
                  LKR {item.lineTotal.toLocaleString()}
                </p>
              </div>
            ))
          )}

          {/* Order note */}
          {items.length > 0 && (
            <div className="pt-2">
              <textarea
                rows={2}
                placeholder="Any notes for the kitchen? (allergies, preferences...)"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                className="input text-sm resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer: totals + place order */}
        {items.length > 0 && (
          <div className="px-5 pt-3 pb-6 border-t border-gray-100 space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax ({TAX_RATE}%)</span>
                <span>LKR {taxAmount.toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                <span>Total</span>
                <span>LKR {total.toFixed(0)}</span>
              </div>
            </div>

            <button
              onClick={() => onPlaceOrder(orderNote)}
              disabled={placing || itemCount === 0}
              className="btn-primary btn-lg w-full"
            >
              {placing
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : `Place Order · LKR ${total.toFixed(0)}`
              }
            </button>
          </div>
        )}
      </div>
    </>
  );
}