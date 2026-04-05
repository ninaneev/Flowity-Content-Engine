/**
 * Cliente HTTP centralizado.
 * Toda comunicação com o backend passa por aqui.
 * Importar assim: import api from '@/lib/api'
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Injeta o token JWT em todas as requisições ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("flowity_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Redireciona para login se o token expirar ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("flowity_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════
export const authApi = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }),
};

// ══════════════════════════════════════════════════════════════════════════════
// SOURCES
// ══════════════════════════════════════════════════════════════════════════════
export const sourcesApi = {
  list:   ()          => api.get("/sources/"),
  get:    (id)        => api.get(`/sources/${id}`),
  create: (data)      => api.post("/sources/", data),
  update: (id, data)  => api.put(`/sources/${id}`, data),
};

// ══════════════════════════════════════════════════════════════════════════════
// POSTS
// ══════════════════════════════════════════════════════════════════════════════
export const postsApi = {
  list:     (params)        => api.get("/posts/", { params }),
  get:      (id)            => api.get(`/posts/${id}`),
  create:   (data)          => api.post("/posts/", data),
  update:   (id, data)      => api.put(`/posts/${id}`, data),
  calendar: (month)         => api.get("/posts/calendar", { params: { month } }),
  pipeline: ()              => api.get("/posts/", { params: {} }),
};

// ══════════════════════════════════════════════════════════════════════════════
// GENERATION
// ══════════════════════════════════════════════════════════════════════════════
export const generationApi = {
  preview:    (data) => api.post("/generation/preview", data),
  createPost: (data) => api.post("/generation/create-post", data),
};

// ══════════════════════════════════════════════════════════════════════════════
// AUTOMATION
// ══════════════════════════════════════════════════════════════════════════════
export const automationApi = {
  config: () => api.get("/automation/config"),
};

export default api;
