'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface MaskRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function MaskReveal({ children, delay = 0, className = '' }: MaskRevealProps) {
  return (
    <span className={`mask-line ${className}`}>
      <motion.span
        initial={{ y: '110%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] }}
        className="mask-inner"
      >
        {children}
      </motion.span>
    </span>
  );
}
