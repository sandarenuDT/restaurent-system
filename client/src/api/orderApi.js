import api from "./axios.js";

// ── Customer places an order ──────────────────────────────────────────────────
export const placeOrder      = (tableToken, data)  => api.post(`/orders/place/${tableToken}`, data);

// ── Customer tracks orders on their table ─────────────────────────────────────
export const getTableOrders  = (tableToken)        => api.get(`/orders/table/${tableToken}`);

// ── Kitchen ───────────────────────────────────────────────────────────────────
export const getActiveOrders = ()                  => api.get("/orders/active");
export const updateOrderStatus = (orderId, status) => api.patch(`/orders/${orderId}/status`, { status });
export const updateItemStatus  = (orderId, itemId, status) => api.patch(`/orders/${orderId}/items/${itemId}/status`, { status });

// ── Admin / waiter ────────────────────────────────────────────────────────────
export const getAllOrders     = (params = {})       => api.get("/orders", { params });
export const getOrderById     = (id)               => api.get(`/orders/${id}`);
export const cancelOrder      = (id, reason)       => api.patch(`/orders/${id}/cancel`, { reason });