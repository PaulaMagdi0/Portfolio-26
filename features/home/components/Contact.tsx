import { getTranslations } from 'next-intl/server';
import { Reveal, SectionHead, SplitReveal } from '@/features/ui-components';
import { ContactForm } from '@/features/contact-form';

export async function Contact() {
  const sec = await getTranslations('home.contact');

  return (
    <section
      id="contact"
      className="relative overflow-hidden px-6 pt-16 pb-10 md:px-10 md:pt-24"
    >
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
      </div>
    </section>
  );
}
