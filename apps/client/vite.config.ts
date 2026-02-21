import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  define: {
    global: "globalThis",
  },
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ["events", "util", "buffer", "process", "stream"],
    }),
  ],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      "/socket.io": {
        target: "http://localhost:3001",
        ws: true,
      },
    },
  },
  preview: {
    host: true,
    port: Number(process.env.PORT) || 4173,
    allowedHosts: true,
    proxy: process.env.SERVER_URL
      ? {
          "/socket.io": {
            target: process.env.SERVER_URL,
            ws: true,
          },
          "/health": process.env.SERVER_URL,
          "/ice-servers": process.env.SERVER_URL,
        }
      : undefined,
  },
});
