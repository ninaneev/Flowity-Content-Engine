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
  calendar: (month)         => api.get("/posts/calendar", { params: { month } }),
  pipeline: ()              => api.get("/posts/", { params: {} }),
  // Depende do endpoint da Tarefa 8 (#82): POST /posts/{id}/render/carousel
  render: {
    carousel: (postId, slides) =>
      api.post(`/posts/${postId}/render/carousel`, { slides }),
  },
};

// ASSETS (imagens do post)
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
};

/** Baixa um arquivo autenticado (ex.: o PDF do carrossel) e salva com o nome indicado. */
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

/** Monta a URL completa de um arquivo servido pelo backend (ex.: "/media/posts/1/a.png"). */
export function mediaUrl(path) {
  if (!path || /^https?:\/\//.test(path)) return path;
  return `${BASE_URL.replace(/\/$/, "")}${path}`;
}

// GENERATION
export const generationApi = {
  preview:    (data) => api.post("/generation/preview", data),
  createPost: (data) => api.post("/generation/create-post", data),
};

// AUTOMATION
export const automationApi = {
  config: () => api.get("/automation/config"),
};

export default api;
