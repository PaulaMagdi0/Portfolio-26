import { getTranslations } from 'next-intl/server';
import { Reveal, SectionHead, SplitReveal } from '@/features/ui-components';
import { FAQ_ITEMS } from '../config';
import { FaqAccordion } from './FaqAccordion';

/**
 * FAQ section + co-located FAQPage JSON-LD. Resolving the translations here (a
 * server component) keeps the answers in the static HTML and lets the JSON-LD
 * always match the visible Q&A — entity-anchored Q&A is a strong citation format
 * for AI answer engines (GEO). The open/close interaction lives in FaqAccordion.
 * The JSON-LD is HTML-escaped before it reaches dangerouslySetInnerHTML.
 */
export async function FAQ() {
  const t = await getTranslations();
  const sec = await getTranslations('home.faq');

  const items = FAQ_ITEMS.map((item) => ({
    id: item.id,
    question: t(item.questionKey),
    answer: t(item.answerKey),
  }));

  const faqJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
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
            <FaqAccordion items={items} />
          </div>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />
    </section>
  );
}
