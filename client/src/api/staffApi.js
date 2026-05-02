import api from "./axios.js";

export const getStaff        = ()          => api.get("/staff");
export const createStaff     = (data)      => api.post("/staff", data);
export const updateStaff     = (id, data)  => api.put(`/staff/${id}`, data);
export const deleteStaff     = (id)        => api.delete(`/staff/${id}`);
export const toggleStaffActive = (id)      => api.patch(`/staff/${id}/toggle-active`);
export const resetStaffPin   = (id, pin)   => api.patch(`/staff/${id}/pin`, { pin });