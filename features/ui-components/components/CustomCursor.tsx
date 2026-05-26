'use client';

import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let rafId = 0;

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx}px, ${ry}px)`;
      if (dotRef.current) dotRef.current.style.transform = `translate(${mx}px, ${my}px)`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      const ring = ringRef.current;
      const target = e.target;
      if (!ring || !(target instanceof Element)) return;
      const interactive = target.closest('a, button, [data-magnetic]');
      ring.classList.toggle('hover', !!interactive);
      const labelHost = target.closest('[data-cursor-label]');
      const label = labelHost instanceof HTMLElement ? (labelHost.dataset.cursorLabel ?? '') : '';
      if (label) {
        ring.classList.add('labeled');
        ring.textContent = label;
      } else {
        ring.classList.remove('labeled');
        ring.textContent = '';
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  );
}
