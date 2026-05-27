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
      className="border-line bg-bg2/60 text-inkdim inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-[0.05em] backdrop-blur-sm"
    >
      <span aria-hidden className="relative inline-flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      {t('label')}
    </motion.span>
  );
}
