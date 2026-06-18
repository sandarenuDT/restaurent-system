import api from "./axios.js";

// ── Public (customer) ─────────────────────────────────────────────────────────
export const getMenuByTable  = (tableToken)      => api.get(`/menu/public/${tableToken}`);
export const getMenuItems    = (params = {})     => api.get("/menu", { params });
export const getMenuItem     = (id)              => api.get(`/menu/${id}`);

// ── Admin ─────────────────────────────────────────────────────────────────────
export const createMenuItem  = (formData)        => api.post("/menu/items", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateMenuItem  = (id, formData)    => api.patch(`/menu/items/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteMenuItem  = (id)              => api.delete(`/menu/items/${id}`);
export const toggleAvailable = (id, isAvailable) => api.patch(`/menu/items/${id}/toggle`, { isAvailable });