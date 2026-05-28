'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/features/localization';
import { cn } from '@/lib/utils';
import { LiveClock } from './LiveClock';
import { ThemeToggle } from './ThemeToggle';

const SECTIONS = ['work', 'experience', 'certifications', 'stack', 'contact'] as const;
type SectionId = (typeof SECTIONS)[number];

export function TopNav() {
  const t = useTranslations('ui.nav');
  const tBrand = useTranslations('ui.brand');
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<SectionId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const band = window.innerHeight * 0.42;
      let next: SectionId | null = null;
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= band && rect.bottom >= band) {
          next = id;
          break;
        }
      }
      setActive(next);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        aria-label={t('primary')}
        className={cn(
          'fixed inset-x-0 top-0 z-[60] transition-[background-color,border-color,backdrop-filter] duration-500',
          scrolled ? 'border-line bg-bg/70 border-b backdrop-blur-md' : 'border-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 md:px-10">
          <a href="#top" className="flex items-baseline gap-3">
            <span className="text-ink font-serif text-[20px]">{tBrand('name')}</span>
            <span className="text-inkmute hidden font-mono text-[12px] md:inline">
              — {t('cairo')}
            </span>
          </a>

          <ul className="hidden items-center gap-7 md:flex">
            {SECTIONS.map((id, i) => {
              const isActive = active === id;
              return (
                <li key={id} className="relative">
                  <a
                    href={`#${id}`}
                    className={cn(
                      'group flex items-baseline gap-1.5 text-[13px] transition-colors',
                      isActive ? 'text-ink' : 'text-inkdim hover:text-ink',
                    )}
                  >
                    <span
                      className={cn(
                        'font-mono text-[10px]',
                        isActive ? 'text-amber' : 'text-inkmute',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{t(id)}</span>
                  </a>
                  <span
                    aria-hidden
                    className={cn(
                      'bg-amber absolute right-0 -bottom-1 left-0 h-px origin-left transition-transform duration-500 ease-out',
                      isActive ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">
              <LiveClock />
            </span>
            <LocaleSwitcher />
            <ThemeToggle />
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={t('openMenu')}
              onClick={() => setMenuOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition-colors md:hidden"
            >
              <span
                aria-hidden
                className="bg-ink absolute h-0.5 w-5 -translate-y-1.5 rounded-full"
              />
              <span
                aria-hidden
                className="bg-ink absolute h-0.5 w-5 translate-y-1.5 rounded-full"
              />
            </button>
          </div>
        </div>
      </nav>

      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        className={cn(
          'bg-bg fixed inset-0 z-[300] transition-opacity duration-300 md:hidden',
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMenuOpen(false);
        }}
      >
        <button
          type="button"
          aria-label={t('closeMenu')}
          onClick={() => setMenuOpen(false)}
          className="border-line bg-bg/80 absolute top-3 right-4 z-[1] flex h-10 w-10 items-center justify-center rounded-full border"
        >
          <span aria-hidden className="bg-ink absolute h-0.5 w-5 rotate-45 rounded-full" />
          <span aria-hidden className="bg-ink absolute h-0.5 w-5 -rotate-45 rounded-full" />
        </button>
        <div className="flex h-full flex-col justify-between px-6 pt-24 pb-10">
          <ul className="space-y-0">
            {SECTIONS.map((id, i) => (
              <li key={id} className="border-line border-b">
                <a
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'group flex items-baseline gap-4 py-6',
                    active === id ? 'text-amber' : 'text-inkdim hover:text-ink',
                  )}
                >
                  <span
                    className={cn(
                      'font-mono text-[11px]',
                      active === id ? 'text-amber' : 'text-inkmute',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-serif text-[40px] leading-none">{t(id)}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="text-inkmute flex items-center gap-3 font-mono text-[12px]">
            <span aria-hidden className="relative inline-flex h-2 w-2">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <LiveClock />
            <span>· {t('cairo')}</span>
          </div>
        </div>
      </div>
    </>
  );
}
