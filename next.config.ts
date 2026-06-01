import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { SECURITY_HEADERS } from './core/security';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Bundle analyzer is a no-op unless ANALYZE=true — safe to keep wrapped in prod.
const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [...SECURITY_HEADERS],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/Portfolio.html',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default analyzer(withNextIntl(nextConfig));
