import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // For smooth WebGL and canvas cleanup with GSAP
  devIndicators: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
