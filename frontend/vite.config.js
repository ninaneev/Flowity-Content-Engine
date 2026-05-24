import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0", // Necessário para funcionar no Docker
    proxy: {
      // Redireciona chamadas diretas ao backend — evita CORS no dev e no browser externo
      "/auth":       { target: "http://backend:8000", changeOrigin: true },
      "/sources":    { target: "http://backend:8000", changeOrigin: true },
      "/posts":      { target: "http://backend:8000", changeOrigin: true },
      "/generation": { target: "http://backend:8000", changeOrigin: true },
      "/automation": { target: "http://backend:8000", changeOrigin: true },
      "/health":     { target: "http://backend:8000", changeOrigin: true },
    },
  },
});
