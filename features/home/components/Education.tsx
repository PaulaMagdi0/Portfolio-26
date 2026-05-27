import { getTranslations } from 'next-intl/server';
import { Reveal, SectionHead, SplitReveal } from '@/features/ui-components';

export async function Education() {
  const t = await getTranslations('home.education');

  return (
    <section id="education" className="relative px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead num="03" label={t('label')} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <Reveal className="md:col-span-3">
            <span className="text-amber font-mono text-[11px] tracking-[0.1em]">{t('period')}</span>
          </Reveal>
          <Reveal className="md:col-span-9" delay={0.05}>
            <SplitReveal
              as="h3"
              stagger={0.014}
              duration={0.95}
              className="text-ink mb-3 font-serif text-[28px] leading-[1.1] md:text-[40px]"
            >
              {t('degree1')}
              <br />
              <span className="text-inkdim font-light italic">{t('degree2')}</span>
            </SplitReveal>
            <p className="text-inkdim mb-6 font-mono text-[14px]">
              {t('school')} <span className="text-inkmute">· {t('location')}</span>
            </p>
            <div className="border-line max-w-[680px] border-t pt-6">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-inkmute font-mono text-[11px] tracking-[0.18em] uppercase">
                  {t('gradLabel')}
                </span>
                <span className="text-amber font-mono text-[11px]">{t('grade')}</span>
              </div>
              <p className="text-ink mb-1 text-[15px]">{t('gradProject')}</p>
              <p className="text-inkdim font-mono text-[13px]">{t('gradStack')}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
