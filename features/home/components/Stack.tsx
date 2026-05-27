import { getTranslations } from 'next-intl/server';
import { Marquee, Reveal, SectionHead } from '@/features/ui-components';
import { MARQUEE_TOOLS, STACK } from '../config';

export async function Stack() {
  const t = await getTranslations();
  const sec = await getTranslations('home.stack');

  return (
    <section id="stack" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <SectionHead num="05" label={sec('label')} />
      </div>

      {/* Full-bleed marquee — spans the entire viewport width */}
      <div className="border-line mt-8 mb-14 border-y py-6 md:mb-20 md:py-8">
        <Marquee speed={48} ariaLabel="Tooling marquee">
          {MARQUEE_TOOLS.map((tool) => (
            <div key={tool.name} className="mx-8 flex shrink-0 items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tool.src}
                alt={tool.name}
                width={36}
                height={36}
                className="marquee-logo h-9 w-9 md:h-10 md:w-10"
                loading="lazy"
                draggable={false}
              />
              <span className="text-inkdim font-mono text-[11px] tracking-[0.18em] uppercase md:text-[12px]">
                {tool.name}
              </span>
            </div>
          ))}
        </Marquee>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Intro paragraph */}
        <Reveal className="text-ink mb-14 max-w-[820px] font-serif text-[28px] leading-[1.15] md:text-[40px]">
          <p>
            {sec('intro1')}
            <em className="text-inkdim font-light not-italic">{sec('introEmph')}</em>
          </p>
        </Reveal>

        {/* Group rows */}
        <ul>
          {STACK.map((group, i) => (
            <Reveal
              as="li"
              key={group.titleKey}
              delay={i * 0.04}
              className="border-line grid grid-cols-1 gap-6 border-t py-8 md:grid-cols-12 md:py-10"
            >
              <div className="flex items-baseline gap-3 md:col-span-3">
                <span className="text-amber font-mono text-[10px]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-ink font-serif text-[24px] md:text-[28px]">
                  {t(group.titleKey)}
                </h3>
              </div>
              <ul className="flex flex-wrap items-center gap-1.5 md:col-span-9">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="border-line bg-bg2/40 text-inkdim hover:border-amber/40 hover:text-ink rounded-md border px-2 py-1 font-mono text-[11px] transition-colors"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
