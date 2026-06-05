// Canonical production domain. The env var is the source of truth; the fallback
// is the real custom domain (NOT the *.vercel.app subdomain) so a missing env var
// can never point canonical/sitemap/OG tags at the wrong host.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paulamagdy.com';
export const SITE_NAME = 'Paula Magdy';

// Truthful "content last changed" date (YYYY-MM-DD). Bump this MANUALLY when the
// page content meaningfully changes — used for the sitemap's lastModified and the
// ProfilePage dateModified. A build-time `new Date()` would mark the page "fresh"
// on every deploy, which is a false freshness signal that crawlers (notably
// Perplexity) gate on. Keep it honest.
export const LAST_UPDATED = '2026-06-06';

// Fail the build early if LAST_UPDATED is ever malformed — a typo (e.g. '2026-6-6')
// would otherwise silently produce an Invalid Date in the sitemap and a non-ISO
// dateModified in the JSON-LD.
if (Number.isNaN(new Date(LAST_UPDATED).getTime())) {
  throw new Error(`LAST_UPDATED is not a valid date: ${LAST_UPDATED}`);
}
