'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/core/motion';
import { toLocaleDigits } from '@/lib/digits';

interface SectionHeadProps {
  num: string;
  label: string;
  kicker?: ReactNode;
  children?: ReactNode;
}

export function SectionHead({ num, label, kicker, children }: SectionHeadProps) {
  const ruleRef = useRef<HTMLSpanElement | null>(null);
  const locale = useLocale();

  useEffect(() => {
    const el = ruleRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.transform = 'scaleX(1)';
      return;
    }

    registerGsapPlugins();

    const hasScrollTrigger =
      typeof ScrollTrigger?.getAll === 'function' &&
      typeof (ScrollTrigger as { create?: unknown }).create === 'function';

    let tween: gsap.core.Tween | null = null;
    try {
      gsap.set(el, { scaleX: 0, transformOrigin: '0% 50%' });
      tween = gsap.to(el, {
        scaleX: 1,
        duration: 1.1,
        ease: 'power3.out',
        ...(hasScrollTrigger
          ? { scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
          : {}),
      });
    } catch (err) {
      console.warn('[SectionHead] animation failed, falling back to instant reveal', err);
      el.style.transform = 'scaleX(1)';
    }

    return () => {
      tween?.kill();
      if (hasScrollTrigger) {
        try {
          ScrollTrigger.getAll()
            .filter((st) => st.trigger === el)
            .forEach((st) => st.kill());
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return (
    <header className="mb-10 md:mb-16">
      <div className="flex items-baseline gap-6">
        <div className="flex shrink-0 items-baseline gap-4">
          <span className="text-amber font-mono text-[11px] tracking-[0.2em] uppercase">
            {toLocaleDigits(num, locale)}
          </span>
          <span className="section-num">— {label}</span>
        </div>
        <span ref={ruleRef} className="h-rule flex-1 -translate-y-[2px]" />
      </div>
      {kicker ? <div className="mt-2">{kicker}</div> : null}
      {children}
    </header>
  );
}
