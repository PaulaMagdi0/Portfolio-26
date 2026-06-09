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
        headers: [
          ...SECURITY_HEADERS,
          // Content Signals (https://contentsignals.org): declares how automated
          // systems may use this site's content. Served as an HTTP header rather
          // than a robots.txt directive so robots.txt stays standards-valid —
          // Lighthouse's SEO audit flags non-standard robots.txt directives.
          { key: 'Content-Signal', value: 'search=yes, ai-input=yes, ai-train=no' },
        ],
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
