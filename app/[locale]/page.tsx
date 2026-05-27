import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/config';
import { Certifications, Contact, Education, Experience, Hero, Stack, Work } from '@/features/home';
import { CustomCursor, PageLoader, ScrollProgress, TopNav } from '@/features/ui-components';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <>
      <PageLoader />
      <CustomCursor />
      <ScrollProgress />
      <TopNav />
      <main id="main" className="relative z-10">
        <Hero />
        <Work />
        <Experience />
        <Education />
        <Certifications />
        <Stack />
        <Contact />
      </main>
    </>
  );
}
