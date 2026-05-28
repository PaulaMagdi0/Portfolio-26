# Portfolio Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the prior portfolio audit's 22 findings (6 critical, 11 high, 7 medium) plus the missing TopNav and ContactForm tests, fixing real a11y / security / type-safety / motion bugs without unrequested polish.

**Architecture:** Per-feature surgical edits. Group changes by file/concern so each task is independently verifiable: security headers module + CSP wiring, layout/static-rendering hints, TopNav dialog/focus-trap, contact-form correctness, motion + reduced-motion guards, CSS reduced-motion rewrite, test-harness mocks, and barrel/SEO cleanups. New tests follow Vitest + React Testing Library + jest-axe per the repo's testing rules.

**Tech Stack:** Next.js 16 App Router (React 19, server components default), next-intl 4 i18n (en/ar, RTL), TypeScript 5 strict, Tailwind 4, Vitest + RTL + jest-axe, Playwright e2e, pnpm.

---

## Pre-flight

- [ ] **Step 0.1: Confirm clean working tree (apart from prior session edits)**

```bash
cd /Users/apple/Desktop/Portfolio
git status
pnpm install --frozen-lockfile
pnpm type-check && pnpm lint && pnpm test --run
```
Expected: known modified files (`app/[locale]/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, `e2e/home.spec.ts`); type-check and tests green so we have a known-good baseline before edits.

---

## Group 1 — Security Headers (Critical #2, #25 + Medium #29)

### Task 1: Create `core/security/headers.ts` with CSP + standard headers

**Files:**
- Create: `core/security/headers.ts`
- Create: `core/security/index.ts`

- [ ] **Step 1.1: Write the headers module**

```ts
// core/security/headers.ts
// Single source of truth for response security headers, including the CSP.
// Wired into next.config.ts via headers(). Keep directives in sync with the
// runtime: inline <script> blocks (ThemeInitScript, Person JSON-LD) and
// Tailwind's runtime style injection require 'unsafe-inline'.

const isProd = process.env.NODE_ENV === 'production';

const CSP_DIRECTIVES: Record<string, readonly string[]> = {
  'default-src': ["'self'"],
  'script-src': isProd
    ? ["'self'", "'unsafe-inline'"]
    : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'"],
  'worker-src': ["'self'", 'blob:'],
  'frame-ancestors': ["'self'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'object-src': ["'none'"],
  'upgrade-insecure-requests': [],
};

export function buildContentSecurityPolicy(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([k, v]) => (v.length ? `${k} ${v.join(' ')}` : k))
    .join('; ');
}

export const SECURITY_HEADERS: ReadonlyArray<{ key: string; value: string }> = [
  { key: 'Content-Security-Policy', value: buildContentSecurityPolicy() },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
```

- [ ] **Step 1.2: Add a barrel for `core/security`**

```ts
// core/security/index.ts
export { SECURITY_HEADERS, buildContentSecurityPolicy } from './headers';
```

### Task 2: Wire CSP into `next.config.ts` and add the bundle-analyzer comment (#29)

**Files:**
- Modify: `next.config.ts` (replace `headers()` body, annotate analyzer at lines 7–9)

- [ ] **Step 2.1: Update `next.config.ts`**

```ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { SECURITY_HEADERS } from './core/security';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Bundle analyzer is a no-op unless ANALYZE=true — safe to keep wrapped in prod.
const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS.map(({ key, value }) => ({ key, value })),
      },
    ];
  },
  async redirects() {
    return [
      { source: '/Portfolio.html', destination: '/', permanent: true },
    ];
  },
};

