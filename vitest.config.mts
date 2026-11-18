import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Vitest's built-in transform handles TSX; use the automatic React runtime.
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
