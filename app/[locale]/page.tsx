import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/config';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <main id="main" className="grid min-h-dvh place-items-center">
      <p className="font-serif text-4xl">Portfolio scaffold — locale: {locale}</p>
    </main>
  );
}
