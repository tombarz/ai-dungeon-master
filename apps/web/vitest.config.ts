import path from "path";
import { defineConfig } from "vitest/config";

const resolveWorkspacePath = (relative: string) => path.resolve(__dirname, relative);

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".next", "e2e", "e2e/**"],
  },
  resolve: {
    alias: {
      "@ai-dungeon-master/ui": resolveWorkspacePath("../../packages/ui/src"),
      "@ai-dungeon-master/models": resolveWorkspacePath("../../packages/models/src"),
      "@ai-dungeon-master/engine": resolveWorkspacePath("../../packages/engine/src"),
      "@ai-dungeon-master/orchestrator": resolveWorkspacePath("../../packages/orchestrator/src"),
      "@ai-dungeon-master/storage": resolveWorkspacePath("../../packages/storage/src"),
      "@": resolveWorkspacePath("./src"),
    },
  },
});
