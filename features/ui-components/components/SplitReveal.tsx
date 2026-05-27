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
  /**
   * 'scroll' (default) — play when the element scrolls into view.
   * 'instant' — play on mount; no IntersectionObserver wait.
   */
  mode?: 'scroll' | 'instant';
}

export function SplitReveal({
  children,
  as: Component = 'h2',
  className = '',
  stagger = 0.018,
  duration = 1.0,
  delay = 0,
  mode = 'scroll',
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

    const forceVisible = () => {
      el.style.opacity = '1';
      el.querySelectorAll<HTMLElement>('.split-char, .split-word').forEach((node) => {
        node.style.transform = 'none';
        node.style.opacity = '1';
      });
    };

    const setVisibleFallback = () => {
      if (split) {
        gsap.set(split.chars, { yPercent: 0, opacity: 1 });
      }
      forceVisible();
    };

    const play = () => {
      if (!split || cancelled) return;
      tween = gsap.to(split.chars, {
        yPercent: 0,
        duration,
        ease: 'power4.out',
        delay,
        stagger,
      });
    };

    const run = () => {
      if (cancelled || !ref.current) return;

      try {
        split = new SplitText(ref.current, {
          type: 'lines,words,chars',
          linesClass: 'split-line',
          wordsClass: 'split-word',
          charsClass: 'split-char',
        });
        gsap.set(split.chars, { yPercent: 110 });
      } catch {
        forceVisible();
        return;
      }

      if (mode === 'instant') {
        play();
      } else {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting) && split) {
              observer?.disconnect();
              play();
            }
          },
          { threshold: 0.15 },
        );
        observer.observe(el);
      }

      safety = window.setTimeout(setVisibleFallback, 1500);
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
  }, [delay, duration, stagger, mode]);

  return (
    <Component ref={ref as never} className={`split-host ${className}`}>
      {children}
    </Component>
  );
}
