import { getTranslations } from 'next-intl/server';
import { Reveal, SectionHead, SplitReveal } from '@/features/ui-components';
import { CERTIFICATIONS } from '../config';

export async function Certifications() {
  const t = await getTranslations();
  const sec = await getTranslations('home.certs');

  return (
    <section id="certifications" className="relative px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead num="04" label={sec('label')} />
        <Reveal>
          <SplitReveal
            as="h2"
            stagger={0.018}
            duration={0.95}
            className="text-ink mb-12 font-serif text-[40px] leading-tight md:text-[56px]"
          >
            {sec('heading1')}{' '}
            <span className="text-inkdim font-light italic">{sec('heading2')}</span>
          </SplitReveal>
        </Reveal>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CERTIFICATIONS.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.06}>
              <li className="border-line bg-bg2 flex h-full flex-col rounded-lg border p-6">
                <div className="mb-5 flex items-center justify-between">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.logo}
                    alt={t(c.issuerKey)}
                    width={28}
                    height={28}
                    className="marquee-logo h-7 w-7"
                  />
                  {c.division ? (
                    <span className="text-amber font-mono text-[10px] tracking-[0.18em] uppercase">
                      {c.division}
                    </span>
                  ) : null}
                </div>
                <h3 className="text-ink mb-1 font-serif text-[20px] leading-tight">
                  {t(c.nameKey)}
                </h3>
                <p className="text-inkdim mb-4 font-mono text-[12px]">{t(c.issuerKey)}</p>
                <p className="text-inkdim mb-5 flex-1 text-[13px]">{t(c.descKey)}</p>
                <dl className="border-line text-inkmute grid grid-cols-2 gap-y-2 border-t pt-4 font-mono text-[10px] tracking-[0.18em] uppercase">
                  <dt>{sec('issued')}</dt>
                  <dd className="text-inkdim normal-case">{c.issued}</dd>
                  {c.expires ? (
                    <>
                      <dt>{sec('expires')}</dt>
                      <dd className="text-inkdim normal-case">{c.expires}</dd>
                    </>
                  ) : null}
                  <dt className="col-span-2 mt-2">{sec('credId')}</dt>
                  <dd className="text-inkdim col-span-2 truncate normal-case">{c.credentialId}</dd>
                </dl>
                {c.skills.length ? (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {c.skills.map((s) => (
                      <li
                        key={s}
                        className="border-line text-inkdim rounded-full border px-2 py-0.5 font-mono text-[10px]"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
