import axios from "axios";

// ─── Axios Instance ──────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: "https://agrihackathon26-production.up.railway.app", // Production Backend on Railway
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});




// ─── Request Interceptor ─────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`[API Request] → ${config.method?.toUpperCase()} ${fullUrl}`);
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
    console.log(`[API Response] ← ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status ?? "NETWORK_ERROR";
    const url = error.config?.url ?? "unknown";
    console.error(`[API Response Error] ← ${status} ${url}`, error.message);
    return Promise.reject(error);
  }
);

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Wraps an axios call and always returns { data, error }.
 * Never throws.
 */
const safeRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return { data: response.data, error: null };
  } catch (err) {
    const error =
      err.response?.data?.message ??
      err.message ??
      "An unknown network error occurred";
    return { data: null, error };
  }
};

// ─── API Functions ───────────────────────────────────────────────────────────

/**
 * Fetch the farm dashboard summary for a given farmId.
 * @param {string|number} farmId
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
export const getDashboard = (farmId) =>
  safeRequest(() => api.get(`/api/farms/${farmId}/dashboard`));

/**
 * Fetch today's AI-generated advisory for a given farmId.
 * @param {string|number} farmId
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
export const getTodayAdvisory = (farmId) =>
  safeRequest(() => api.get(`/api/advisory/${farmId}/today`));

/**
 * Post a new NPK sensor reading for a given farmId.
 * @param {string|number} farmId
 * @param {{ N: number, P: number, K: number, pH: number }} payload
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
export const postNPKReading = (farmId, payload) =>
  safeRequest(() => api.post(`/api/farms/${farmId}/npk-readings`, payload));

export default api;
