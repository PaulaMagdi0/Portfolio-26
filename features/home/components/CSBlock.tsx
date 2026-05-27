'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CSBlockProps {
  label: string;
  children: ReactNode;
  last?: boolean;
  delay?: number;
}

export function CSBlock({ label, children, last = false, delay = 0 }: CSBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={last ? '' : 'mb-8 md:mb-10'}
    >
      <span className="text-amber mb-3 block font-mono text-[10px] tracking-[0.18em] uppercase">
        {label}
      </span>
      {children}
    </motion.div>
  );
}
