import { getTranslations } from 'next-intl/server';
import { Reveal, SectionHead, SplitReveal } from '@/features/ui-components';
import { ContactForm } from '@/features/contact-form';
import { RECIPIENT_EMAIL, SOCIALS } from '../config';

export async function Contact() {
  const t = await getTranslations();
  const sec = await getTranslations('home.contact');

  return (
    <section id="contact" className="relative px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead num="06" label={sec('label')} />
        <Reveal>
          <SplitReveal
            as="h2"
            stagger={0.018}
            duration={0.95}
            className="text-ink mb-12 font-serif text-[48px] leading-tight md:text-[72px]"
          >
            {sec('heading1')}{' '}
            <span className="text-inkdim font-light italic">{sec('heading2')}</span>
          </SplitReveal>
        </Reveal>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <h3 className="text-ink mb-4 font-serif text-2xl">{sec('pitchHeading')}</h3>
            <p className="text-inkdim mb-8 max-w-[480px]">{sec('pitchDescription')}</p>
            <ContactForm />
          </div>
          <aside className="grid content-start gap-6 md:col-span-5">
            <div>
              <span className="section-num">{sec('email')}</span>
              <a
                href={`mailto:${RECIPIENT_EMAIL}`}
                className="mt-2 block underline underline-offset-4"
              >
                {RECIPIENT_EMAIL}
              </a>
            </div>
            <div>
              <span className="section-num">{sec('elsewhere')}</span>
              <ul className="mt-2 space-y-1">
                {SOCIALS.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4"
                    >
                      {t(s.labelKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
