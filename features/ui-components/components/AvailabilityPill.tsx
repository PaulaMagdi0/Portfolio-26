'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface AvailabilityPillProps {
  delaySeconds?: number;
}

export function AvailabilityPill({ delaySeconds = 0.2 }: AvailabilityPillProps) {
  const t = useTranslations('ui.availability');
  return (
    <motion.span
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: delaySeconds, ease: [0.2, 0.7, 0.2, 1] }}
      className="border-line bg-bg2 text-inkdim inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] uppercase"
    >
      <span className="bg-amber inline-block h-1.5 w-1.5 animate-pulse rounded-full" />
      {t('label')}
    </motion.span>
  );
}
