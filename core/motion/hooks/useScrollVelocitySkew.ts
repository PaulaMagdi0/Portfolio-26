'use client';

import { useEffect } from 'react';
import { loadGsap, onIdle } from '../utils/gsap';

/**
 * Drives subtle scroll-velocity skewY on every `[data-skew]` element.
 * Decays toward zero when idle, capped at MAX_SKEW degrees.
 */
export function useScrollVelocitySkew(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    // Defer GSAP off the hydration path — the skew effect is decorative and can
    // upgrade in on the next idle slot without affecting LCP/TBT.
    const cancelIdle = onIdle(() => {
      void loadGsap().then(({ gsap }) => {
        if (cancelled) return;

        let lastY = window.scrollY;
        let lastT = performance.now();
        let skew = 0;
        const MAX_SKEW = 2.5;

        const tick = () => {
          const y = window.scrollY;
          const t = performance.now();
          const dt = t - lastT;
          const dy = y - lastY;
          let target = 0;
          if (dt > 0) target = (dy / dt) * 0.6;
          target = Math.max(-MAX_SKEW, Math.min(MAX_SKEW, target));
          skew += (target - skew) * 0.18;
          if (Math.abs(dy) < 0.3) skew *= 0.85;
          const els = document.querySelectorAll<HTMLElement>('[data-skew]');
          const value = `skewY(${skew.toFixed(3)}deg)`;
          for (let i = 0; i < els.length; i++) {
            els[i]!.style.transform = value;
          }
          lastY = y;
          lastT = t;
        };

        gsap.ticker.add(tick);
        cleanup = () => gsap.ticker.remove(tick);
      });
    });

    return () => {
      cancelled = true;
      cancelIdle();
      cleanup?.();
    };
  }, [enabled]);
}