export default analyzer(withNextIntl(nextConfig));
```

- [ ] **Step 2.2: Verify the build still passes**

```bash
pnpm type-check
pnpm build
```
Expected: success; check terminal/Network tab in `pnpm start` shows `content-security-policy`, `x-content-type-options`, `referrer-policy`, `permissions-policy` headers on `/` and `/en`.

- [ ] **Step 2.3: Commit**

```bash
git add core/security next.config.ts
git commit -m "feat(security): add CSP and standard security headers via core/security/headers"
```

---

## Group 2 — App Router Static Rendering (Critical #1, #3+#20)

### Task 3: Force static rendering on the home page (#1)

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 3.1: Update the page header**

Insert above `interface HomePageProps`:

```ts
import { SUPPORTED_LOCALES } from '@/i18n/config';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}
```

- [ ] **Step 3.2: Verify static generation**

```bash
pnpm build
```
Expected: build summary shows `/en` and `/ar` as `●` (Static) routes.

- [ ] **Step 3.3: Commit**

```bash
git add app/[locale]/page.tsx
git commit -m "perf(app): force-static the home page with explicit generateStaticParams"
```

### Task 4: Move `<html>`/`<body>` shell to the root layout (#3 + #20)

**Context:** Next.js 16 expects the root `app/layout.tsx` to render `<html>`/`<body>`. The current code emits them from `app/[locale]/layout.tsx` instead — a next-intl pattern that works but conflicts with App Router conventions and makes `/robots.txt`, `/sitemap.xml`, and the `_not-found` fallback render without a real document shell. We move the shell up; the [locale] layout keeps responsibility for `lang`, `dir`, font classes, and the Person JSON-LD `<head>` injection by becoming the page-wrapper element rather than the document root.

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 4.1: Rewrite `app/layout.tsx` as the document shell**

```tsx
// app/layout.tsx
import type { ReactNode } from 'react';
import { DEFAULT_LOCALE, LOCALE_DIRECTIONS } from '@/i18n/config';
import { cairo, instrumentSerif, inter, jetbrainsMono, notoNaskhArabic } from './fonts';
import './globals.css';

