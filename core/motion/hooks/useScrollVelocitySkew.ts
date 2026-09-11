'use client';

import { useEffect } from 'react';
import { loadGsap } from '../utils/gsap';

/**
 * Drives subtle scroll-velocity skewY on every `[data-skew]` element.
 * Decays toward zero when idle, capped at MAX_SKEW degrees.
 */
export function useScrollVelocitySkew(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let cancelled = false;
    let started = false;
    let cleanup: (() => void) | null = null;

    // GSAP (and this ticker) load only after the first real scroll: the effect is
    // decorative and invisible until the page moves, so nothing about it belongs
    // on the load-time main thread.
    const start = () => {
      if (started || cancelled) return;
      started = true;
      window.removeEventListener('scroll', start);

      void loadGsap().then(({ gsap }) => {
        if (cancelled) return;

        let lastY = window.scrollY;
        let lastT = performance.now();
        let lastValue = '';
        let skew = 0;
        const MAX_SKEW = 2.5;
        // The targets are static cards; querying the DOM on every frame was the
        // most expensive line of the old loop.
        const els = Array.from(document.querySelectorAll<HTMLElement>('[data-skew]'));

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
          lastY = y;
          lastT = t;
          // At rest, write `none` once and then stop touching the DOM.
          const value = Math.abs(skew) < 0.005 ? 'none' : `skewY(${skew.toFixed(3)}deg)`;
          if (value === lastValue) return;
          lastValue = value;
          for (let i = 0; i < els.length; i++) {
            els[i]!.style.transform = value;
          }
        };

        gsap.ticker.add(tick);
        cleanup = () => gsap.ticker.remove(tick);
      });
    };

    window.addEventListener('scroll', start, { passive: true });

    return () => {
      cancelled = true;
      window.removeEventListener('scroll', start);
      cleanup?.();
    };
  }, [enabled]);
}
