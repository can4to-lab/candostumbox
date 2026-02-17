import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Güvenlik: Build sırasında TypeScript ve ESLint hatalarını 
  // yok sayan tehlikeli ayarlar tamamen kaldırıldı.
};

export default nextConfig;