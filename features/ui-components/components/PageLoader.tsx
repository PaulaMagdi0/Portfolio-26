'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toLocaleDigits } from '@/lib/digits';

// Set once the curtain has finished; the inline theme script reads it on the next
// navigation in this session and pre-applies `html.loaded` so the loader never
// covers the hero again (see core/theme/utils/themeInitScript.ts).
const PL_SEEN_KEY = 'pl-seen';

export function PageLoader() {
  const t = useTranslations('ui.loader');
  const tBrand = useTranslations('ui.brand');
  const tNav = useTranslations('ui.nav');
  const locale = useLocale();
  const [done, setDone] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(PL_SEEN_KEY) === '1';
    } catch {
      /* sessionStorage unavailable */
    }
    if (seen) {
      // The inline theme script already applied `html.loaded`, so the curtain is
      // hidden by CSS; unmount it on the next frame.
      document.documentElement.classList.add('loaded');
      const raf = requestAnimationFrame(() => setDone(true));
      return () => cancelAnimationFrame(raf);
    }

    const stages = [
      t('initializing'),
      t('loadingAssets'),
      t('loadingFonts'),
      t('compositing'),
      t('almostReady'),
    ];

    let pct = 0;
    let stageIdx = 0;
    let rafId = 0;
    let fontsReady = false;
    let cancelled = false;

    const apply = () => {
      if (counterRef.current) {
        counterRef.current.textContent = toLocaleDigits(
          String(Math.floor(pct)).padStart(2, '0'),
          locale,
        );
      }
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${pct / 100})`;
      const newStage = Math.min(stages.length - 1, Math.floor(pct / 22));
      if (newStage !== stageIdx && statusRef.current) {
        stageIdx = newStage;
        statusRef.current.style.opacity = '0';
        setTimeout(() => {
          if (cancelled || !statusRef.current) return;
          statusRef.current.textContent = stages[newStage];
          statusRef.current.style.opacity = '1';
        }, 180);
      }
    };
    apply();

    const tick = () => {
      if (cancelled) return;
      const target = fontsReady ? 100 : 92;
      const step = (target - pct) * 0.06 + 0.3;
      pct = Math.min(target, pct + step);
      apply();
      if (pct < 100) {
        rafId = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          if (cancelled) return;
          document.documentElement.classList.add('loaded');
          try {
            sessionStorage.setItem(PL_SEEN_KEY, '1');
          } catch {
            /* sessionStorage unavailable */
          }
          // The CSS clip-path curtain wipe runs 0.8s once `html.loaded` is set
          // (see globals.css #page-loader transition). Keep the element mounted
          // through the transition; unmounting React-side too early kills it.
          setTimeout(() => {
            if (!cancelled) setDone(true);
          }, 900);
        }, 150);
      }
    };
    rafId = requestAnimationFrame(tick);

    // Wait for fonts so the reveal doesn't flash fallback glyphs, but cap the wait:
    // the curtain hides the hero (the LCP element) for as long as it is up, and the
    // Arabic locale ships ~200 KB of fonts that should not hold it hostage.
    const fontsPromise = Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((r) => setTimeout(r, 800)),
    ]);
    Promise.all([fontsPromise, new Promise((r) => setTimeout(r, 500))]).then(() => {
      fontsReady = true;
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [t, locale]);

  if (done) return null;

  return (
    <div id="page-loader" aria-hidden>
      <div className="pl-top">
        <span className="pl-name">
          {tBrand('name')}
          <span className="pl-dot">.</span>
        </span>
        <span ref={statusRef} className="pl-status">
          {t('initializing')}
        </span>
      </div>
      <div className="pl-center">
        <div className="pl-counter-wrap">
          <span ref={counterRef} className="pl-counter">
            {toLocaleDigits('00', locale)}
          </span>
          <span className="pl-percent">%</span>
        </div>
      </div>
      <div className="pl-bottom">
        <span className="pl-meta">
          <span className="pl-pulse" />
          {t('portfolio')}
        </span>
        <span className="pl-progress">
          <span ref={fillRef} className="pl-progress-fill" />
        </span>
        <span className="pl-meta pl-locale">{tNav('cairo')}</span>
      </div>
    </div>
  );
}
