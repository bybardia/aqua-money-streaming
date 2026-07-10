import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lint runs as a separate CI step; keep the production build focused on compiling.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
