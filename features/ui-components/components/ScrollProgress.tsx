'use client';

import { useEffect, useRef } from 'react';

export function ScrollProgress() {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? window.scrollY / max : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${pct})`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div aria-hidden className="bg-line fixed top-0 right-0 left-0 z-[70] h-px">
      <div
        ref={fillRef}
        className="bg-amber h-full origin-left"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
