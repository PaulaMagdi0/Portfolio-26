import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { LOCALE_DIRECTIONS, SUPPORTED_LOCALES, isLocale } from '@/i18n/config';
import { ClientProviders } from './ClientProviders';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
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
        {children}
      </div>
    </ClientProviders>
  );
}
