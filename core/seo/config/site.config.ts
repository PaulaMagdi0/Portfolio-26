// Canonical production domain. The env var is the source of truth; the fallback
// is the real custom domain (NOT the *.vercel.app subdomain) so a missing env var
// can never point canonical/sitemap/OG tags at the wrong host.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paulamagdy.com';
export const SITE_NAME = 'Paula Magdy';
export const SITE_TWITTER = '@paulamagdy';
