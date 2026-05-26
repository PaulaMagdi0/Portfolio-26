import type { Metadata } from 'next';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/config';
import { OG_IMAGE_PATH, SITE_NAME, SITE_TWITTER, SITE_URL } from '../config/site.config';

interface BuildMetadataInput {
  locale: Locale;
  title: string;
  description: string;
  path?: string;
}

export function buildMetadata({
  locale,
  title,
  description,
  path = '',
}: BuildMetadataInput): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`]),
  ) as Record<Locale, string>;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: { ...languages, 'x-default': `${SITE_URL}/en${path}` },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: SITE_NAME,
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: SITE_TWITTER,
      images: [OG_IMAGE_PATH],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  };
}
