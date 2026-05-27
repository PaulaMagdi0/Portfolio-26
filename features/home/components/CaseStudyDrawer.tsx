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
            transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
            data-lenis-prevent
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
            <CSBlock label={t('home.work.caseStudy.contributions')} delay={0.15}>
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
                        delay: 0.25 + i * 0.08,
                        ease: [0.2, 0.7, 0.2, 1],
                      }}
                      className="flex gap-3"
                    >
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: 0.45,
                          delay: 0.32 + i * 0.08,
                          ease: [0.2, 0.7, 0.2, 1],
                        }}
                        className="bg-amber/70 mt-2.5 h-px w-3 shrink-0 origin-left"
                        aria-hidden
                      />
                      <span>{item.trim()}</span>
                    </motion.li>
                  ))}
              </ul>
            </CSBlock>
            <CSBlock label={t('home.work.caseStudy.outcomes')} delay={0.2}>
              <div className="grid grid-cols-3 gap-4">
                {project.metrics.map((m, i) => (
                  <motion.div
                    key={m.labelKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.3 + i * 0.08,
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
            <CSBlock label={t('home.work.caseStudy.stack')} delay={0.25} last>
              <div className="flex flex-wrap gap-1.5">
                {project.stack.map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.45 + i * 0.03,
                      ease: 'easeOut',
                    }}
                    className="border-line bg-bg/40 text-inkdim rounded border px-2 py-1 font-mono text-[11px]"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </CSBlock>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
