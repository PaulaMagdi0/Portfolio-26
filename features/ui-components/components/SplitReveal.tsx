'use client';

import { useEffect, useRef } from 'react';
import type { ElementType, ReactNode } from 'react';
import { loadGsap, onIdle, type SplitText as SplitTextType } from '@/core/motion';

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

type SplitInstance = InstanceType<SplitTextType>;

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

    // Arabic / RTL: SplitText breaks letter joining (each char becomes its own span,
    // disabling shaping). Skip the per-char animation and just reveal the element.
    const htmlLang = document.documentElement.lang;
    const isRTL = document.documentElement.dir === 'rtl' || htmlLang === 'ar';
    if (isRTL) {
      el.style.opacity = '1';
      return;
    }

    let cancelled = false;
    let split: SplitInstance | null = null;
    let tween: ReturnType<Awaited<ReturnType<typeof loadGsap>>['gsap']['to']> | null = null;
    let observer: IntersectionObserver | null = null;
    let safety: number | null = null;
    let cancelIdle: (() => void) | null = null;

    const forceVisible = () => {
      el.style.opacity = '1';
      el.querySelectorAll<HTMLElement>('.split-char, .split-word').forEach((node) => {
        node.style.transform = 'none';
        node.style.opacity = '1';
      });
    };

    // The headline is already SSR'd and visible. Load GSAP + SplitText off the
    // critical path (idle for instant mode, observer for scroll mode), then run
    // the split + cascade. If anything stalls, the static text just stays put.
    void loadGsap().then(({ gsap, SplitText }) => {
      if (cancelled || !ref.current) return;

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
          // Safety only matters for instant mode — if something stalls before
          // play() commits, reveal the text after 1.5s so it's never stuck hidden.
          safety = window.setTimeout(setVisibleFallback, 1500);
        } else {
          // Scroll mode: the observer is the trigger. No safety timer — otherwise
          // a section below the fold would have its chars force-revealed at 1.5s,
          // and when the user scrolls down later the GSAP tween animates 0→0
          // (no visible cascade).
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
      };

      const start = () => {
        if (cancelled) return;
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            if (!cancelled) run();
          });
        } else {
          run();
        }
      };

      // Instant mode (the hero headline) defers the actual split to an idle
      // slot so the static SSR'd text paints first, keeping the split work off
      // the LCP path. Scroll mode can start setting up its observer right away.
      if (mode === 'instant') {
        cancelIdle = onIdle(start);
      } else {
        start();
      }
    });

    return () => {
      cancelled = true;
      cancelIdle?.();
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
