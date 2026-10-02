import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [{ source: '/', destination: '/es', permanent: false }];
  },
};

export default nextConfig;
