import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/drffa7wfr/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
