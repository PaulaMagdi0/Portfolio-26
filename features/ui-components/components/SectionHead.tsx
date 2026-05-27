'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/core/motion';

interface SectionHeadProps {
  num: string;
  label: string;
  kicker?: ReactNode;
  children?: ReactNode;
}

export function SectionHead({ num, label, kicker, children }: SectionHeadProps) {
  const ruleRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ruleRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.transform = 'scaleX(1)';
      return;
    }

    registerGsapPlugins();

    gsap.set(el, { scaleX: 0, transformOrigin: '0% 50%' });
    const tween = gsap.to(el, {
      scaleX: 1,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll()
        .filter((st) => st.trigger === el)
        .forEach((st) => st.kill());
    };
  }, []);

  return (
    <header className="mb-10 md:mb-16">
      <div className="flex items-baseline gap-6">
        <div className="flex shrink-0 items-baseline gap-4">
          <span className="text-amber font-mono text-[11px] tracking-[0.2em] uppercase">{num}</span>
          <span className="section-num">— {label}</span>
        </div>
        <span ref={ruleRef} className="h-rule flex-1 -translate-y-[2px]" />
      </div>
      {kicker ? <div className="mt-2">{kicker}</div> : null}
      {children}
    </header>
  );
}
