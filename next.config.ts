import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "tile.openstreetmap.org" },
      { protocol: "https", hostname: "*.tile.openstreetmap.org" },
    ],
  },
  // Leaflet requires transpiling for SSR
  transpilePackages: ["leaflet", "react-leaflet"],

  // ✅ pindahin ke sini
  serverExternalPackages: ["bcryptjs"],
};

export default nextConfig;
