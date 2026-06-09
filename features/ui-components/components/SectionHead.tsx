'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { loadGsap, type Gsap } from '@/core/motion';
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

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    // Defer GSAP + ScrollTrigger off First Load; the rule animation is purely
    // decorative and below the hero, so loading it lazily costs nothing visually.
    void loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !ruleRef.current) return;

      const hasScrollTrigger =
        typeof ScrollTrigger?.getAll === 'function' &&
        typeof (ScrollTrigger as { create?: unknown }).create === 'function';

      let tl: ReturnType<Gsap['timeline']> | null = null;
      try {
        gsap.set(el, { scaleX: 0, transformOrigin: '0% 50%' });
        // Use a timeline (not a bare tween) so a scrollTrigger-attached animation
        // defers its first refresh to the next tick. A tween refreshes synchronously
        // inside ScrollTrigger.create before the scroller cache is ready, which throws
        // "Cannot read properties of undefined (reading 'end')" — matches ClipReveal.
        tl = gsap.timeline(
          hasScrollTrigger ? { scrollTrigger: { trigger: el, start: 'top 88%', once: true } } : {},
        );
        tl.to(el, { scaleX: 1, duration: 1.1, ease: 'power3.out' });
      } catch (err) {
        console.warn('[SectionHead] animation failed, falling back to instant reveal', err);
        el.style.transform = 'scaleX(1)';
      }

      cleanup = () => {
        tl?.kill();
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
    });

    return () => {
      cancelled = true;
      cleanup?.();
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
