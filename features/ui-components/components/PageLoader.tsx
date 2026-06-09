'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toLocaleDigits } from '@/lib/digits';

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

    // The inline LoaderRevealScript may have already lifted the curtain off the
    // hydration path (the common case on slow connections). If so, the counter
    // animation has nothing left to reveal — just unmount after the CSS wipe.
    if (document.documentElement.classList.contains('loaded')) {
      const id = window.setTimeout(() => setDone(true), 700);
      return () => {
        cancelled = true;
        window.clearTimeout(id);
      };
    }

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
        }, 120);
      }
    };
    apply();

    const tick = () => {
      if (cancelled) return;
      // Climb fast to 100 once fonts are ready; hold near the top otherwise so
      // the brand counter still reads as "loading" without an artificial floor.
      const target = fontsReady ? 100 : 90;
      const step = (target - pct) * 0.16 + 1.2;
      pct = Math.min(target, pct + step);
      apply();
      if (pct < 100) {
        rafId = requestAnimationFrame(tick);
      } else {
        // Fire the curtain wipe immediately — getting `html.loaded` set as soon
        // as the counter completes is the biggest LCP win, since the opaque
        // #page-loader occludes the hero headline until the wipe starts.
        document.documentElement.classList.add('loaded');
        // Keep the element mounted through the (now-faster) CSS clip-path
        // transition; unmounting React-side too early kills the wipe.
        setTimeout(() => {
          if (!cancelled) setDone(true);
        }, 700);
      }
    };
    rafId = requestAnimationFrame(tick);

    // Lift the curtain as soon as the headline can paint, NOT when the serif
    // webfont finishes downloading. The hero <h1> is SSR'd and rendered with
    // `display: swap`, so it paints immediately in the fallback face and is the
    // LCP candidate well before the serif arrives. Waiting on the full
    // `document.fonts.ready` keeps the opaque loader over that already-painted
    // headline on slow connections (measured ~3s under throttled 4G), which is
    // exactly what inflates LCP. Cap the wait so the brand moment still shows
    // briefly but never blocks the LCP paint.
    const FONT_WAIT_CAP_MS = 700;
    const fontsPromise = document.fonts?.ready ?? Promise.resolve();
    Promise.race([fontsPromise, new Promise((r) => setTimeout(r, FONT_WAIT_CAP_MS))]).then(() => {
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
