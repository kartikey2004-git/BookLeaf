import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/auth", "@repo/contracts", "@repo/ui"],
};

export default nextConfig;
