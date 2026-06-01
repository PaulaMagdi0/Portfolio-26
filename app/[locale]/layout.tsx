import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale, getMessages, getTranslations } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { LOCALE_DIRECTIONS, SUPPORTED_LOCALES, isLocale, type Locale } from '@/i18n/config';
import { buildMetadata, buildPersonJsonLd } from '@/core/seo';
import { SkipLink } from '@/core/accessibility';
import { ThemeInitScript } from '@/core/theme';
import { cairo, instrumentSerif, inter, jetbrainsMono, notoNaskhArabic } from '../fonts';
import { ClientProviders } from './ClientProviders';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'home.meta' });
  return buildMetadata({
    locale: locale as Locale,
    title: t('title'),
    description: t('description'),
  });
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  const dir = LOCALE_DIRECTIONS[locale];

  return (
    <html
      lang={locale}
      dir={dir}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable} ${cairo.variable} ${notoNaskhArabic.variable} h-full antialiased`}
    >
      <head>
        <script
          id="person-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: buildPersonJsonLd() }}
        />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <ThemeInitScript />
        <ClientProviders locale={locale} messages={messages}>
          <SkipLink />
          {children}
        </ClientProviders>
        {/* Vercel Web Analytics + Speed Insights. Self-contained client components
            (own client boundary, no 'use client'/next-dynamic needed). They report
            only from Vercel deployments — never localhost — and are served
            first-party from /_vercel/*, which the app's CSP 'self' already allows. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
