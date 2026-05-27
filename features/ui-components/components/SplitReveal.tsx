'use client';

import { useEffect, useRef } from 'react';
import type { ElementType, ReactNode } from 'react';
import { gsap, SplitText, registerGsapPlugins } from '@/core/motion';

interface SplitRevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Per-char stagger in seconds */
  stagger?: number;
  /** Per-char duration in seconds */
  duration?: number;
  /** Initial delay before the cascade starts (seconds) */
  delay?: number;
}

export function SplitReveal({
  children,
  as: Component = 'h2',
  className = '',
  stagger = 0.018,
  duration = 1.0,
  delay = 0,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = '1';
      return;
    }

    registerGsapPlugins();

    let cancelled = false;
    let split: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;
    let observer: IntersectionObserver | null = null;
    let safety: number | null = null;

    const setVisibleFallback = () => {
      if (split) {
        gsap.set(split.chars, { yPercent: 0 });
      } else {
        el.style.opacity = '1';
      }
    };

    const run = () => {
      if (cancelled || !ref.current) return;

      split = new SplitText(ref.current, {
        type: 'lines,words,chars',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
      });

      gsap.set(split.chars, { yPercent: 110 });

      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting) && split) {
            observer?.disconnect();
            tween = gsap.to(split.chars, {
              yPercent: 0,
              duration,
              ease: 'power4.out',
              delay,
              stagger,
            });
          }
        },
        { threshold: 0.15 },
      );
      observer.observe(el);

      safety = window.setTimeout(setVisibleFallback, 1800);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) run();
      });
    } else {
      run();
    }

    return () => {
      cancelled = true;
      if (safety !== null) window.clearTimeout(safety);
      observer?.disconnect();
      tween?.kill();
      split?.revert();
    };
  }, [delay, duration, stagger]);

  return (
    <Component ref={ref as never} className={`split-host ${className}`}>
      {children}
    </Component>
  );
}
