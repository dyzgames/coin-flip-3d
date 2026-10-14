import { defineConfig } from "vite";

// Relative base so the built dist/ folder can be dropped into any subfolder
// of the WordPress server (e.g. wp-content/coin-flip/) without extra config.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
  },
});
