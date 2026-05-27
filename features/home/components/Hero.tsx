import { getTranslations } from 'next-intl/server';
import { Magnetic, MaskReveal, Reveal } from '@/features/ui-components';
import { AnimatedMetric } from './AnimatedMetric';
import { Hero3DLazy } from './Hero3DLazy';
import { HeroHeadline } from './HeroHeadline';
import { MetaCell } from './MetaCell';

export async function Hero() {
  const t = await getTranslations('home.hero');
  return (
    <section id="hero" className="relative px-6 pt-32 pb-24 md:px-10 md:pt-36 md:pb-32">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <div className="mb-8 flex items-center gap-3">
              <span className="section-num">{t('portfolio')}</span>
              <span className="bg-amber block h-2 w-2 rounded-full" aria-hidden />
              <span className="section-num">{t('availability')}</span>
            </div>
          </Reveal>
          <HeroHeadline>
            <MaskReveal>{t('headline')}</MaskReveal>
          </HeroHeadline>
          <p className="text-inkdim mt-8 max-w-xl text-lg">
            <span>{t('descriptionLead')}</span> <em className="text-ink">{t('descriptionEmph')}</em>
          </p>
          <div className="mt-10 flex items-center gap-4">
            <Magnetic as="span" strength={0.2}>
              <a href="#work" className="btn-base btn-primary block w-full">
                {t('ctaWork')}
              </a>
            </Magnetic>
            <Magnetic as="span" strength={0.2}>
              <a href="/resume.pdf" download className="btn-base btn-ghost block w-full">
                {t('ctaResume')}
              </a>
            </Magnetic>
          </div>
        </div>
        <div className="relative aspect-[4/5] min-h-[420px] lg:col-span-5">
          <Hero3DLazy />
        </div>
      </div>
      <div className="mt-20 grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4">
        <MetaCell label={t('meta.based')} value={t('meta.basedValue')} />
        <MetaCell label={t('meta.focus')} value={t('meta.focusValue')} />
        <MetaCell label={t('meta.years')} value={t('meta.yearsValue')} />
        <MetaCell label={t('meta.metric')} value={<AnimatedMetric value="−35%" />} />
      </div>
    </section>
  );
}
