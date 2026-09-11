'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Reveal, SectionHead, SplitReveal } from '@/features/ui-components';
import { WORK } from '../config';
import type { WorkProject } from '../types';
import { CaseStudyDrawer } from './CaseStudyDrawer';
import { WorkRow } from './WorkRow';

interface ActiveCase {
  project: WorkProject;
  /** The card button that opened the drawer; focus returns here on close. */
  opener: HTMLElement;
}

export function Work() {
  const t = useTranslations('home.work');
  const [active, setActive] = useState<ActiveCase | null>(null);
  const open = useCallback((project: WorkProject, opener: HTMLElement) => {
    setActive({ project, opener });
  }, []);
  const close = useCallback(() => setActive(null), []);

  return (
    <section id="work" className="relative px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead num="01" label={t('label')} />
        <Reveal>
          <SplitReveal
            as="h2"
            className="mb-12 font-serif text-[40px] leading-tight md:text-[56px]"
          >
            {t('intro1')} <em className="text-inkdim">{t('introEmph')}</em>
          </SplitReveal>
        </Reveal>
        <ol>
          {WORK.map((project, i) => (
            <WorkRow
              key={project.id}
              project={project}
              index={i}
              total={WORK.length}
              onOpen={open}
            />
          ))}
        </ol>
      </div>
      <CaseStudyDrawer
        project={active?.project ?? null}
        returnFocusTo={active?.opener ?? null}
        onClose={close}
      />
    </section>
  );
}
