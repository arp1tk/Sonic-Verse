import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint during builds
  },
  typescript: {
    ignoreBuildErrors: true, // Disable TypeScript during builds
  },
};

export default nextConfig;
