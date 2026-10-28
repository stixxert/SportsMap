import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

/**
 * Alias rules mirror tsconfig `paths`. Order matters: `@/src/*` must resolve to the
 * project root (where the generated schema lives), everything else to `src/`.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\/src\//, replacement: `${root}src/` },
      { find: /^@\//, replacement: `${root}src/` },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/testing/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    // Workers, IndexedDB and canvas are jsdom-incompatible; keep the suite to logic.
    globals: false,
  },
});
