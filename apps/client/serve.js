import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4173;
const SERVER_URL = process.env.SERVER_URL;

const app = express();

// Proxy API & Socket.io to the backend server
if (SERVER_URL) {
  console.log(`Proxy enabled → ${SERVER_URL}`);

  app.use(
    "/socket.io",
    createProxyMiddleware({
      target: SERVER_URL,
      ws: true,
      changeOrigin: true,
    })
  );

  app.use(
    "/health",
    createProxyMiddleware({ target: SERVER_URL, changeOrigin: true })
  );

  app.use(
    "/ice-servers",
    createProxyMiddleware({ target: SERVER_URL, changeOrigin: true })
  );
} else {
  console.log("SERVER_URL not set — proxy disabled");
}

// Serve static files from the Vite build output
app.use(express.static(join(__dirname, "dist")));

// SPA fallback — serve index.html for all non-file routes
app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Client serving on port ${PORT}`);
});
