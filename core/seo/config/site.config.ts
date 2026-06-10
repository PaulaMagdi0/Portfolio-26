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
export const LAST_UPDATED = '2026-06-10';

// Fail the build early if LAST_UPDATED is ever malformed. The strict YYYY-MM-DD
// shape is enforced (not just date-validity) so a typo like '2026-6-6' is caught
// AND so LAST_UPDATED_ISO below can safely derive a datetime by string concat.
if (!/^\d{4}-\d{2}-\d{2}$/.test(LAST_UPDATED) || Number.isNaN(new Date(LAST_UPDATED).getTime())) {
  throw new Error(`LAST_UPDATED must be a valid YYYY-MM-DD date: ${LAST_UPDATED}`);
}

// Full ISO 8601 datetime (UTC midnight) for schema.org dateModified. Google's
// ProfilePage validator rejects a bare YYYY-MM-DD as "Invalid datetime value" — it
// expects a date AND time with an explicit timezone offset. The sitemap keeps the
// date-only LAST_UPDATED, which is valid per the sitemap protocol.
export const LAST_UPDATED_ISO = `${LAST_UPDATED}T00:00:00+00:00`;
