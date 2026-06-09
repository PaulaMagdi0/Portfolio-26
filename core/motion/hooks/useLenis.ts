'use client';

import { useEffect } from 'react';
import type Lenis from 'lenis';
import { loadGsap, onIdle } from '../utils/gsap';

export function useLenis(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    // Defer the smooth-scroll engine off the hydration/LCP path: Lenis + GSAP
    // load via dynamic import on the next idle slot. Native scrolling works
    // immediately; smooth-scroll upgrades in once the bundle arrives.
    const cancelIdle = onIdle(() => {
      void Promise.all([import('lenis'), loadGsap()]).then(
        ([lenisMod, { gsap, ScrollTrigger }]) => {
          if (cancelled) return;
          const LenisCtor = lenisMod.default;

          document.documentElement.classList.add('lenis', 'lenis-smooth');

          const lenis: Lenis = new LenisCtor({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
          });

          // Drive Lenis from GSAP's ticker so smooth-scroll and ScrollTrigger
          // share the same frame — no drift between them.
          const onTick = (time: number) => lenis.raf(time * 1000);
          gsap.ticker.add(onTick);
          gsap.ticker.lagSmoothing(0);

          const onScroll = () => ScrollTrigger.update();
          lenis.on('scroll', onScroll);

          cleanup = () => {
            gsap.ticker.remove(onTick);
            lenis.off('scroll', onScroll);
            lenis.destroy();
            document.documentElement.classList.remove('lenis', 'lenis-smooth');
          };
        },
      );
    });

    return () => {
      cancelled = true;
      cancelIdle();
      cleanup?.();
    };
  }, [enabled]);
}
