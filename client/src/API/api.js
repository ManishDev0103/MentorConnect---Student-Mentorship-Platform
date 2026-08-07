// api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("No auth token found in localStorage!");
  } else if (config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't modify login/signup errors - let them be handled by the respective components
    if (error.config?.url?.includes("/signin") ||
        error.config?.url?.includes("/signup") ||
        error.config?.url?.includes("/forgot-password") ||
        error.config?.url?.includes("/reset-password")) {
      return Promise.reject(error);
    }

    // For protected endpoints, handle 401 by clearing token
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

export default api;
