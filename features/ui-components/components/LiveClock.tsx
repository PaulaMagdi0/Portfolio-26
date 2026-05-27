'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

function formatCairoTime(locale: string): string {
  const intlLocale = locale === 'ar' ? 'ar-EG-u-nu-arab' : 'en-GB';
  return new Intl.DateTimeFormat(intlLocale, {
    timeZone: 'Africa/Cairo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
}

export function LiveClock() {
  const locale = useLocale();
  const t = useTranslations('ui.clock');
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => setTime(formatCairoTime(locale));
    const id = setInterval(update, 1000);
    const raf = requestAnimationFrame(update);
    return () => {
      clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, [locale]);

  return (
    <span
      suppressHydrationWarning
      className="text-inkdim font-mono text-[11px] tracking-[0.18em] tabular-nums"
    >
      {time} {t('locationCode')}
    </span>
  );
}
