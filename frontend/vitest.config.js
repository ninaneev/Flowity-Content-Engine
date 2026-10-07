import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Configuração do Vitest (Tarefa 15 do PI 2).
// Só roda arquivos *.test.js / *.test.jsx dentro de src/.
// Os testes antigos em node puro (*.test.mjs) continuam fora desta suíte.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    include: ["src/**/*.test.{js,jsx}"],
  },
});
