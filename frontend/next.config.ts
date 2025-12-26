import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',   // 👈 Statik site (HTML) üretmesi için şart
  images: {
    unoptimized: true, // 👈 Render'da resimlerin görünmesi için şart
  },
};

export default nextConfig;