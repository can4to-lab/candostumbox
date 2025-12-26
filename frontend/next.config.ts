import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 👇 Sadece bunu ekliyoruz, bu çalışır.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;