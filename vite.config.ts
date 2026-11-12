import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// VITE_DEMO=1 swaps the Convex client for a localStorage stand-in (npm run demo).
const demo = process.env.VITE_DEMO === "1";

export default defineConfig({
  base: demo ? "./" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      ...(demo ? { "convex/react": path.resolve(import.meta.dirname, "src/demo/convexReact.tsx") } : {}),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: demo ? "dist-demo" : "dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
  },
});
