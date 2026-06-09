import { SITE_URL } from '@/core/seo';

// Custom robots.txt route handler (instead of the `app/robots.ts` metadata
// route) because Next's `MetadataRoute.Robots` cannot emit a `Content-Signal:`
// directive. Behavior is otherwise identical: allow-all + sitemap pointer.
export const dynamic = 'force-static';

export function GET(): Response {
  const body = `# robots.txt for ${SITE_URL.replace(/^https?:\/\//, '')}
#
# Content-Signal declares preferences for how automated systems may use this
# site's content (https://contentsignals.org):
#   search=yes    — allow indexing for search results
#   ai-input=yes  — allow AI assistants to read this content to answer user queries
#   ai-train=no   — do not use this content to train AI/ML models

User-agent: *
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=no

Sitemap: ${SITE_URL}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
