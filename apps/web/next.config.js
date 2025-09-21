/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@ai-dungeon-master/models",
    "@ai-dungeon-master/engine", 
    "@ai-dungeon-master/orchestrator",
    "@ai-dungeon-master/storage",
    "@ai-dungeon-master/ui"
  ],
  experimental: {
    optimizePackageImports: [
      "@ai-dungeon-master/models",
      "@ai-dungeon-master/engine",
      "@ai-dungeon-master/orchestrator", 
      "@ai-dungeon-master/storage",
      "@ai-dungeon-master/ui"
    ]
  }
};

module.exports = nextConfig;
