import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/config';
import {
  Certifications,
  Contact,
  Education,
  Experience,
  FAQ,
  Hero,
  HeroMetaStrip,
  Stack,
  Work,
} from '@/features/home';
import {
  BgSpotlight,
  CustomCursor,
  LoaderRevealScript,
  PageLoader,
  ScrollProgress,
  TopNav,
  WebMcpTools,
} from '@/features/ui-components';

export const dynamic = 'force-static';
export const dynamicParams = false;

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <>
      <LoaderRevealScript />
      <PageLoader />
      <CustomCursor />
      <BgSpotlight />
      <ScrollProgress />
      <TopNav />
      <WebMcpTools />
      <main id="main" className="relative z-10">
        <Hero />
        <HeroMetaStrip />
        <Work />
        <Experience />
        <Education />
        <Certifications />
        <Stack />
        <FAQ />
        <Contact />
      </main>
    </>
  );
}
