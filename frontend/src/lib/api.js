/**
 * Central HTTP client.
 * All backend communication goes through this module.
 * Import as: import api from '@/lib/api'
 */
import axios from "axios";

// In development, use a relative URL so the Vite proxy can intercept API calls.
// This avoids CORS and hostname-resolution issues in external browsers.
const configuredBaseUrl = import.meta.env.DEV
  ? ""
  : import.meta.env.VITE_API_URL || "http://localhost:8000";

function resolveBaseUrl() {
  if (typeof window === "undefined") return configuredBaseUrl;

  const pageHost = window.location.hostname;
  const isLocalPageHost =
    pageHost === "localhost" ||
    pageHost === "127.0.0.1" ||
    pageHost === "0.0.0.0" ||
    pageHost === "::1";

  if (!isLocalPageHost && configuredBaseUrl.includes("localhost")) {
    return `http://${pageHost}:8000`;
  }

  return configuredBaseUrl;
}

const BASE_URL = resolveBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("flowity_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login when a non-login request receives an expired-token response.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem("flowity_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// AUTH
export const authApi = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }),
};

// SOURCES
export const sourcesApi = {
  list:   ()          => api.get("/sources/"),
  get:    (id)        => api.get(`/sources/${id}`),
  create: (data)      => api.post("/sources/", data),
  update: (id, data)  => api.put(`/sources/${id}`, data),
};

// POSTS
export const postsApi = {
  list:     (params)        => api.get("/posts/", { params }),
  get:      (id)            => api.get(`/posts/${id}`),
  create:   (data)          => api.post("/posts/", data),
  update:   (id, data)      => api.put(`/posts/${id}`, data),
  remove:   (id)            => api.delete(`/posts/${id}`),
  calendar: (month)         => api.get("/posts/calendar", { params: { month } }),
  pipeline: ()              => api.get("/posts/", { params: {} }),
  slides: {
    list: (postId) => api.get(`/posts/${postId}/slides`),
    save: (postId, slides) => api.put(`/posts/${postId}/slides`, { slides }),
  },
  // PNG and PDF generation for the carousel
  render: {
    carousel: (postId, slides) =>
      api.post(`/posts/${postId}/render/carousel`, { slides }),
  },
};

// ASSETS (post images)
export const assetsApi = {
  list: (postId) => api.get(`/posts/${postId}/assets`),
  upload: (postId, file, altText) => {
    const form = new FormData();
    form.append("file", file);
    form.append("alt_text", altText);
    return api.post(`/posts/${postId}/assets`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id, data) => api.patch(`/assets/${id}`, data),
  remove: (id) => api.delete(`/assets/${id}`),
  // Images already in the public Supabase Storage bucket
  storageList: () => api.get("/storage/images"),
  fromStorage: (postId, path, altText) =>
    api.post(`/posts/${postId}/assets/from-storage`, { path, alt_text: altText }),
};

/** Downloads an authenticated file (e.g. the carousel PDF) and saves it under the given name. */
export async function apiDownload(url, nomeArquivo) {
  const resposta = await api.get(url, { responseType: "blob" });
  const href = URL.createObjectURL(resposta.data);
  const link = document.createElement("a");
  link.href = href;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

/** Builds the full URL of a file served by the backend (e.g. "/media/posts/1/a.png"). */
export function mediaUrl(path) {
  if (!path || /^https?:\/\//.test(path)) return path;
  return `${BASE_URL.replace(/\/$/, "")}${path}`;
}

// GENERATION
export const generationApi = {
  preview:    (data) => api.post("/generation/preview", data),
  createPost: (data) => api.post("/generation/create-post", data),
};

// REPORTS (PI 2)
export const reportsApi = {
  performance: () => api.get("/reports/performance"),
};

// ALERTS (PI 2)
export const alertsApi = {
  getSettings: () => api.get("/settings/alerts"),
  updateSettings: (data) => api.put("/settings/alerts", data),
  list: () => api.get("/alerts"),
};

// AUTOMATION
export const automationApi = {
  config: () => api.get("/automation/config"),
};

// METRICS
export const metricsApi = {
  summary: (params) => api.get("/metrics/summary", { params }),
  create: (postId, data) => api.post(`/posts/${postId}/metrics`, data),
};

export default api;