// Root document. Locale-aware lang/dir are patched by the [locale] layout via
// a beforeInteractive script for the locale-prefixed routes (/en, /ar). For
// non-locale entrypoints (/sitemap.xml, /robots.txt, /_not-found) we fall back
// to DEFAULT_LOCALE here.
export default function RootLayout({ children }: { children: ReactNode }) {
  const dir = LOCALE_DIRECTIONS[DEFAULT_LOCALE];
  return (
    <html
      lang={DEFAULT_LOCALE}
      dir={dir}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable} ${cairo.variable} ${notoNaskhArabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4.2: Trim `app/[locale]/layout.tsx` to the locale-scoped concerns**

Replace the file with:

```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { setRequestLocale, getMessages, getTranslations } from 'next-intl/server';
import { LOCALE_DIRECTIONS, SUPPORTED_LOCALES, isLocale } from '@/i18n/config';
import { buildMetadata, buildPersonJsonLd } from '@/core/seo';
import { SkipLink } from '@/core/accessibility';
import { ThemeInitScript } from '@/core/theme';
import { ClientProviders } from './ClientProviders';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'home.meta' });
  return buildMetadata({ locale, title: t('title'), description: t('description') });
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = LOCALE_DIRECTIONS[locale];

  return (
    <>
      <Script id="locale-attrs" strategy="beforeInteractive">
        {`document.documentElement.lang=${JSON.stringify(locale)};document.documentElement.dir=${JSON.stringify(dir)};`}
      </Script>
      <Script
        id="person-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: buildPersonJsonLd() }}
      />
      <ThemeInitScript />
      <ClientProviders locale={locale} messages={messages}>
        <SkipLink />
        {children}
      </ClientProviders>
    </>
  );
}
```

- [ ] **Step 4.3: Verify SSR HTML is well-formed and lang/dir are correct**

```bash
pnpm build && pnpm start &
sleep 5
curl -s http://localhost:3000/en | grep -E '(<html|<body|application/ld\+json)' | head
curl -s http://localhost:3000/ar | grep -E '(<html|<body|dir=)' | head
kill %1
```
Expected: a single `<html lang="en" dir="ltr" ...>` for `/en` (patched to `ar`/`rtl` by the inline script on `/ar`), a single `<body>`, and the `application/ld+json` Person script present.

- [ ] **Step 4.4: Re-run unit and e2e smoke**

```bash
pnpm test --run
pnpm test:e2e -- --project=chromium
```

- [ ] **Step 4.5: Commit**

```bash
git add app/layout.tsx app/[locale]/layout.tsx
git commit -m "refactor(app): host <html>/<body> shell at root layout, keep locale concerns in [locale]"
```

---

## Group 3 — TopNav Mobile Dialog (Critical #5, #6 + High #19) and Tests

### Task 5: Make the mobile menu a proper dialog with focus trap (#5, #6, #19)

**Files:**
- Modify: `features/ui-components/components/TopNav.tsx`

- [ ] **Step 5.1: Replace the file body**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/features/localization';
import { cn } from '@/lib/utils';
import { LiveClock } from './LiveClock';
import { ThemeToggle } from './ThemeToggle';

const SECTIONS = ['work', 'experience', 'certifications', 'stack', 'contact'] as const;
type SectionId = (typeof SECTIONS)[number];

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function TopNav() {
  const t = useTranslations('ui.nav');
  const tBrand = useTranslations('ui.brand');
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<SectionId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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
    if (!menuOpen) return;

    document.body.style.overflow = 'hidden';
    const overlay = overlayRef.current;
    const focusables = (): HTMLElement[] =>
      overlay ? Array.from(overlay.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];

    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (current === first || !overlay?.contains(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      triggerRef.current?.focus();
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
              ref={triggerRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              onClick={() => setMenuOpen((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition-colors md:hidden"
            >
              <span aria-hidden className="bg-ink absolute h-0.5 w-5 -translate-y-1.5 rounded-full" />
              <span aria-hidden className="bg-ink absolute h-0.5 w-5 translate-y-1.5 rounded-full" />
            </button>
          </div>
        </div>
      </nav>

      <div
        ref={overlayRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t('primary')}
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
```

### Task 6: Add TopNav behaviour tests

**Files:**
- Create: `features/ui-components/__tests__/components/TopNav.test.tsx`

- [ ] **Step 6.1: Write the test file**

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopNav } from '@/features/ui-components';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  document.body.style.overflow = '';
});

function getHamburger() {
  return screen.getByRole('button', { name: /ui\.nav\.openMenu|Open menu/i });
}

describe('TopNav mobile menu', () => {
  it('opens and closes the dialog on hamburger toggle', async () => {
    const user = userEvent.setup();
    render(<TopNav />);
    const trigger = getHamburger();

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const dialog = screen.getByRole('dialog', { hidden: false });
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and restores body scroll', async () => {
    const user = userEvent.setup();
    render(<TopNav />);
    await user.click(getHamburger());
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    expect(getHamburger()).toHaveAttribute('aria-expanded', 'false');
    expect(document.body.style.overflow).toBe('');
  });

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<TopNav />);
    await user.click(getHamburger());
    const dialog = screen.getByRole('dialog');
    await user.click(dialog);
    expect(getHamburger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('locks body scroll while open and unlocks on close', async () => {
    const user = userEvent.setup();
    render(<TopNav />);
    expect(document.body.style.overflow).toBe('');
    await user.click(getHamburger());
    expect(document.body.style.overflow).toBe('hidden');
    await user.click(getHamburger());
    expect(document.body.style.overflow).toBe('');
  });

  it('focuses the first focusable element inside the dialog on open', async () => {
    const user = userEvent.setup();
    render(<TopNav />);
    await user.click(getHamburger());
    const dialog = screen.getByRole('dialog');
    const closeBtn = within(dialog).getByRole('button', {
      name: /ui\.nav\.closeMenu|Close menu/i,
    });
    expect(document.activeElement).toBe(closeBtn);
  });
});
```

### Task 7: Add TopNav accessibility test (axe)

**Files:**
- Create: `features/ui-components/__tests__/components/TopNav.accessibility.test.tsx`

- [ ] **Step 7.1: Write the test**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { TopNav } from '@/features/ui-components';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('TopNav accessibility', () => {
  it('has no axe violations when closed', async () => {
    const { container } = render(<TopNav />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations with the mobile dialog open', async () => {
    const user = userEvent.setup();
    const { container } = render(<TopNav />);
    await user.click(container.querySelector('button[aria-controls="mobile-menu"]')!);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 7.2: Run the new tests**

```bash
pnpm test -- features/ui-components/__tests__/components/TopNav --run
```
Expected: 7 passing tests across the two files.

- [ ] **Step 7.3: Commit**

```bash
git add features/ui-components/components/TopNav.tsx features/ui-components/__tests__/components/TopNav.test.tsx features/ui-components/__tests__/components/TopNav.accessibility.test.tsx
git commit -m "fix(a11y): make mobile nav a dialog with focus trap and toggle behaviour"
```

---

## Group 4 — Contact Form Correctness (Critical #4 + High #11, #12) and Tests

### Task 8: Fix the buildMailto import + harden ContactForm

**Files:**
- Modify: `features/contact-form/utils/buildMailto.ts`
- Modify: `features/contact-form/components/ContactForm.tsx`

- [ ] **Step 8.1: Import from the feature barrel, not its internals (#4)**

Replace line 1 of `features/contact-form/utils/buildMailto.ts`:

```ts
import { RECIPIENT_EMAIL } from '@/features/home';
```

- [ ] **Step 8.2: Memoise the schema and guard post-navigation state (#11, #12)**

Replace `features/contact-form/components/ContactForm.tsx` with:

```tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Magnetic } from '@/features/ui-components';
import { Field } from './Field';
import { buildContactSchema, type ContactFormValues } from '../types/contact.schema';
import { buildMailto } from '../utils/buildMailto';

type Status = 'idle' | 'sending' | 'sent';

export function ContactForm() {
  const t = useTranslations('contact');
  const tUi = useTranslations('ui');
  const schema = useMemo(() => buildContactSchema(t), [t]);
  const [status, setStatus] = useState<Status>('idle');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: ContactFormValues) => {
    setStatus('sending');
    const url = buildMailto(values);
    requestAnimationFrame(() => {
      window.location.href = url;
      window.setTimeout(() => {
        if (mountedRef.current) setStatus('sent');
      }, 200);
    });
  };

  const submitLabel =
    status === 'sending' ? t('formSending') : status === 'sent' ? t('formSent') : t('formSend');

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Field
        id="name"
        label={t('formName')}
        placeholder={t('formNamePlaceholder')}
        autoComplete="name"
        {...register('name')}
        error={errors.name?.message}
      />
      <Field
        id="email"
        type="email"
        label={t('formEmail')}
        placeholder={t('formEmailPlaceholder')}
        autoComplete="email"
        {...register('email')}
        error={errors.email?.message}
      />
      <Field
        id="message"
        textarea
        label={t('formMessage')}
        placeholder={t('formMessagePlaceholder')}
        {...register('message')}
        error={errors.message?.message}
      />
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Magnetic as="span" strength={0.25}>
          <button
            type="submit"
            disabled={status !== 'idle'}
            data-cursor-label={tUi('cursor.send')}
            className="btn-base btn-primary disabled:opacity-60"
          >
            {submitLabel}
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </button>
        </Magnetic>
        <span className="text-inkmute font-mono text-[12px]">{t('formHelper')}</span>
      </div>
    </form>
  );
}
```

### Task 9: Add ContactForm component tests

**Files:**
- Create: `features/contact-form/__tests__/components/ContactForm.test.tsx`

- [ ] **Step 9.1: Write the test**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/features/contact-form';

const originalHref = window.location.href;

afterEach(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...window.location, href: originalHref },
  });
});

describe('ContactForm', () => {
  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole('button', { name: /formSend|Send/i }));
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/formName|Your name/i), 'Jane');
    await user.type(screen.getByLabelText(/formEmail|Email/i), 'not-an-email');
    await user.type(
      screen.getByLabelText(/formMessage|Message/i),
      'A sufficiently long message body.',
    );
    await user.click(screen.getByRole('button', { name: /formSend|Send/i }));
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.some((el) => /email/i.test(el.textContent ?? ''))).toBe(true);
  });

  it('navigates to a mailto: URL on valid submit', async () => {
    const user = userEvent.setup();
    const setHref = vi.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        set href(v: string) {
          setHref(v);
        },
        get href() {
          return originalHref;
        },
      },
    });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    render(<ContactForm />);
    await user.type(screen.getByLabelText(/formName|Your name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/formEmail|Email/i), 'jane@example.com');
    await user.type(
      screen.getByLabelText(/formMessage|Message/i),
      'Hello — interested in chatting about a senior role.',
    );
    await user.click(screen.getByRole('button', { name: /formSend|Send/i }));

    expect(setHref).toHaveBeenCalledTimes(1);
    expect(setHref.mock.calls[0][0]).toMatch(/^mailto:[^?]+\?/);
    expect(setHref.mock.calls[0][0]).toContain(encodeURIComponent('jane@example.com'));
  });
});
```

- [ ] **Step 9.2: Run the new tests**

```bash
pnpm test -- features/contact-form/__tests__/components/ContactForm.test.tsx --run
```
Expected: 3 passing.

- [ ] **Step 9.3: Commit**

```bash
git add features/contact-form/utils/buildMailto.ts features/contact-form/components/ContactForm.tsx features/contact-form/__tests__/components/ContactForm.test.tsx
git commit -m "fix(contact-form): import via barrel, memoise schema, guard post-nav state + add component tests"
```

---

## Group 5 — Motion & Cursor Reduced-Motion (High #9, #10, #18)

### Task 10: Add CSS-primary guard to `useReducedMotion`

**Files:**
- Modify: `core/motion/hooks/useReducedMotion.ts`

- [ ] **Step 10.1: Rewrite the hook**

```ts
'use client';

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(QUERY);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
```

### Task 11: Use the hook in Hero3D (#10)

**Files:**
- Modify: `features/hero-3d/components/Hero3D.tsx`

- [ ] **Step 11.1: Swap the inline media query**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/core/motion';
import { Hero3DCanvas } from './Hero3DCanvas';

export function Hero3D() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const raf = requestAnimationFrame(() => setEnabled(finePointer && !reduced));
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <div className="pointer-events-none absolute inset-0">
      {enabled ? (
        <Hero3DCanvas />
      ) : (
        <svg viewBox="0 0 200 200" className="h-full w-full opacity-25" aria-hidden>
          <g fill="none" stroke="currentColor" strokeWidth="0.5">
            <polygon points="100,30 165,70 165,130 100,170 35,130 35,70" />
            <polygon points="100,55 142,80 142,120 100,145 58,120 58,80" />
            <circle cx="100" cy="100" r="3" fill="currentColor" />
          </g>
        </svg>
      )}
    </div>
  );
}
```

- [ ] **Step 11.2: Confirm `useReducedMotion` is exported from `@/core/motion`**

```bash
grep -n "useReducedMotion" /Users/apple/Desktop/Portfolio/core/motion/index.ts
```
If absent, add to `core/motion/index.ts` under the `// --- Hooks ---` section:

```ts
export { useReducedMotion } from './hooks/useReducedMotion';
```

### Task 12: Guard the CustomCursor RAF loop (#18)

**Files:**
- Modify: `features/ui-components/components/CustomCursor.tsx`

- [ ] **Step 12.1: Add the reduced-motion bail-out at lines 9–11**

Replace the early returns at the top of the effect:

```tsx
useEffect(() => {
  if (typeof window === 'undefined') return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // ... rest of the effect unchanged
}, []);
```

- [ ] **Step 12.2: Run motion-touching tests**

```bash
pnpm test -- features/hero-3d core/motion features/ui-components/__tests__/components/ScrollProgress --run
```

- [ ] **Step 12.3: Commit**

```bash
git add core/motion/hooks/useReducedMotion.ts features/hero-3d/components/Hero3D.tsx features/ui-components/components/CustomCursor.tsx core/motion/index.ts
git commit -m "fix(motion): centralise reduced-motion via useReducedMotion and guard cursor RAF"
```

---

## Group 6 — Global CSS Reduced-Motion + Cursor Blend (High #16, #17, Medium #28)

### Task 13: Rewrite the reduced-motion block in `app/globals.css`

**Files:**
- Modify: `app/globals.css` (line 41, lines 779–798)

- [ ] **Step 13.1: Set `--cursor-blend: normal` for the light theme (#17)**

In the `:root[data-theme='light']` block at line 41, change `--cursor-blend: difference;` → `--cursor-blend: normal;`.

- [ ] **Step 13.2: Replace the reduced-motion block at lines 779–798 (#16, #28)**

```css
/* --- Reduced Motion --- */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition-duration: 0.001ms !important;
  }

  .split-char,
  .split-word {
    transform: none !important;
  }
}

/* Hero entrance: explicit override (no substring class selector) */
@media (prefers-reduced-motion: reduce) {
  @keyframes hero-rule {
    from,
    to {
      transform: scaleX(1);
    }
  }
  @keyframes hero-fade {
    from,
    to {
      opacity: 1;
      transform: none;
    }
  }
}
```

- [ ] **Step 13.3: Verify with axe + visual smoke**

```bash
pnpm test -- accessibility --run
```

- [ ] **Step 13.4: Commit**

```bash
git add app/globals.css
git commit -m "fix(css): harden reduced-motion (animation: none, keyframe overrides) and normalise light-theme cursor blend"
```

---

## Group 7 — Test Harness Fixes (High #13, #14)

### Task 14: Fix the `next/navigation` mock + Link mock JSX

**Files:**
- Modify: `vitest.setup.ts` (or rename to `vitest.setup.tsx` if JSX is required)
- Maybe modify: `vitest.config.ts` (setupFiles path)

- [ ] **Step 14.1: Replace the routing mock and add a `next/navigation` mock**

Replace the existing `vi.mock('@/i18n/routing', ...)` block (line 98+) with:

```tsx
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...rest }: { children: React.ReactNode; href?: string }) => (
    <a href={typeof href === 'string' ? href : '#'} {...rest}>
      {children}
    </a>
  ),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  redirect: vi.fn(),
  getPathname: () => '/',
}));

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>('next/navigation');
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    redirect: vi.fn(),
    notFound: vi.fn(),
  };
});
```

- [ ] **Step 14.2: Rename to `.tsx` if needed**

The setup file now contains JSX. Rename and point the config at it:

```bash
git mv vitest.setup.ts vitest.setup.tsx
grep -n "setupFiles" vitest.config.ts
```
Update `vitest.config.ts`:

```ts
setupFiles: ['./vitest.setup.tsx'],
```

- [ ] **Step 14.3: Run all tests**

```bash
pnpm test --run
```
Expected: full suite green, including pre-existing tests that import `Link` from `@/i18n/routing`.

- [ ] **Step 14.4: Commit**

```bash
git add vitest.setup.tsx vitest.config.ts
git commit -m "test(setup): return real JSX from Link mock and mock next/navigation"
```

---

## Group 8 — Barrels, Metadata, Sitemap (High #8 + Medium #21, #22, #24, #26)

### Task 15: Tighten the `features/ui-components` barrel (#8)

**Files:**
- Modify: `features/ui-components/index.ts`

- [ ] **Step 15.1: Re-export only what exists, in the canonical order**

Replace the file with:

```ts
// --- Components ---
export * from './components';
```

Rationale (verified during pre-flight): there are no `types/` or `config/` directories under `features/ui-components/` today, so `export type * from './types'` and `export * from './config'` reference modules that aren't there. The Types → Config → Components ordering applies only when those layers exist; here only Components does. If a future change introduces shared types or config, restore the canonical ordering with section comments at that time.

### Task 16: Replace wildcard with named exports in `features/home/index.ts` (#21)

**Files:**
- Modify: `features/home/index.ts`

- [ ] **Step 16.1: Confirm component names**

```bash
grep -n "^export" /Users/apple/Desktop/Portfolio/features/home/components/index.ts
```

- [ ] **Step 16.2: Replace the barrel**

```ts
// --- Types ---
export type * from './types';

// --- Config ---
export {
  WORK,
  EXPERIENCE,
  CERTIFICATIONS,
  STACK,
  MARQUEE_TOOLS,
  SOCIALS,
  RECIPIENT_EMAIL,
} from './config';

// --- Components ---
export {
  Hero,
  HeroMetaStrip,
  Work,
  Experience,
  Education,
  Certifications,
  Stack,
  Contact,
} from './components';
```

If Step 16.1 shows additional component names (e.g. `CaseStudyDrawer`), include them; if any in the list above is missing, remove it. Do not leave a name in the barrel that does not exist in `./components`.

### Task 17: Verify `buildPersonJsonLd` uses only constants (#22)

**Files:**
- Inspect: `core/seo/utils/buildPersonJsonLd.ts`, `core/seo/config/person.config.ts`

- [ ] **Step 17.1: Confirm no runtime state**

```bash
grep -nE "(Date\.|new Date|Math\.|process\.|window\.|document\.)" \
  /Users/apple/Desktop/Portfolio/core/seo/utils/buildPersonJsonLd.ts \
  /Users/apple/Desktop/Portfolio/core/seo/config/person.config.ts
```
Expected: empty output (`PERSON_JSON_LD` is a static literal and `buildPersonJsonLd` just `JSON.stringify`s it). If anything appears, replace the dynamic piece with a literal so the JSON-LD payload is byte-stable across renders.

### Task 18: Type-safe languages map in `buildMetadata` (#24)

**Files:**
- Modify: `core/seo/utils/buildMetadata.ts`

- [ ] **Step 18.1: Replace lines 19–21 with a typed reduce**

```ts
const languages = SUPPORTED_LOCALES.reduce<Record<Locale, string>>(
  (acc, l) => {
    acc[l] = `${SITE_URL}/${l}${path}`;
    return acc;
  },
  Object.create(null) as Record<Locale, string>,
);
```

### Task 19: Verify sitemap matches `localePrefix: 'always'` (#26)

**Files:**
- Inspect: `app/sitemap.ts`, `i18n/routing.ts`

- [ ] **Step 19.1: Cross-check the URL shape**

```bash
grep -nE "(localePrefix|SITE_URL|sitemap)" /Users/apple/Desktop/Portfolio/i18n/routing.ts /Users/apple/Desktop/Portfolio/app/sitemap.ts
```
Expected: `localePrefix: 'always'` in routing.ts and `${SITE_URL}/${locale}` URLs in sitemap.ts (no double `/`, no trailing slash). If `localePrefix` ever changes to `'as-needed'`, drop the `/en` prefix from the `x-default` and default-locale entries.

### Task 20: Run the full pipeline + commit barrels/seo

- [ ] **Step 20.1: Final verification**

```bash
pnpm lint
pnpm type-check
pnpm test --run
pnpm build
```
Expected: all green.

- [ ] **Step 20.2: Commit**

```bash
git add features/ui-components/index.ts features/home/index.ts core/seo/utils/buildMetadata.ts
git commit -m "refactor(barrels,seo): tighten exports and type the languages map"
```

---

## Group 9 — Final Verification

### Task 21: E2E + manual smoke

- [ ] **Step 21.1: Run e2e in chromium**

```bash
pnpm test:e2e -- --project=chromium
```

- [ ] **Step 21.2: Manually verify in browser**

```bash
pnpm build && pnpm start
```
Then in a fresh browser tab:
1. Open `http://localhost:3000/en` — confirm CSP header (DevTools → Network → response headers), no console errors.
2. Resize to mobile width → click hamburger → press Tab repeatedly → focus must cycle inside the dialog → press Escape → focus returns to the hamburger.
3. Toggle `prefers-reduced-motion` in DevTools → Rendering → confirm hero entrance jumps to final state and CustomCursor doesn't spawn.
4. Switch theme to light → confirm cursor is no longer inverted.
5. `/ar` renders RTL, `<html dir="rtl">` present.

- [ ] **Step 21.3: Tree check**

```bash
git status
```
Expected: clean tree. If there are stray edits, review and either commit them with a clear scope or revert.

---

## Self-Review Notes

**Spec coverage:**
- Critical: #1 (Task 3), #2 (Tasks 1+2), #3+#20 (Task 4), #4 (Task 8.1), #5 (Task 5), #6 (Task 5).
- High: #8 (Task 15), #9 (Task 10), #10 (Task 11), #11 (Task 8.2), #12 (Task 8.2), #13 (Task 14), #14 (Task 14), #16 (Task 13), #17 (Task 13), #18 (Task 12), #19 (Task 5).
- Medium: #21 (Task 16), #22 (Task 17), #24 (Task 18), #25 (Task 1 — `frame-ancestors 'self'` is in the CSP), #26 (Task 19), #28 (Task 13), #29 (Task 2.1).
- New tests: TopNav unit + a11y (Tasks 6, 7), ContactForm validation + mailto (Task 9).

**Risks / known trade-offs:**
- Task 4 changes the canonical document-shell host. If a regression appears (double `<html>`, missing JSON-LD), the rollback is to revert Task 4 only — every other group is independent.
- CSP uses `'unsafe-inline'` for script/style because the project ships inline `ThemeInitScript` and Person JSON-LD; tightening to nonces is out of scope for this plan.
- Task 15 deliberately drops the audit-recommended Types/Config sections because those layers don't exist under `features/ui-components/`. If new types/config arrive later, restore the canonical ordering with section comments.
