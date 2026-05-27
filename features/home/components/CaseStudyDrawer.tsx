'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { WorkProject } from '../types';
import { CSBlock } from './CSBlock';

interface CaseStudyDrawerProps {
  project: WorkProject | null;
  onClose: () => void;
}

export function CaseStudyDrawer({ project, onClose }: CaseStudyDrawerProps) {
  const t = useTranslations();

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = original;
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project ? (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-bg/80 fixed inset-0 z-[68] backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal
            aria-label={t('home.work.caseStudy.label')}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
            className="border-line bg-bg2 fixed top-0 right-0 bottom-0 z-[70] w-full overflow-y-auto border-l p-8 md:w-[640px] md:p-12"
          >
            <button
              type="button"
              onClick={onClose}
              className="mb-8 font-mono text-xs tracking-widest uppercase"
            >
              ← {t('home.work.caseStudy.close')}
            </button>
            <h2 className="mb-8 font-serif text-3xl md:text-4xl">{t(project.nameKey)}</h2>
            <CSBlock label={t('home.work.caseStudy.role')}>
              <p className="text-inkdim">{t(project.caseStudy.roleKey)}</p>
            </CSBlock>
            <CSBlock label={t('home.work.caseStudy.problem')} delay={0.05}>
              <p className="text-inkdim">{t(project.caseStudy.problemKey)}</p>
            </CSBlock>
            <CSBlock label={t('home.work.caseStudy.architecture')} delay={0.1}>
              <p className="text-inkdim">{t(project.caseStudy.architectureKey)}</p>
            </CSBlock>
            <CSBlock label={t('home.work.caseStudy.contributions')} last delay={0.15}>
              <ul className="text-inkdim space-y-3">
                {t(project.caseStudy.contributionsKey)
                  .split(' · ')
                  .map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="bg-amber/70 mt-2.5 h-px w-3 shrink-0" aria-hidden />
                      <span>{item.trim()}</span>
                    </li>
                  ))}
              </ul>
            </CSBlock>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
