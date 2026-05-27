import { getTranslations } from 'next-intl/server';
import { LiveClock, Reveal, SectionHead, SplitReveal } from '@/features/ui-components';
import { ContactForm } from '@/features/contact-form';
import { RECIPIENT_EMAIL, SOCIALS } from '../config';
import { EmailCopyButton } from './EmailCopyButton';

const SOCIAL_PATHS: Record<string, string> = {
  'home.contact.socials.github':
    'M12 .5A11.5 11.5 0 0 0 .5 12.1c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.5-.3-5.2-1.3-5.2-5.6 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.5.1-3 0 0 .9-.3 3.1 1.1.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.1-1.1 3.1-1.1.6 1.6.2 2.8.1 3 .7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.3-5.2 5.6.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9A11.5 11.5 0 0 0 12 .5z',
  'home.contact.socials.linkedin':
    'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .78 0 1.73v20.54C0 23.22.79 24 1.77 24h20.46C23.21 24 24 23.22 24 22.27V1.73C24 .78 23.21 0 22.23 0z',
  'home.contact.socials.leetcode':
    'M13.5 1.5 5.7 9.3a3 3 0 0 0 0 4.2l4.2 4.2a3 3 0 0 0 4.2 0L17 15M8 12h11M5.7 14.7 10 19',
  'home.contact.socials.hackerrank': 'M4 4h16v16H4zM8 7v10M16 7v10M8 12h8',
};

const SOCIAL_VIEWBOX: Record<string, string> = {
  'home.contact.socials.github': '0 0 24 24',
  'home.contact.socials.linkedin': '0 0 24 24',
  'home.contact.socials.leetcode': '0 0 24 24',
  'home.contact.socials.hackerrank': '0 0 24 24',
};

const SOCIAL_FILL: Record<string, boolean> = {
  'home.contact.socials.github': true,
  'home.contact.socials.linkedin': true,
  'home.contact.socials.leetcode': false,
  'home.contact.socials.hackerrank': false,
};

export async function Contact() {
  const t = await getTranslations();
  const sec = await getTranslations('home.contact');

  return (
    <section id="contact" className="relative overflow-hidden px-6 pt-16 pb-10 md:px-10 md:pt-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead num="06" label={sec('label')} />
        <Reveal>
          <SplitReveal
            as="h2"
            stagger={0.018}
            duration={1.0}
            className="text-ink mt-8 mb-12 font-serif text-[14vw] leading-[0.95] tracking-[-0.02em] sm:text-[12vw] md:mb-16 md:text-[9.5vw] lg:text-[120px] xl:text-[140px] 2xl:text-[160px]"
          >
            {sec('heading1')}{' '}
            <em className="text-inkdim font-light not-italic">{sec('heading2')}</em>
            <span className="text-amber">.</span>
          </SplitReveal>
        </Reveal>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4">
            <p className="text-inkmute mb-4 font-mono text-[11px] tracking-[0.18em] uppercase">
              {sec('sendMessage')}
            </p>
            <h3 className="text-ink mb-3 font-serif text-[22px] md:text-[26px]">
              {sec('pitchHeading')}
            </h3>
            <p className="text-inkdim max-w-[300px] text-[14px]">{sec('pitchDescription')}</p>
          </div>
          <div className="md:col-span-8">
            <ContactForm />
          </div>
        </div>

        {/* Direct-contact strip */}
        <div className="border-line mt-16 mb-12 grid grid-cols-1 gap-8 border-t pt-10 md:grid-cols-12 md:gap-6 md:pt-12">
          <Reveal as="div" className="md:col-span-5">
            <p className="text-inkmute mb-3 font-mono text-[10px] tracking-[0.18em] uppercase">
              {sec('email')}
            </p>
            <EmailCopyButton email={RECIPIENT_EMAIL} />
          </Reveal>

          <Reveal as="div" delay={0.05} className="md:col-span-3">
            <p className="text-inkmute mb-3 font-mono text-[10px] tracking-[0.18em] uppercase">
              {sec('phone')}
            </p>
            <p className="text-ink font-serif text-[20px] md:text-[24px]">{sec('phoneValue')}</p>
          </Reveal>

          <Reveal as="div" delay={0.1} className="md:col-span-4">
            <p className="text-inkmute mb-3 font-mono text-[10px] tracking-[0.18em] uppercase">
              {sec('elsewhere')}
            </p>
            <ul className="grid grid-cols-2 gap-3">
              {SOCIALS.map((s) => {
                const path = SOCIAL_PATHS[s.labelKey];
                const filled = SOCIAL_FILL[s.labelKey];
                return (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor-label="open"
                      className="text-inkdim hover:text-amber group flex items-center gap-2 transition-colors"
                    >
                      <svg
                        className="h-4 w-4 shrink-0"
                        viewBox={SOCIAL_VIEWBOX[s.labelKey] ?? '0 0 24 24'}
                        fill={filled ? 'currentColor' : 'none'}
                        stroke={filled ? 'none' : 'currentColor'}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d={path} />
                      </svg>
                      <span className="font-mono text-[12px]">{t(s.labelKey)}</span>
                      <span
                        aria-hidden
                        className="ml-auto inline-flex transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M7 17 17 7M7 7h10v10" />
                        </svg>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>

        {/* Bottom strip */}
        <div className="border-line flex flex-col gap-4 border-t pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-inkmute font-mono text-[11px]">{sec('footerBuilt')}</p>
          <div className="flex items-center gap-3">
            <span aria-hidden className="relative inline-flex h-2 w-2">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <LiveClock />
            <a
              href="#top"
              data-cursor-label="open"
              className="text-inkdim hover:text-ink inline-flex items-center gap-1 font-mono text-[11px] transition-colors"
            >
              <span>{sec('backToTop')}</span>
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m18 15-6-6-6 6" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 -bottom-20 left-0 select-none"
      >
        <p className="text-ink font-serif text-[28vw] leading-none tracking-tighter opacity-[0.04]">
          Paula
        </p>
      </div>
    </section>
  );
}
