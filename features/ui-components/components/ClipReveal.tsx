'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/core/motion';

interface ClipRevealProps {
  children: ReactNode;
  className?: string;
  /** Animation duration in seconds */
  duration?: number;
}

export function ClipReveal({ children, className = '', duration = 1.1 }: ClipRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const inner = el.firstElementChild;
    if (!inner) return;

    registerGsapPlugins();

    gsap.set(el, { clipPath: 'inset(0 0 100% 0)' });
    gsap.set(inner, { scale: 1.1, transformOrigin: 'center center' });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
    tl.to(el, { clipPath: 'inset(0 0 0% 0)', duration, ease: 'power3.out' }, 0);
    tl.to(inner, { scale: 1, duration: duration * 1.1, ease: 'power3.out' }, 0);

    return () => {
      tl.kill();
      ScrollTrigger.getAll()
        .filter((st) => st.trigger === el)
        .forEach((st) => st.kill());
    };
  }, [duration]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
