import axios from "axios";

// ─── Configuration ───────────────────────────────────────────────────────────

const PROD_URL = "https://divine-wind-cf72.crazything344.workers.dev/";
const DEV_URL  = "https://divine-wind-cf72.crazything344.workers.dev/"; // Cloudflare Worker endpoint

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

const api = axios.create({
  // Using Cloudflare Worker for reliable cross-device functionality
  baseURL: PROD_URL, 
  timeout: 15000, 
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    if (isDev) {
      console.log(`[API Request] → ${config.method?.toUpperCase()} ${fullUrl}`);
    }
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => {
    if (isDev) {
      console.log(`[API Response] ← ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : "NETWORK_ERROR";
    const message = error.message || "An unknown error occurred";
    
    if (isDev) {
      console.warn(`[API Error Details] URL: ${error.config?.url} | Status: ${status} | Message: ${message}`);
    }
    
    return Promise.reject(error);
  }
);

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Wraps an axios call and always returns { data, error }.
 * Senior Tip: This simplifies the data flow in components.
 */
const safeRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = "Failed to connect to server.";
    
    if (err.response) {
      // Server responded with an error
      errorMessage = err.response.data?.error || err.response.data?.message || `Server Error: ${err.response.status}`;
    } else if (err.request) {
      // Request was made but no response received
      errorMessage = "No response from server. Check your network or if the backend is running.";
    } else {
      errorMessage = err.message;
    }
    
    return { data: null, error: errorMessage };
  }
};

// ─── API Functions ───────────────────────────────────────────────────────────

export const getDashboard = (farmId) =>
  safeRequest(() => api.get(`api/farms/${farmId}/dashboard`));

export const getTodayAdvisory = (farmId) =>
  safeRequest(() => api.get(`api/advisory/${farmId}/today`));

export const postNPKReading = (farmId, payload) =>
  safeRequest(() => api.post(`api/farms/${farmId}/npk-readings`, payload));

export default api;
