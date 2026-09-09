import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// This config turns the app into an installable PWA automatically:
// vite-plugin-pwa generates the service worker and wires up the manifest
// declared below at build time. You shouldn't need to touch this file.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/favicon-32.png", "icons/apple-touch-icon.png"],
      manifest: {
        name: "Dental Boutique Stock",
        short_name: "DB Stock",
        description: "Low-stock flagging and central stock tracking for Dental Boutique.",
        theme_color: "#17160F",
        background_color: "#F1ECE1",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
});
