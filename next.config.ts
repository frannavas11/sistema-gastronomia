import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/admin/login",
        permanent: false,
      },
      {
        source: "/login/admin",
        destination: "/admin/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
