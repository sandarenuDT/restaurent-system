// import axios from "axios";

// const api = axios.create({
//   baseURL:         "/api",
//   withCredentials: true, // Send cookies (refresh token)
//   timeout:         15000,
// });

// // ── REQUEST: attach access token to every request ────────────────────────────
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("accessToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // ── RESPONSE: if access token expired, silently refresh and retry ─────────────
// let isRefreshing   = false;
// let pendingQueue   = []; // Requests waiting for refresh to complete

// const processQueue = (error, token = null) => {
//   pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
//   pendingQueue = [];
// };

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const original = error.config;

//     // 401 + TOKEN_EXPIRED = try to get a new access token
//     if (
//       error.response?.status === 401 &&
//       error.response?.data?.code === "TOKEN_EXPIRED" &&
//       !original._retry
//     ) {
//       if (isRefreshing) {
//         // Queue this request until refresh completes
//         return new Promise((resolve, reject) => {
//           pendingQueue.push({ resolve, reject });
//         }).then((token) => {
//           original.headers.Authorization = `Bearer ${token}`;
//           return api(original);
//         });
//       }

//       original._retry = true;
//       isRefreshing    = true;

//       try {
//         const { data } = await api.post("/auth/refresh");
//         const newToken  = data.accessToken;
//         localStorage.setItem("accessToken", newToken);
//         processQueue(null, newToken);
//         original.headers.Authorization = `Bearer ${newToken}`;
//         return api(original);
//       } catch (refreshError) {
//         processQueue(refreshError, null);
//         localStorage.removeItem("accessToken");
//         window.location.href = "/login";
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;


import axios from "axios";

// baseURL "/api" works because vite.config.js proxies /api → http://localhost:5000
// withCredentials:true tells browser to send httpOnly cookies (refresh token)
const api = axios.create({
  baseURL:         "/api",
  withCredentials: true,  // ← MUST be true for cookies to work in browser
  timeout:         15000,
});

// ── REQUEST: attach access token to every request ────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── RESPONSE: if access token expired, silently refresh and retry ─────────────
let isRefreshing   = false;
let pendingQueue   = []; // Requests waiting for refresh to complete

const processQueue = (error, token = null) => {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // 401 + TOKEN_EXPIRED = try to get a new access token
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !original._retry
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        const { data } = await axios.post("/api/auth/refresh", {}, { withCredentials: true });
        const newToken  = data.accessToken;
        localStorage.setItem("accessToken", newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;