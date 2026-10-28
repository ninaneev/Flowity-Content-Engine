import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Recarregar/abrir direto uma rota da SPA (ex.: /sources, /posts) pede HTML: nesse caso serve o
// index.html em vez de mandar a navegação para a API.
const htmlParaSpa = (req) =>
  req.headers.accept && req.headers.accept.includes("text/html") ? "/index.html" : undefined;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0", // Necessário para funcionar no Docker
    // No Docker Desktop do Windows o volume não avisa mudanças de arquivo: sem polling a tela fica velha
    watch: { usePolling: true, interval: 500 },
    proxy: {
      "/storage":    { target: "http://backend:8000", changeOrigin: true, bypass: htmlParaSpa },
      // Redireciona chamadas diretas ao backend — evita CORS no dev e no browser externo
      "/auth":       { target: "http://backend:8000", changeOrigin: true, bypass: htmlParaSpa },
      "/sources":    { target: "http://backend:8000", changeOrigin: true, bypass: htmlParaSpa },
      "/posts":      { target: "http://backend:8000", changeOrigin: true, bypass: htmlParaSpa },
      "/generation": { target: "http://backend:8000", changeOrigin: true, bypass: htmlParaSpa },
      "/automation": { target: "http://backend:8000", changeOrigin: true, bypass: htmlParaSpa },
      "/metrics":    { target: "http://backend:8000", changeOrigin: true, bypass: htmlParaSpa },
      "/reports":    { target: "http://backend:8000", changeOrigin: true, bypass: htmlParaSpa },
      "/alerts":     { target: "http://backend:8000", changeOrigin: true, bypass: htmlParaSpa },
      // Só a API: "/settings" sozinho também é a rota da tela de Settings.
      "^/settings/alerts": { target: "http://backend:8000", changeOrigin: true, bypass: htmlParaSpa },
      "/health":     { target: "http://backend:8000", changeOrigin: true, bypass: htmlParaSpa },
      "/assets":     { target: "http://backend:8000", changeOrigin: true, bypass: htmlParaSpa },
      "/media":      { target: "http://backend:8000", changeOrigin: true, bypass: htmlParaSpa },
    },
  },
});
