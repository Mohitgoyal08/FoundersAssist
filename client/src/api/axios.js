// ═════════════════════════════════════════════════════════════════
//  api/axios.js
//  Configured Axios instance for Founder Assist API
// ═════════════════════════════════════════════════════════════════

import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Request Interceptor — attach JWT token ─────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fa_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — handle auth errors globally ─────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("fa_token");
      localStorage.removeItem("fa_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;