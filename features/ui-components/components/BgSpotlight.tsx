'use client';

import { useEffect } from 'react';

export function BgSpotlight() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let rafId = 0;
    let pending = false;
    let mx = 0;
    let my = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!pending) {
        pending = true;
        rafId = requestAnimationFrame(() => {
          document.documentElement.style.setProperty('--mx', `${mx}px`);
          document.documentElement.style.setProperty('--my', `${my}px`);
          pending = false;
        });
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return <div className="bg-spotlight" aria-hidden />;
}
