'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface HeroHeadlineProps {
  children: ReactNode;
}

/**
 * Wraps the hero headline with a scroll-driven parallax: slides up to 80px
 * and fades to 0.35 opacity by 600px of scroll. Disabled under
 * prefers-reduced-motion.
 */
export function HeroHeadline({ children }: HeroHeadlineProps) {
  const ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let pending = false;

    const update = () => {
      pending = false;
      const scroll = window.scrollY;
      const y = Math.min(80, scroll * 0.13);
      const opacity = Math.max(0.35, 1 - scroll / 600);
      el.style.transform = `translate3d(0, ${y}px, 0)`;
      el.style.opacity = `${opacity}`;
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <h1
      ref={ref}
      className="font-serif text-[clamp(56px,9vw,160px)] leading-[0.95] tracking-[-0.02em]"
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </h1>
  );
}
