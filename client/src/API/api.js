// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("No auth token found in localStorage!");
  } else {
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
      // Could redirect to login here if needed
    }

    return Promise.reject(error);
  }
);

export default api;
