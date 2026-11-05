import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { NextConfig } from "next";

const workspaceEnvPath = resolve(process.cwd(), "../../.env");
if (existsSync(workspaceEnvPath)) {
  process.loadEnvFile(workspaceEnvPath);
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: resolve(process.cwd(), "../.."),
  outputFileTracingIncludes: {
    "/api/inngest": ["../../packages/ai/dist/BOOKLEAF_KNOWLEDGE_BASE.md"],
  },
  reactStrictMode: true,
  transpilePackages: [
    "@repo/ai",
    "@repo/auth",
    "@repo/contracts",
    "@repo/database",
    "@repo/jobs",
    "@repo/ui",
  ],
  webpack(config) {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
