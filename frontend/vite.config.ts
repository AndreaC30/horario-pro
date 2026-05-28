import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Carga VITE_* desde horario-pro/.env (un nivel arriba de frontend/)
  envDir: "..",
  server: {
    port: 5173,
    host: true,
  },
});
