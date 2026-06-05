import { getTranslations } from 'next-intl/server';
import { Reveal, SectionHead, SplitReveal } from '@/features/ui-components';
import { FAQ_ITEMS } from '../config';

/**
 * FAQ section + co-located FAQPage JSON-LD. Emitting the structured data from the
 * same component that renders the visible Q&A guarantees the schema always
 * matches on-page content — and entity-anchored Q&A is one of the strongest
 * citation formats for AI answer engines (GEO). The JSON-LD is HTML-escaped
 * before it reaches dangerouslySetInnerHTML.
 */
export async function FAQ() {
  const t = await getTranslations();
  const sec = await getTranslations('home.faq');

  const faqJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: t(item.questionKey),
      acceptedAnswer: { '@type': 'Answer', text: t(item.answerKey) },
    })),
  }).replace(/</g, '\\u003c');

  return (
    <section id="faq" className="relative px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead num="06" label={sec('label')} />

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
            {FAQ_ITEMS.map((item, i) => (
              <Reveal
                key={item.id}
                as="div"
                delay={i * 0.05}
                className="border-line border-t first:border-t-0"
              >
                <details className="group py-6 md:py-7">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span className="text-ink font-serif text-[20px] leading-[1.25] md:text-[24px]">
                      {t(item.questionKey)}
                    </span>
                    <span
                      aria-hidden
                      className="text-amber shrink-0 transition-transform duration-300 group-open:rotate-45"
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <p className="text-inkdim mt-3 max-w-[680px] text-[14px] leading-relaxed md:text-[15px]">
                    {t(item.answerKey)}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />
    </section>
  );
}
