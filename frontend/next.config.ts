import type { NextConfig } from "next";

// 👇 Burayı ': any' yaptık ki TypeScript karışmasın
const nextConfig: any = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;