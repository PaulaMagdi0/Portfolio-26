'use client';

import { useTranslations } from 'next-intl';

export function AvailabilityPill() {
  const t = useTranslations('ui.availability');
  return (
    <span className="border-line bg-bg2 text-inkdim inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] uppercase">
      <span className="bg-amber inline-block h-1.5 w-1.5 animate-pulse rounded-full" />
      {t('label')}
    </span>
  );
}
