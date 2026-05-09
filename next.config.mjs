/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-8c6bb3ce4d88417e9f57a8967cf9363d.r2.dev",
      },
      {
        protocol: "https",
        hostname: "zowkins-api.onrender.com",
      },
    ],
  },
};

export default nextConfig;
