'use client';

import { useEffect, useRef } from 'react';
import { gsap, SplitText, ScrollTrigger, registerGsapPlugins } from '@/core/motion';
import type { ElementType, ReactNode } from 'react';

interface SplitRevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  stagger?: number;
  duration?: number;
}

export function SplitReveal({
  children,
  as: Component = 'h2',
  className = '',
  stagger = 0.018,
  duration = 0.95,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGsapPlugins();
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const split = new SplitText(el, { type: 'lines,chars', linesClass: 'split-line' });
    const tween = gsap.from(split.chars, {
      yPercent: 110,
      duration,
      ease: 'power3.out',
      stagger,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });

    return () => {
      tween.kill();
      split.revert();
      ScrollTrigger.getAll()
        .filter((t) => t.trigger === el)
        .forEach((t) => t.kill());
    };
  }, [duration, stagger]);

  return (
    <Component ref={ref as never} className={`split-host ${className}`}>
      {children}
    </Component>
  );
}
