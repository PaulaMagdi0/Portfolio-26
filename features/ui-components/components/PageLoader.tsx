'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

export function PageLoader() {
  const t = useTranslations('ui.loader');
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
        counterRef.current.textContent = String(Math.floor(pct)).padStart(2, '0');
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
          setDone(true);
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
  }, [t]);

  if (done) return null;

  return (
    <div id="page-loader" aria-hidden>
      <div className="pl-top">
        <span className="pl-name">
          Paula Magdy<span className="pl-dot">.</span>
        </span>
        <span ref={statusRef} className="pl-status">
          {t('initializing')}
        </span>
      </div>
      <div className="pl-center">
        <div className="pl-counter-wrap">
          <span ref={counterRef} className="pl-counter">
            00
          </span>
          <span className="pl-percent">%</span>
        </div>
      </div>
      <div className="pl-bottom">
        <span className="pl-meta">
          <span className="pl-pulse" />
          Portfolio · 2026
        </span>
        <span className="pl-progress">
          <span ref={fillRef} className="pl-progress-fill" />
        </span>
        <span className="pl-meta pl-locale">Cairo · EG</span>
      </div>
    </div>
  );
}
