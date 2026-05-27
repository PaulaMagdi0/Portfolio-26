'use client';

import { motion, type Variants, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type SupportedTag = 'div' | 'li' | 'section' | 'article' | 'span';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: SupportedTag;
}

const variants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const motionAnimation = (y: number, delay: number): HTMLMotionProps<'div'> => ({
  initial: { ...variants.hidden, y },
  whileInView: { ...variants.visible, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] },
});

export function Reveal({ children, delay = 0, y = 24, className = '', as = 'div' }: RevealProps) {
  const anim = motionAnimation(y, delay);
  if (as === 'li') {
    return (
      <motion.li {...(anim as HTMLMotionProps<'li'>)} className={className}>
        {children}
      </motion.li>
    );
  }
  if (as === 'section') {
    return (
      <motion.section {...(anim as HTMLMotionProps<'section'>)} className={className}>
        {children}
      </motion.section>
    );
  }
  if (as === 'article') {
    return (
      <motion.article {...(anim as HTMLMotionProps<'article'>)} className={className}>
        {children}
      </motion.article>
    );
  }
  if (as === 'span') {
    return (
      <motion.span {...(anim as HTMLMotionProps<'span'>)} className={className}>
        {children}
      </motion.span>
    );
  }
  return (
    <motion.div {...anim} className={className}>
      {children}
    </motion.div>
  );
}
