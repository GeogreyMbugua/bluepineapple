import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  reactCompiler: true,
  ...(isGitHubPages ? {
    output: 'export',
    trailingSlash: true,
  } : {}),
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
