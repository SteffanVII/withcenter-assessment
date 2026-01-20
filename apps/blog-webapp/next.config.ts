import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@radix-ui/react-popover', '@radix-ui/react-dismissable-layer'],
  async redirects() {
    return [
      {
        source : "/",
        destination : "/web/login",
        permanent : true
      },
      {
        source : "/web",
        destination : "/web/login",
        permanent : true
      },
    ]
  }
};

export default nextConfig;
