import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  outputFileTracingRoot: process.cwd(),
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
