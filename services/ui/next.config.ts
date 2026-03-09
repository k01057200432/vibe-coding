import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pg', '@kubernetes/client-node'],
};

export default nextConfig;
