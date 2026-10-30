import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 82],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-8c6bb3ce4d88417e9f57a8967cf9363d.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pub-1c2f0b1b2ac2419ab5729cf69556aa4a.r2.dev",
      },
      {
        protocol: "https",
        hostname: "zowkins-api-prod.netlify.app",
      },
      {
        protocol: "https",
        hostname: "zowkins-api.onrender.com",
      },
    ],
  },
};

export default nextConfig;
