'use client';

import { useEffect, useState } from 'react';
import { Hero3DCanvas } from './Hero3DCanvas';

export function Hero3D() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => {
      setEnabled(finePointer && !reduced);
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0">
      {enabled ? (
        <Hero3DCanvas />
      ) : (
        <svg viewBox="0 0 200 200" className="h-full w-full opacity-25" aria-hidden>
          <g fill="none" stroke="currentColor" strokeWidth="0.5">
            <polygon points="100,30 165,70 165,130 100,170 35,130 35,70" />
            <polygon points="100,55 142,80 142,120 100,145 58,120 58,80" />
            <circle cx="100" cy="100" r="3" fill="currentColor" />
          </g>
        </svg>
      )}
    </div>
  );
}
