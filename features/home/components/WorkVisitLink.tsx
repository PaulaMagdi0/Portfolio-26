'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface WorkVisitLinkProps {
  href: string;
  className?: string;
}

/**
 * "Visit site" link for live products, used on the card and in the drawer. Opens
 * in a new tab; the new-tab hint is appended visually hidden so the accessible
 * name reads "Visit site (opens in new tab)" without cluttering the row.
 */
export function WorkVisitLink({ href, className }: WorkVisitLinkProps) {
  const t = useTranslations();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-label={t('ui.cursor.visit')}
      className={cn(
        'text-amber hover:text-ink focus-visible:ring-amber/60 inline-flex items-center gap-1 rounded-sm font-mono tracking-[0.08em] uppercase transition-colors focus-visible:ring-1 focus-visible:outline-none',
        className,
      )}
    >
      {t('home.work.visit')}
      <svg
        className="h-3 w-3 rtl:-scale-x-100"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M7 17 17 7M7 7h10v10" />
      </svg>
      <span className="sr-only">{t('ui.a11y.opensInNewTab')}</span>
    </a>
  );
}
