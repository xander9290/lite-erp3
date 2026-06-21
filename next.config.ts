import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://rzbbxftqzbloaddimfkf.supabase.co/storage/v1/object/public/lite-erp3-images/**")],
  },
};

export default nextConfig;
