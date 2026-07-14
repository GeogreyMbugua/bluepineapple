import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    '@blue-pineapple/database',
    '@blue-pineapple/iam',
    '@blue-pineapple/shared',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
