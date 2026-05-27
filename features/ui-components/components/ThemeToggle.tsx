'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/core/theme';
import { useTranslations } from 'next-intl';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations('ui.theme');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!mounted) return <div className="theme-toggle" aria-hidden />;

  const isLight = resolvedTheme === 'light';
  return (
    <button
      type="button"
      aria-label={t(isLight ? 'switchToDark' : 'switchToLight')}
      className="theme-toggle"
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
    >
      <span className="knob" />
    </button>
  );
}
