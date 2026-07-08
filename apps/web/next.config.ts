import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    '@blue-pineapple/database',
    '@blue-pineapple/iam',
    '@blue-pineapple/shared',
  ],
};

export default nextConfig;
