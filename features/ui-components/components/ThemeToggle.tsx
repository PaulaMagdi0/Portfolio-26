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

    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxR = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));

    const root = document.documentElement;
    const prevAttr = root.getAttribute('data-theme') ?? (isLight ? 'light' : 'dark');
    root.setAttribute('data-theme', next);
    // --color-bg in @theme is a full `rgb(r g b)` string (Tailwind v4), not a
    // raw triplet. Use it as-is — wrapping in another rgb(...) yields invalid
    // CSS and the overlay paints transparent (the bug: circle expands but is
    // invisible, so the page just snaps to the new theme with no animation).
    const nextBg = getComputedStyle(root).getPropertyValue('--color-bg').trim() || 'rgb(10 10 10)';
    root.setAttribute('data-theme', prevAttr);

    const overlay = document.createElement('div');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 100;
      background: ${nextBg};
      clip-path: circle(0px at ${cx}px ${cy}px);
      pointer-events: none;
      will-change: clip-path, opacity;
    `;
    document.body.appendChild(overlay);

    gsap.to(overlay, {
      clipPath: `circle(${maxR}px at ${cx}px ${cy}px)`,
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete: () => {
        setTheme(next);
        requestAnimationFrame(() => {
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.35,
            ease: 'power2.out',
            onComplete: () => overlay.remove(),
          });
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
      <span className="knob">
        {isLight ? (
          <svg
            className="ico"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          <svg className="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </span>
    </button>
  );
}
