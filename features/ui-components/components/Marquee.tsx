'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { gsap } from '@/core/motion';

interface MarqueeProps {
  children: ReactNode;
  /** Pixels per second */
  speed?: number;
  pauseOnHover?: boolean;
  draggable?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function Marquee({
  children,
  speed = 50,
  pauseOnHover = true,
  draggable = true,
  className = '',
  ariaLabel,
}: MarqueeProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    const track = trackRef.current;
    if (!wrap || !inner || !track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const trackWidth = track.offsetWidth;
    if (trackWidth === 0) return;

    const duration = trackWidth / speed;
    const tween = gsap.to(inner, {
      x: -trackWidth,
      duration,
      ease: 'none',
      repeat: -1,
    });

    const onEnter = () => tween.timeScale(0.25);
    const onLeave = () => tween.timeScale(1);
    if (pauseOnHover) {
      wrap.addEventListener('mouseenter', onEnter);
      wrap.addEventListener('mouseleave', onLeave);
    }

    let dragging = false;
    let startX = 0;
    let startProg = 0;
    const onDown = (e: MouseEvent | TouchEvent) => {
      dragging = true;
      startX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
      startProg = tween.progress();
      tween.pause();
      wrap.style.cursor = 'grabbing';
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;
      const x = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
      const delta = (x - startX) / trackWidth;
      let p = startProg - delta;
      p = ((p % 1) + 1) % 1;
      tween.progress(p);
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      wrap.style.cursor = '';
      tween.play();
    };
    if (draggable) {
      wrap.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      wrap.addEventListener('touchstart', onDown, { passive: true });
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('touchend', onUp);
    }

    return () => {
      tween.kill();
      if (pauseOnHover) {
        wrap.removeEventListener('mouseenter', onEnter);
        wrap.removeEventListener('mouseleave', onLeave);
      }
      if (draggable) {
        wrap.removeEventListener('mousedown', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        wrap.removeEventListener('touchstart', onDown);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onUp);
      }
    };
  }, [draggable, pauseOnHover, speed]);

  return (
    <div
      ref={wrapRef}
      aria-label={ariaLabel}
      className={`overflow-hidden select-none ${className}`}
      style={{ cursor: draggable ? 'grab' : 'default' }}
    >
      <div
        ref={innerRef}
        className="flex"
        style={{ width: 'max-content', willChange: 'transform' }}
      >
        <div ref={trackRef} className="flex shrink-0">
          {children}
        </div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
