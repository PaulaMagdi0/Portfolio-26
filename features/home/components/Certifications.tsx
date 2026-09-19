import { getTranslations } from 'next-intl/server';
import { Magnetic, Reveal, SectionHead, SplitReveal } from '@/features/ui-components';
import { CERTIFICATIONS } from '../config';

export async function Certifications() {
  const t = await getTranslations();
  const sec = await getTranslations('home.certs');

  return (
    <section id="certifications" className="relative px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead num="04" label={sec('label')} />

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
                <em className="text-inkdim font-light italic">{sec('heading2')}</em>
              </SplitReveal>
            </Reveal>
          </div>

          <div className="md:col-span-9">
            <ol>
              {CERTIFICATIONS.map((c, i) => (
                <Reveal
                  key={c.id}
                  as="li"
                  delay={i * 0.05}
                  className="border-line grid grid-cols-1 gap-6 border-t py-8 first:border-t-0 md:grid-cols-12 md:py-10"
                >
                  <div className="flex flex-col gap-3 md:col-span-3">
                    <Magnetic as="span" strength={0.35} className="inline-block w-fit">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.logo}
                        alt={t(c.issuerKey)}
                        width={56}
                        height={32}
                        className="marquee-logo h-8 w-auto opacity-90"
                        loading="lazy"
                        draggable={false}
                      />
                    </Magnetic>
                    <span className="text-amber font-mono text-[11px] tracking-[0.1em]">
                      {t(`home.certs.${c.id}.issued`)}
                      {c.expires ? <> → {t(`home.certs.${c.id}.expires`)}</> : null}
                    </span>
                  </div>

                  <div className="md:col-span-9">
                    <h3 className="text-ink mb-1 font-serif text-[24px] leading-[1.15] md:text-[28px]">
                      {t(c.nameKey)}
                    </h3>
                    <p className="text-inkdim mb-4 font-mono text-[13px]">
                      {t(c.issuerKey)}
                      {c.division ? <span className="text-inkmute"> · {c.division}</span> : null}
                    </p>
                    <p className="text-inkdim mb-4 max-w-[600px] text-[14px] leading-relaxed">
                      {t(c.descKey)}
                    </p>
                    <div className="text-inkmute mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px]">
                      {c.credentialId ? (
                        <>
                          <span className="text-inkmute tracking-[0.14em] uppercase">
                            {sec('credId')}
                          </span>
                          <span className="text-ink break-all">{c.credentialId}</span>
                        </>
                      ) : null}
                      <a
                        href={c.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor-label={t('ui.cursor.visit')}
                        className="text-amber hover:text-ink focus-visible:ring-amber/60 inline-flex items-center gap-1 rounded-sm tracking-[0.08em] uppercase transition-colors focus-visible:ring-1 focus-visible:outline-none"
                      >
                        {sec('verify')}
                        <svg
                          className="h-3 w-3 rtl:-scale-x-100"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M7 17 17 7M7 7h10v10" />
                        </svg>
                        <span className="sr-only">{t('ui.a11y.opensInNewTab')}</span>
                      </a>
                    </div>
                    {c.skills.length ? (
                      <ul className="flex flex-wrap gap-1.5">
                        {c.skills.map((s) => (
                          <li
                            key={s}
                            className="border-line bg-bg2/40 text-inkdim rounded border px-2 py-1 font-mono text-[11px]"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    ) : null}
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
