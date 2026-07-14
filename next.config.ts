import type { NextConfig } from 'next';

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'export',
  ...(isProduction ? {
    basePath: '/bluepineapple',
    assetPrefix: '/bluepineapple/',
  } : {}),
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
