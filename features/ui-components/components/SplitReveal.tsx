'use client';

import { useEffect, useRef, useState } from 'react';
import type { ElementType, ReactNode } from 'react';

interface SplitRevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /**
   * Kept for API compatibility with earlier char-stagger implementation; ignored.
   */
  stagger?: number;
  /**
   * Reveal animation duration in milliseconds. Defaults to 950ms.
   */
  duration?: number;
}

/**
 * Heading reveal that slides the whole element up and fades it in on viewport
 * entry. Falls back to the visible end state if the user prefers reduced motion.
 * Uses native CSS transitions — no GSAP — so it never gets stuck mid-animation
 * if scroll plumbing (Lenis, ScrollTrigger) isn't fully wired.
 */
export function SplitReveal({
  children,
  as: Component = 'h2',
  className = '',
  duration = 950,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const rafId = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(rafId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          setShown(true);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);

    // Fallback: if the observer never fires for any reason, reveal after 1.5s
    // so the heading never stays hidden indefinitely.
    const fallback = window.setTimeout(() => setShown(true), 1500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <Component
      ref={ref as never}
      className={`split-host ${className}`}
      style={{
        display: 'block',
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity ${duration}ms cubic-bezier(0.2, 0.7, 0.2, 1), transform ${duration}ms cubic-bezier(0.2, 0.7, 0.2, 1)`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </Component>
  );
}
