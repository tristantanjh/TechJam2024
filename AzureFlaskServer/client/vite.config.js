import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    fs: {
      cachedChecks: false,
    },
  },
});
