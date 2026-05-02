import api from "./axios.js";

export const getTables         = ()              => api.get("/tables");
export const getTableById      = (id)            => api.get(`/tables/${id}`);
export const createTable       = (data)          => api.post("/tables", data);
export const updateTable       = (id, data)      => api.put(`/tables/${id}`, data);
export const deleteTable       = (id)            => api.delete(`/tables/${id}`);
export const regenerateQR      = (id)            => api.post(`/tables/${id}/regenerate-qr`);
export const updateTableStatus = (id, status)    => api.patch(`/tables/${id}/status`, { status });
export const openTable         = (id, data)      => api.post(`/tables/${id}/open`, data);
export const closeTable        = (id)            => api.post(`/tables/${id}/close`);