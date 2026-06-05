'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/features/localization';
import { cn } from '@/lib/utils';
import { LiveClock } from './LiveClock';
import { ThemeToggle } from './ThemeToggle';

const SECTIONS = ['work', 'experience', 'certifications', 'stack', 'faq', 'contact'] as const;
type SectionId = (typeof SECTIONS)[number];

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function TopNav() {
  const t = useTranslations('ui.nav');
  const tBrand = useTranslations('ui.brand');
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<SectionId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  // Set when a close should return focus to the trigger (Escape / close button),
  // not when a nav-link tap closes the menu. Read after the close-render commits.
  const restoreFocusRef = useRef(false);

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
    if (!menuOpen) {
      // After a close-render commits, the background is no longer inert, so it is
      // now safe to return focus to the trigger (only when an explicit close
      // asked for it — Escape or the close button, not a nav-link tap).
      if (restoreFocusRef.current) {
        restoreFocusRef.current = false;
        triggerRef.current?.focus();
      }
      return;
    }

    document.body.style.overflow = 'hidden';

    // Modal containment: remove the rest of the page from the a11y tree and tab
    // order while the dialog is open. `aria-modal` alone is not honoured by every
    // screen reader (VoiceOver/NVDA browse mode), so inert the background siblings.
    const nav = navRef.current;
    const main = document.getElementById('main');
    if (nav) nav.inert = true;
    if (main) main.inert = true;

    const overlay = overlayRef.current;
    const focusables = (): HTMLElement[] =>
      overlay ? Array.from(overlay.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];

    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        restoreFocusRef.current = true; // restore focus to the trigger on close
        setMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current: Element | null = document.activeElement;
      if (e.shiftKey && (current === first || !overlay?.contains(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !overlay?.contains(current))) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      if (nav) nav.inert = false;
      if (main) main.inert = false;
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        ref={navRef}
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
              ref={triggerRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              onClick={() => setMenuOpen((v) => !v)}
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
        ref={overlayRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t('mobileMenu')}
        inert={!menuOpen}
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
          onClick={() => {
            restoreFocusRef.current = true;
            setMenuOpen(false);
          }}
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
