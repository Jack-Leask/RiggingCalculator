import { defineConfig } from "vite";

// base "./" keeps asset paths relative so the built files also load inside a Capacitor app.
export default defineConfig({
  base: "./",
  build: { outDir: "dist" },
  test: { environment: "node", include: ["tests/**/*.test.js"] }
});
