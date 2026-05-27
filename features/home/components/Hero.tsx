import { getTranslations } from 'next-intl/server';
import { Hero3DLazy } from './Hero3DLazy';
import { HeroHeadline } from './HeroHeadline';
import { AvailabilityPill, Magnetic, Reveal, SplitReveal } from '@/features/ui-components';

export async function Hero() {
  const t = await getTranslations('home.hero');
  const tCursor = await getTranslations('ui.cursor');

  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col overflow-hidden px-6 pt-28 pb-12 md:px-10 md:pt-32 md:pb-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mx-auto hidden max-w-[1200px] lg:block"
      >
        <div className="text-amber absolute end-[-40px] top-1/2 h-[420px] w-[420px] -translate-y-1/2 xl:end-[-60px] xl:h-[520px] xl:w-[520px] 2xl:end-[-80px] 2xl:h-[640px] 2xl:w-[640px]">
          <Hero3DLazy />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col">
        <Reveal as="div" className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-3">
          <span
            aria-hidden
            style={{ transform: 'scaleX(1)' }}
            className="bg-amber inline-block h-px w-12 origin-left animate-[hero-rule_1.1s_cubic-bezier(0.2,0.7,0.2,1)_0.2s_forwards]"
          />
          <span className="text-inkmute animate-[hero-fade_0.7s_ease-out_0.6s_forwards] font-mono text-[11px] tracking-[0.2em] uppercase opacity-0">
            {t('portfolio')}
          </span>
          <span className="ms-auto">
            <AvailabilityPill delaySeconds={1.0} />
          </span>
        </Reveal>

        <div className="relative z-10 flex flex-1 flex-col justify-center lg:max-w-[58%]">
          <div className="mt-8 max-w-[1100px] md:mt-12">
            <HeroHeadline>
              <SplitReveal
                as="h1"
                mode="instant"
                delay={0.15}
                stagger={0.014}
                duration={1.0}
                className="text-ink font-serif text-[14vw] leading-[0.95] tracking-[-0.02em] sm:text-[12vw] md:text-[9.5vw] lg:text-[108px] xl:text-[128px] 2xl:text-[148px]"
              >
                {t('headline')}
                <span className="text-amber">.</span>
              </SplitReveal>
            </HeroHeadline>
          </div>

          <div className="mt-10 max-w-[560px] animate-[hero-fade_0.9s_ease-out_1s_forwards] opacity-0 md:mt-14">
            <p className="text-amber font-mono text-[11px] tracking-[0.18em] uppercase">
              {t('kicker')}
            </p>
            <p className="text-inkdim mt-4 text-[15px] leading-[1.55] md:text-[17px]">
              {t('descriptionLead')} <em className="text-ink not-italic">{t('descriptionEmph')}</em>
            </p>
          </div>

          <div className="mt-8 flex animate-[hero-fade_0.9s_ease-out_1.2s_forwards] flex-wrap items-center gap-4 opacity-0">
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
                href="/Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-label={tCursor('open')}
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
                  <path d="M15 3h6v6M10 14 21 3M21 14v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                </svg>
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
