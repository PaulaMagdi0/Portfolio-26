'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

export function LocaleSwitcher() {
  const current = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('locale');

  return (
    <div className="locale-toggle" role="group" aria-label={t('groupLabel')}>
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          aria-pressed={locale === current}
          disabled={locale === current}
          className={cn('locale-pill', locale === current && 'is-active')}
          onClick={() => router.replace(pathname, { locale })}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
