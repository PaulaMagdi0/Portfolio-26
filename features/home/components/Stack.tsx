import { getTranslations } from 'next-intl/server';
import { Marquee, Reveal, SectionHead } from '@/features/ui-components';
import { MARQUEE_TOOLS, STACK } from '../config';

export async function Stack() {
  const t = await getTranslations();
  const sec = await getTranslations('home.stack');

  return (
    <section id="stack" className="relative px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1400px]">
        <SectionHead num="05" label={sec('label')} />
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5 md:gap-6">
          {STACK.map((group, i) => (
            <Reveal key={group.titleKey} delay={i * 0.05}>
              <h3 className="text-amber mb-4 font-mono text-[11px] tracking-[0.18em] uppercase">
                {t(group.titleKey)}
              </h3>
              <ul className="space-y-1.5">
                {group.items.map((item) => (
                  <li key={item} className="text-ink text-[14px]">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        <Marquee className="truncate-fade mt-16 py-4" ariaLabel="Tooling marquee">
          {MARQUEE_TOOLS.map((tool) => (
            <div key={tool.name} className="mx-5 flex shrink-0 items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tool.src}
                alt={tool.name}
                width={28}
                height={28}
                className="marquee-logo h-7 w-7"
              />
              <span className="text-inkdim font-mono text-[11px] tracking-[0.18em] uppercase">
                {tool.name}
              </span>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
