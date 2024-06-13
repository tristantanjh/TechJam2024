import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import https from "https";

// Disable SSL verification for self-signed certificates
const agent = new https.Agent({
  rejectUnauthorized: false,
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync("./key.pem"),
      cert: fs.readFileSync("./cert.pem"),
    },
    proxy: {
      "/api": {
        target: "https://192.168.1.5:9000",
        changeOrigin: true,
        agent, // Use the custom agent
        ws: true,
      },
    },
    host: "0.0.0.0",
  },
});
