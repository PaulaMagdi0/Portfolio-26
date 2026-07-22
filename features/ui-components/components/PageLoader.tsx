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
          // The CSS clip-path curtain wipe runs 1.1s once `html.loaded` is set
          // (see globals.css #page-loader transition). Keep the element mounted
          // through the transition; unmounting React-side too early kills it.
          setTimeout(() => {
            if (!cancelled) setDone(true);
          }, 1200);
        }, 280);
      }
    };
    rafId = requestAnimationFrame(tick);

    const fontsPromise = document.fonts?.ready ?? Promise.resolve();
    Promise.all([fontsPromise, new Promise((r) => setTimeout(r, 900))]).then(() => {
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
