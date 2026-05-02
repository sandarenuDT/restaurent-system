import api from "./axios.js";

export const requestBill    = (tableToken)          => api.post(`/billing/request/${tableToken}`);
export const getBillPreview = (tableToken)          => api.get(`/billing/preview/${tableToken}`);
export const getSessionBill = (sessionId)           => api.get(`/billing/session/${sessionId}`);
export const settleBill     = (sessionId, data)     => api.post(`/billing/settle/${sessionId}`, data);
export const applyDiscount  = (sessionId, data)     => api.patch(`/billing/discount/${sessionId}`, data);
export const getDailyReport = (date)                => api.get("/billing/report/daily", { params: { date } });