import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg', '@kubernetes/client-node'],
};

export default nextConfig;
