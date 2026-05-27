import { getTranslations } from 'next-intl/server';
import { Reveal, SectionHead, SplitReveal } from '@/features/ui-components';
import { EXPERIENCE } from '../config';

export async function Experience() {
  const t = await getTranslations();
  const sec = await getTranslations('home.experience');

  return (
    <section id="experience" className="relative px-6 pt-10 pb-16 md:px-10 md:pt-14 md:pb-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead num="02" label={sec('label')} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="md:col-span-3">
            <Reveal>
              <SplitReveal
                as="h2"
                stagger={0.018}
                duration={0.95}
                className="text-ink font-serif text-[34px] leading-[1.05] md:text-[44px]"
              >
                {sec('heading1')}
                <br />
                <span className="text-inkdim font-light italic">{sec('heading2')}</span>
              </SplitReveal>
            </Reveal>
          </div>
          <div className="md:col-span-9">
            <ol className="relative">
              {EXPERIENCE.map((e, i) => (
                <Reveal
                  key={i}
                  delay={i * 0.05}
                  as="li"
                  className="group border-line grid grid-cols-1 gap-6 border-t py-8 first:border-t-0 md:grid-cols-12 md:py-10"
                >
                  <div className="md:col-span-3">
                    <span className="text-amber font-mono text-[11px] tracking-[0.1em]">
                      {t(e.periodKey)}
                    </span>
                  </div>
                  <div className="md:col-span-9">
                    <h3 className="text-ink mb-1 font-serif text-[24px] leading-[1.15] md:text-[28px]">
                      {t(e.roleKey)}
                    </h3>
                    <p className="text-inkdim mb-4 font-mono text-[13px]">
                      {t(e.companyKey)} <span className="text-inkmute">· {t(e.locationKey)}</span>
                    </p>
                    <ul className="space-y-2.5">
                      {e.bulletKeys.map((bk) => (
                        <li key={bk} className="text-inkdim flex gap-3 text-[14px] leading-relaxed">
                          <span className="bg-amber/70 mt-2 h-px w-3 shrink-0" aria-hidden />
                          <span>{t(bk)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
