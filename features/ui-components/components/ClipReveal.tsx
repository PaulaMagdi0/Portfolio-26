'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { gsap } from '@/core/motion';

interface ClipRevealProps {
  children: ReactNode;
  className?: string;
  /** Animation duration in seconds */
  duration?: number;
}

/**
 * Subtle scroll-driven reveal: scales the child from 1.1 → 1 when the element
 * enters the viewport. The child is always visible — even before the trigger
 * fires — so no risk of permanently-hidden content if observer never fires.
 */
export function ClipReveal({ children, className = '', duration = 1.1 }: ClipRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const inner = el.firstElementChild;
    if (!inner) return;

    gsap.set(inner, { scale: 1.1, transformOrigin: 'center center' });

    let played = false;
    let tween: gsap.core.Tween | null = null;

    const play = () => {
      if (played) return;
      played = true;
      tween = gsap.to(inner, { scale: 1, duration, ease: 'power3.out' });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          play();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);

    const safety = window.setTimeout(play, 1500);

    return () => {
      observer.disconnect();
      window.clearTimeout(safety);
      tween?.kill();
    };
  }, [duration]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
