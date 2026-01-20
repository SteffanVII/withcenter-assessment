import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@radix-ui/react-popover', '@radix-ui/react-dismissable-layer']
};

export default nextConfig;
