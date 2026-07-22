'use client';

import { motion, useInView, type HTMLMotionProps } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { whenPageReady } from '@/core/motion';

type SupportedTag = 'div' | 'li' | 'section' | 'article' | 'span';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: SupportedTag;
  /**
   * Skip the page-loader gate. For above-the-fold hero content that should
   * compose *during* the loader so it's fully present the instant the curtain
   * lifts, instead of building in afterwards.
   */
  immediate?: boolean;
}

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className = '',
  as = 'div',
  immediate = false,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [ready, setReady] = useState(immediate);

  // Wait for the page loader's curtain to lift before allowing the reveal —
  // otherwise the fade plays hidden behind the loader on reload (see
  // whenPageReady). Resolves instantly once the loader is gone, so below-the-fold
  // sections still reveal the moment they scroll into view. `immediate` opts out
  // (starts ready) for above-the-fold hero content.
  useEffect(() => {
    if (immediate) return;
    let mounted = true;
    void whenPageReady().then(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [immediate]);

  const show = ready && inView;

  const anim: HTMLMotionProps<'div'> = {
    initial: { opacity: 0, y },
    animate: show ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] },
  };

  if (as === 'li') {
    return (
      <motion.li ref={ref as never} {...(anim as HTMLMotionProps<'li'>)} className={className}>
        {children}
      </motion.li>
    );
  }
  if (as === 'section') {
    return (
      <motion.section
        ref={ref as never}
        {...(anim as HTMLMotionProps<'section'>)}
        className={className}
      >
        {children}
      </motion.section>
    );
  }
  if (as === 'article') {
    return (
      <motion.article
        ref={ref as never}
        {...(anim as HTMLMotionProps<'article'>)}
        className={className}
      >
        {children}
      </motion.article>
    );
  }
  if (as === 'span') {
    return (
      <motion.span ref={ref as never} {...(anim as HTMLMotionProps<'span'>)} className={className}>
        {children}
      </motion.span>
    );
  }
  return (
    <motion.div ref={ref as never} {...anim} className={className}>
      {children}
    </motion.div>
  );
}
