import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale, getMessages, getTranslations } from 'next-intl/server';
import { LOCALE_DIRECTIONS, SUPPORTED_LOCALES, isLocale, type Locale } from '@/i18n/config';
import { buildMetadata, buildPersonJsonLd } from '@/core/seo';
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
    <ClientProviders locale={locale} messages={messages}>
      <div lang={locale} dir={dir}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: buildPersonJsonLd() }}
        />
        {children}
      </div>
    </ClientProviders>
  );
}
