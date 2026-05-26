'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/features/localization';
import { cn } from '@/lib/utils';
import { LiveClock } from './LiveClock';
import { ThemeToggle } from './ThemeToggle';

const SECTIONS = [
  { id: 'work', key: 'work' },
  { id: 'experience', key: 'experience' },
  { id: 'certifications', key: 'certifications' },
  { id: 'stack', key: 'stack' },
  { id: 'contact', key: 'contact' },
] as const;

export function TopNav() {
  const t = useTranslations('ui.nav');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed inset-x-0 top-0 z-[60] px-6 py-4 transition-colors md:px-10',
        scrolled && 'border-b border-line bg-bg/60 backdrop-blur-md',
      )}
      aria-label={t('primary')}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6">
        <a href="#main" className="font-serif text-xl">
          Paula Magdy<span className="text-amber">.</span>
        </a>
        <ul className="hidden items-center gap-7 text-sm md:flex">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-inkdim hover:text-ink">
                {t(s.key)}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs text-inkmute md:inline">
            <LiveClock />
          </span>
          <LocaleSwitcher />
          <ThemeToggle />
          <button
            type="button"
            className="font-mono text-xs uppercase tracking-widest md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? t('closeMenu') : t('openMenu')}
          </button>
        </div>
      </div>
      {menuOpen ? (
        <ul id="mobile-menu" className="mt-4 grid gap-3 text-base md:hidden">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={() => setMenuOpen(false)} className="block py-2">
                {t(s.key)}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  );
}
