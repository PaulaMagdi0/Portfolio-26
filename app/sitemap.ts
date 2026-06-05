import type { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES } from '@/i18n/config';
import { LAST_UPDATED, SITE_URL } from '@/core/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  // Truthful freshness: bumped only when content changes (see LAST_UPDATED),
  // never on every build.
  const lastModified = new Date(LAST_UPDATED);

  // Mirror the head's hreflang exactly, including x-default → the default locale.
  const languages = {
    ...Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, `${SITE_URL}/${l}`])),
    'x-default': `${SITE_URL}/en`,
  };

  return SUPPORTED_LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 1,
    alternates: { languages },
  }));
}
