'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useTheme } from '@/core/theme';
import { useTranslations } from 'next-intl';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations('ui.theme');
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!mounted) return <div className="theme-toggle" aria-hidden />;

  const isLight = resolvedTheme === 'light';

  const onClick = () => {
    const next = isLight ? 'dark' : 'light';
    const btn = buttonRef.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !btn || typeof document === 'undefined') {
      setTheme(next);
      return;
    }

    const root = document.documentElement;
    const oldBg = getComputedStyle(root).getPropertyValue('--color-bg').trim() || '10 10 10';

    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxR = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));

    const overlay = document.createElement('div');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 100;
      background: rgb(${oldBg});
      clip-path: circle(${maxR}px at ${cx}px ${cy}px);
      pointer-events: none;
      will-change: clip-path, opacity;
    `;
    document.body.appendChild(overlay);

    setTheme(next);

    gsap.to(overlay, {
      clipPath: `circle(0px at ${cx}px ${cy}px)`,
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.out',
          onComplete: () => overlay.remove(),
        });
      },
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={t(isLight ? 'switchToDark' : 'switchToLight')}
      className="theme-toggle"
      onClick={onClick}
    >
      <span className="knob" />
    </button>
  );
}
