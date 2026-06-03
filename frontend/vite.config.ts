import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "favicon-48x48.png",
        "apple-touch-icon.png",
        "brand-logo.png",
        "icon-source.png",
      ],
      manifest: {
        name: "WorkShift",
        short_name: "WorkShift",
        description: "Control de horas laborales",
        theme_color: "#0B1020",
        background_color: "#0B1020",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "es",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Evita fallo de terser en algunos entornos (CI/sandbox); SW sigue siendo válido.
        mode: "development",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) => {
              if (request.method !== "GET") {
                return false;
              }
              const target = String(url);
              return target.includes("/api/v1") || target.includes("/api/");
            },
            handler: "NetworkFirst",
            options: {
              cacheName: "horario-api",
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries: 48,
                maxAgeSeconds: 5 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  envDir: "..",
  server: {
    port: 5173,
    host: true,
  },
});
