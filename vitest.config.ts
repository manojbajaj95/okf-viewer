import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.mjs", "**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
});
