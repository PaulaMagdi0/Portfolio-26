import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/core/seo';

// Standards-only robots.txt (allow-all + sitemap). The Content-Signal preference
// is served as an HTTP response header (see next.config.ts) instead of a robots.txt
// directive, because non-standard robots.txt directives fail Lighthouse's
// "robots.txt is valid" SEO audit. https://contentsignals.org
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
