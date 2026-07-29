import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App 100% côté client → export statique (hébergement Netlify sans serverless).
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
