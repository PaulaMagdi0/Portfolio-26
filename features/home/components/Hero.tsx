import { getTranslations } from 'next-intl/server';
import { Hero3DLazy } from './Hero3DLazy';
import { HeroHeadline } from './HeroHeadline';
import { AvailabilityPill, Magnetic, Reveal, SplitReveal } from '@/features/ui-components';

export async function Hero() {
  const t = await getTranslations('home.hero');

  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col overflow-hidden px-6 pt-28 pb-12 md:px-10 md:pt-32 md:pb-16"
    >
      <div
        aria-hidden
        className="text-amber pointer-events-none absolute top-1/2 right-[-40px] hidden -translate-y-1/2 lg:block xl:right-[-60px] 2xl:right-[-80px]"
      >
        <div className="h-[420px] w-[420px] xl:h-[520px] xl:w-[520px] 2xl:h-[640px] 2xl:w-[640px]">
          <Hero3DLazy />
        </div>
      </div>

      <Reveal as="div" className="relative z-10 flex items-center gap-4">
        <span
          aria-hidden
          className="bg-amber inline-block h-px w-12 origin-left scale-x-0 animate-[hero-rule_1.1s_cubic-bezier(0.2,0.7,0.2,1)_0.2s_forwards]"
        />
        <span className="text-inkmute animate-[hero-fade_0.7s_ease-out_0.6s_forwards] font-mono text-[11px] tracking-[0.2em] uppercase opacity-0">
          {t('portfolio')}
        </span>
        <span className="ml-auto">
          <AvailabilityPill delaySeconds={1.0} />
        </span>
      </Reveal>

      <div className="relative z-10 mt-8 max-w-[1100px] md:mt-12">
        <HeroHeadline>
          <SplitReveal
            as="h1"
            mode="instant"
            delay={0.15}
            stagger={0.014}
            duration={1.0}
            className="text-ink font-serif text-[14vw] leading-[0.95] tracking-[-0.02em] sm:text-[12vw] md:text-[9.5vw] lg:text-[120px] xl:text-[140px] 2xl:text-[160px]"
          >
            {t('headline')}
            <span className="text-amber">.</span>
          </SplitReveal>
        </HeroHeadline>
      </div>

      <div className="relative z-10 mt-10 max-w-[560px] animate-[hero-fade_0.9s_ease-out_1s_forwards] opacity-0 md:mt-14">
        <p className="text-amber font-mono text-[11px] tracking-[0.18em] uppercase">
          {t('kicker')}
        </p>
        <p className="text-inkdim mt-4 text-[15px] leading-[1.55] md:text-[17px]">
          {t('descriptionLead')} <em className="text-ink not-italic">{t('descriptionEmph')}</em>
        </p>
      </div>

      <div className="relative z-10 mt-8 flex animate-[hero-fade_0.9s_ease-out_1.2s_forwards] flex-wrap items-center gap-4 opacity-0">
        <Magnetic as="span" strength={0.25}>
          <a href="#work" className="btn-base btn-primary">
            {t('ctaWork')}
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </a>
        </Magnetic>
        <Magnetic as="span" strength={0.25}>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-label="open"
            className="btn-base btn-ghost"
          >
            {t('ctaResume')}
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </a>
        </Magnetic>
      </div>
    </section>
  );
}
