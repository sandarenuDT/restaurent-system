import { createContext, useContext, useReducer, useCallback } from "react";

const CartContext = createContext(null);

// ── Reducer: handles all cart actions ────────────────────────────────────────
const cartReducer = (state, action) => {
  switch (action.type) {

    case "ADD_ITEM": {
      const { item, quantity = 1, variant = null, specialInstructions = "" } = action.payload;
      // Create a unique key: itemId + chosen variant option
      const key = `${item._id}-${variant?.option || "default"}`;
      const existing = state.items.find((i) => i.key === key);

      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }

      const unitPrice = item.price + (variant?.extraPrice || 0);
      return {
        ...state,
        items: [
          ...state.items,
          {
            key,
            menuItemId:          item._id,
            name:                item.name,
            price:               item.price,
            image:               item.image?.url || null,
            category:            item.category,
            variant:             variant ? { name: variant.name, option: variant.option, extraPrice: variant.extraPrice } : null,
            quantity,
            specialInstructions,
            unitPrice,
            lineTotal:           unitPrice * quantity,
          },
        ],
      };
    }

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.key !== action.payload.key) };

    case "UPDATE_QTY": {
      const { key, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.key !== key) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.key === key ? { ...i, quantity, lineTotal: i.unitPrice * quantity } : i
        ),
      };
    }

    case "UPDATE_NOTE":
      return {
        ...state,
        items: state.items.map((i) =>
          i.key === action.payload.key
            ? { ...i, specialInstructions: action.payload.note }
            : i
        ),
      };

    case "SET_ORDER_NOTE":
      return { ...state, orderNote: action.payload };

    case "CLEAR":
      return { items: [], orderNote: "" };

    default:
      return state;
  }
};

const initialState = { items: [], orderNote: "" };

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem      = useCallback((item, quantity, variant, note) =>
    dispatch({ type: "ADD_ITEM",     payload: { item, quantity, variant, specialInstructions: note } }), []);
  const removeItem   = useCallback((key)  => dispatch({ type: "REMOVE_ITEM",  payload: { key } }), []);
  const updateQty    = useCallback((key, quantity) => dispatch({ type: "UPDATE_QTY", payload: { key, quantity } }), []);
  const updateNote   = useCallback((key, note)     => dispatch({ type: "UPDATE_NOTE", payload: { key, note } }), []);
  const setOrderNote = useCallback((note) => dispatch({ type: "SET_ORDER_NOTE", payload: note }), []);
  const clearCart    = useCallback(()     => dispatch({ type: "CLEAR" }), []);

  // Derived values
  const itemCount  = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal   = state.items.reduce((sum, i) => sum + i.lineTotal, 0);

  return (
    <CartContext.Provider value={{
      items: state.items, orderNote: state.orderNote,
      itemCount, subtotal,
      addItem, removeItem, updateQty, updateNote, setOrderNote, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};