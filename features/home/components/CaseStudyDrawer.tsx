'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { WorkProject } from '../types';
import { AnimatedMetric } from './AnimatedMetric';
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
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            data-lenis-prevent
            className="border-line bg-bg2 fixed top-16 right-0 bottom-0 z-[70] w-full overflow-y-auto overscroll-contain border-l md:w-[680px]"
          >
            <div className="bg-bg2/95 border-line sticky top-0 z-10 flex items-center justify-between border-b px-8 py-5 backdrop-blur-sm md:px-12">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
                <span className="text-amber">{t('home.work.caseStudy.label')}</span>
                <span className="text-inkmute"> · {t(project.badgeKey)}</span>
              </span>
              <button
                type="button"
                aria-label={t('home.work.caseStudy.close')}
                data-cursor-label="close"
                onClick={onClose}
                className="hover:text-amber text-ink transition-colors"
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
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-8 md:p-12">
              <motion.h2
                key={`${project.id}-h`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, ease: [0.2, 0.7, 0.2, 1], delay: 0.05 }}
                className="text-ink mb-3 font-serif text-[30px] leading-[1.05] md:text-[44px]"
              >
                {t(project.nameKey)}
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.18 }}
                className="text-inkdim mb-10 flex items-center gap-3 font-mono text-[12px]"
              >
                <span>{t(project.companyKey)}</span>
                <span className="bg-inkmute h-1 w-1 rounded-full" />
                <span>{t(project.periodKey)}</span>
              </motion.div>
              <CSBlock label={t('home.work.caseStudy.role')} delay={0.28}>
                <p className="text-inkdim">{t(project.caseStudy.roleKey)}</p>
              </CSBlock>
              <CSBlock label={t('home.work.caseStudy.problem')} delay={0.36}>
                <p className="text-inkdim">{t(project.caseStudy.problemKey)}</p>
              </CSBlock>
              <CSBlock label={t('home.work.caseStudy.architecture')} delay={0.44}>
                <p className="text-inkdim">{t(project.caseStudy.architectureKey)}</p>
              </CSBlock>
              <CSBlock label={t('home.work.caseStudy.contributions')} delay={0.52}>
                <ul className="text-inkdim space-y-3">
                  {t(project.caseStudy.contributionsKey)
                    .split(' · ')
                    .map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.6 + i * 0.08,
                          ease: [0.2, 0.7, 0.2, 1],
                        }}
                        className="flex gap-3"
                      >
                        <motion.span
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            duration: 0.45,
                            delay: 0.7 + i * 0.08,
                            ease: [0.2, 0.7, 0.2, 1],
                          }}
                          className="bg-amber/70 mt-2 h-px w-3 shrink-0 origin-left"
                          aria-hidden
                        />
                        <span>{item.trim()}</span>
                      </motion.li>
                    ))}
                </ul>
              </CSBlock>
              <CSBlock label={t('home.work.caseStudy.outcomes')} delay={0.6}>
                <div className="grid grid-cols-3 gap-4">
                  {project.metrics.map((m, i) => (
                    <motion.div
                      key={m.labelKey}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.55,
                        delay: 0.68 + i * 0.08,
                        ease: [0.2, 0.7, 0.2, 1],
                      }}
                    >
                      <span className="text-ink mb-1 block font-serif text-[24px] leading-none tabular-nums md:text-[30px]">
                        <AnimatedMetric value={m.value} />
                      </span>
                      <span className="text-inkmute font-mono text-[10px] tracking-[0.08em] uppercase">
                        {t(m.labelKey)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CSBlock>
              <CSBlock label={t('home.work.caseStudy.stack')} delay={0.7} last>
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.78 + i * 0.03,
                        ease: 'easeOut',
                      }}
                      className="border-line bg-bg/40 text-inkdim rounded border px-2 py-1 font-mono text-[11px]"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </CSBlock>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
