# Portfolio Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the prior portfolio audit's findings that are _still open_, plus the missing TopNav tests, fixing real a11y / security / type-safety / motion bugs without unrequested polish.

**Architecture:** Per-feature surgical edits. Group changes by file/concern so each task is independently verifiable.

**Tech Stack:** Next.js 16 App Router (React 19, server components default), next-intl 4 i18n (en/ar, RTL), TypeScript 5 strict, Tailwind 4, Vitest + RTL + jest-axe, Playwright e2e, pnpm.

---

## ⚠️ Re-audit status (verified 2026-06-01 against current code, 44/44 tests green)

The codebase moved on since this plan was written (Web3Forms contact-form migration, motion hook, barrels, SEO, sitemap all landed). A full re-audit of every task was run against the live files. **Most of the original plan is already done.** Status legend:

- 🔴 **TODO** — not implemented; do it as written below.
- ⚠️ **PARTIAL** — partly there; scope narrowed to only the missing piece.
- ❌ **OBSOLETE** — written against code that no longer exists; replaced or deleted.
- 🟡 **OPTIONAL** — functionally fine today; do only if you want the polish/consistency.
- ✅ **DONE** — verified implemented; no action.

| Task                                           | Status                           | What's left                                                                                                                                 |
| ---------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** core/security module                     | 🔴 TODO                          | Create `core/security/headers.ts` + barrel                                                                                                  |
| **2** wire CSP + headers into `next.config.ts` | ⚠️ PARTIAL                       | Add CSP + `X-Content-Type-Options`; replace 3 inline headers with the module. Analyzer already wired.                                       |
| **3** force-static home page                   | 🔴 TODO                          | Add `dynamic`/`dynamicParams` exports (`generateStaticParams` already at layout)                                                            |
| **4** `<html>/<body>` → root layout            | 🟡 DECISION                      | Works today in `[locale]/layout`; the repo's own rules say the root layout should host the shell. Do only if you want convention-alignment. |
| **5** mobile nav dialog + focus trap           | ⚠️ PARTIAL                       | Add `role="dialog"`, `aria-modal`, focus trap. Scroll-lock / Escape / focus-restore already done.                                           |
| **6, 7** TopNav tests                          | 🔴 TODO                          | Both test files are missing                                                                                                                 |
| **8, 9** contact-form (mailto)                 | ❌ OBSOLETE → **revised Task 8** | Form is on Web3Forms; only #11 (memoize schema) + #12 (unmount guard) remain                                                                |
| **10** `useReducedMotion` hook                 | ✅ DONE                          | —                                                                                                                                           |
| **11** Hero3D uses the hook                    | 🟡 OPTIONAL                      | Works via inline `matchMedia`; refactor for consistency only                                                                                |
| **12** CustomCursor reduced-motion guard       | 🔴 TODO                          | One missing early-return line                                                                                                               |
| **13.1** light-theme `--cursor-blend`          | 🔴 TODO                          | Still `difference`; should be `normal`                                                                                                      |
| **13.2** reduced-motion CSS hardening          | 🟡 OPTIONAL                      | Already collapses animations + resets split/hero; `animation: none` is marginally stronger                                                  |
| **14** test-harness mocks                      | 🟡 OPTIONAL                      | All tests pass; add `next/navigation` mock + JSX Link only when a future test needs it                                                      |
| **15** ui-components barrel                    | ✅ DONE                          | —                                                                                                                                           |
| **16** named home exports                      | 🟡 OPTIONAL                      | Wildcard re-exports work; named is a style preference                                                                                       |
| **17** static JSON-LD                          | ✅ DONE                          | —                                                                                                                                           |
| **18** typed languages map                     | ✅ DONE                          | —                                                                                                                                           |
| **19** sitemap / localePrefix                  | ✅ DONE                          | —                                                                                                                                           |

**Recommended implementation order (open work only):** Task 1 → 2 → 3 → 5 → 6 → 7 → 8(revised) → 12 → 13.1 → (optional: 4, 11, 13.2, 14, 16).

---

## Pre-flight

- [ ] **Step 0.1: Confirm clean working tree and known-good baseline**

```bash
cd /Users/apple/Desktop/Portfolio
git status
pnpm install --frozen-lockfile
pnpm type-check && pnpm lint && pnpm test --run
```

Expected: clean tree, type-check + lint clean, 44 tests passing — the verified 2026-06-01 baseline.

---

## Group 1 — Security Headers (Critical #2, #25 + Medium #29) — 🔴 TODO / ⚠️ PARTIAL

> **Re-audit:** `core/security/` does not exist. `next.config.ts` currently emits only three inline headers (`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) — **no CSP and no `X-Content-Type-Options`**. The bundle analyzer (#29) is already wired (`withBundleAnalyzer`, `enabled: ANALYZE==='true'`), so #29 needs no code — at most a clarifying comment. The repo rule `.claude/rules/next-config.md` explicitly requires headers to be "defined in `core/security/headers.ts`", so this task aligns with project convention.

### Task 1: Create `core/security/headers.ts` with CSP + standard headers — 🔴 TODO

**Files:**

- Create: `core/security/headers.ts`
- Create: `core/security/index.ts`

- [ ] **Step 1.1: Write the headers module**

```ts
// core/security/headers.ts
// Single source of truth for response security headers, including the CSP.
// Wired into next.config.ts via headers(). Keep directives in sync with the
// runtime: inline <script> blocks (ThemeInitScript, Person JSON-LD) and
// Tailwind's runtime style injection require 'unsafe-inline'. Web3Forms is the
// only external endpoint the app talks to (contact form POST).

const isProd = process.env.NODE_ENV === 'production';

const CSP_DIRECTIVES: Record<string, readonly string[]> = {
  'default-src': ["'self'"],
  'script-src': isProd
    ? ["'self'", "'unsafe-inline'"]
    : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", 'https://api.web3forms.com'],
  'worker-src': ["'self'", 'blob:'],
  'frame-ancestors': ["'self'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'", 'https://api.web3forms.com'],
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

> **Note (changed from original plan):** `connect-src` and `form-action` now include `https://api.web3forms.com` — the contact form POSTs there. Without it the CSP would block form submission. The original plan predated the Web3Forms migration.

- [ ] **Step 1.2: Add a barrel for `core/security`**

```ts
// core/security/index.ts
export { SECURITY_HEADERS, buildContentSecurityPolicy } from './headers';
```

### Task 2: Wire headers into `next.config.ts` — ⚠️ PARTIAL (replace the 3 inline headers)

**Files:**

- Modify: `next.config.ts`

- [ ] **Step 2.1: Import the module and replace the inline `headers()` array**

Current `headers()` (lines 18–32) returns three hardcoded headers. Replace the whole config with:

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
    return [{ source: '/Portfolio.html', destination: '/', permanent: true }];
  },
};

export default analyzer(withNextIntl(nextConfig));
```

- [ ] **Step 2.2: Verify the build + headers**

```bash
pnpm type-check
pnpm build && pnpm start &
sleep 5
curl -sI http://localhost:3000/en | grep -iE 'content-security-policy|x-content-type-options|x-frame-options|referrer-policy|permissions-policy'
kill %1
```

Expected: all five headers present on `/en`, including `content-security-policy` with `connect-src ... https://api.web3forms.com`.

- [ ] **Step 2.3: Smoke-test the contact form against the new CSP**

```bash
# With pnpm start running, submit the contact form in the browser and confirm
# the POST to api.web3forms.com is NOT blocked by CSP (check DevTools console).
```

- [ ] **Step 2.4: Commit**

```bash
git add core/security next.config.ts
git commit -m "feat(security): add CSP and standard security headers via core/security/headers"
```

---

## Group 2 — App Router Static Rendering (Critical #1, #3+#20)

### Task 3: Force static rendering on the home page (#1) — 🔴 TODO

> **Re-audit:** `app/[locale]/page.tsx` has no `dynamic`/`dynamicParams` exports. `generateStaticParams()` already exists in `app/[locale]/layout.tsx` (covers param generation), so **do not** re-add it to the page — just add the two directives.

**Files:**

- Modify: `app/[locale]/page.tsx`

- [ ] **Step 3.1: Add the static-rendering directives**

Insert near the top of the file (after imports, before the component):

```ts
export const dynamic = 'force-static';
export const dynamicParams = false;
```

- [ ] **Step 3.2: Verify static generation**

```bash
pnpm build
```

Expected: build summary shows `/en` and `/ar` as `●` (Static) routes.

- [ ] **Step 3.3: Commit**

```bash
git add app/[locale]/page.tsx
git commit -m "perf(app): force-static the home page"
```

### Task 4: Move `<html>`/`<body>` shell to the root layout (#3 + #20) — 🟡 DECISION REQUIRED

> **Re-audit:** This is **not a bug** today — `app/[locale]/layout.tsx` renders a single well-formed `<html lang dir>`/`<body>` and injects Person JSON-LD; `app/layout.tsx` currently just returns `{children}`. The 44-test suite and e2e pass. The original finding (#3+#20) is a **convention** concern: non-locale entrypoints (`/_not-found`, route handlers) don't get a document shell, and `.claude/rules/next-config.md` describes `app/layout.tsx` as the "Root HTML shell."
>
> **Decision:** Implement only if you want to align with that documented convention. It is the highest-risk change in this plan (double-`<html>` / missing-JSON-LD regressions) and is fully independent — skipping it costs nothing functionally today. If you skip it, update `.claude/rules/next-config.md` to document that the `[locale]` layout owns the shell, so code and rules agree.

If implementing, follow the original two-file rewrite (root hosts `<html>/<body>` with `DEFAULT_LOCALE`; `[locale]` patches `lang`/`dir` via a `beforeInteractive` script and keeps JSON-LD + providers). Then verify:

```bash
pnpm build && pnpm start &
sleep 5
curl -s http://localhost:3000/en | grep -cE '<html'   # must be exactly 1
curl -s http://localhost:3000/ar | grep -E 'dir="rtl"' | head
kill %1
pnpm test --run && pnpm test:e2e -- --project=chromium
```

Expected: exactly one `<html>` per page, `/ar` is RTL, JSON-LD present, all tests green. Commit only if clean:

```bash
git add app/layout.tsx app/[locale]/layout.tsx
git commit -m "refactor(app): host <html>/<body> shell at root layout"
```

---

## Group 3 — TopNav Mobile Dialog (Critical #5, #6 + High #19) and Tests

### Task 5: Make the mobile menu a proper dialog with focus trap (#5, #6, #19) — ⚠️ PARTIAL

> **Re-audit of current `TopNav.tsx`:** body scroll-lock (`document.body.style.overflow`), Escape-to-close, and focus-restore-to-trigger are **already implemented**. **Missing:** the overlay `<div id="mobile-menu">` has `aria-hidden` but no `role="dialog"` / `aria-modal="true"`, and there is **no Tab focus trap** (focus can escape to the page behind). The full-file replacement below implements all of it correctly; use it to replace the current file (it is a superset of what's there). Translation keys (`openMenu`, `closeMenu`, `primary`, `cairo`, section keys) are already present in `en/ui.json` and `ar/ui.json` — no translation work needed.

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

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

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

> **Before committing:** diff the current file against this version — if the live `TopNav` has structural differences (e.g. a different brand/clock arrangement) introduced since the audit, preserve those and graft in only the dialog semantics (`role`/`aria-modal`/focus trap) rather than blindly overwriting.

### Task 6: Add TopNav behaviour tests — 🔴 TODO

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

### Task 7: Add TopNav accessibility test (axe) — 🔴 TODO

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
git commit -m "fix(a11y): make mobile nav a dialog with focus trap + add tests"
```

---

## Group 4 — Contact Form Correctness — ❌ OBSOLETE as written → revised below

> **Re-audit:** The original Tasks 8–9 targeted a `mailto:` form (`utils/buildMailto.ts`). That code **no longer exists** — the form was migrated to **Web3Forms** (`services/submitContact.ts`, POSTs to `https://api.web3forms.com/submit`). The component tests, accessibility tests, and service tests **already exist** and pass. Concern **#4 (barrel imports)** is already satisfied — `ContactForm.tsx` imports `Magnetic` from the `@/features/ui-components` barrel and otherwise only from its own feature.
>
> Two of the original underlying concerns are still open against the current code and are worth fixing:
>
> - **#11** — the Zod schema is rebuilt every render (`ContactForm.tsx:21` `const schema = buildContactSchema(t);`), so react-hook-form rebuilds its resolver each render.
> - **#12** — `handleFormSubmit` calls `setStatus`/`reset` after the awaited POST with no unmount guard; if the form unmounts mid-flight, React warns about setting state on an unmounted component.
>
> **Do NOT execute the original Tasks 8–9.** Use the single revised task below.

### Task 8 (revised): Memoize the schema and guard post-submit state (#11, #12) — 🔴 TODO

**Files:**

- Modify: `features/contact-form/components/ContactForm.tsx`

- [ ] **Step 8.1: Memoize the schema**

Add `useMemo` to the React import, then change line 21:

```tsx
// import { useEffect, useMemo, useRef, useState } from 'react';
const schema = useMemo(() => buildContactSchema(t), [t]);
```

- [ ] **Step 8.2: Add an unmount guard around post-await state updates**

Add a mounted ref and guard the `setStatus`/`reset` calls that run after `await onSubmit(...)`:

```tsx
const mountedRef = useRef(true);

useEffect(() => {
  mountedRef.current = true;
  return () => {
    mountedRef.current = false;
  };
}, []);

const handleFormSubmit = async (values: ContactFormValues) => {
  setStatus('sending');
  try {
    await onSubmit(values);
    if (!mountedRef.current) return;
    reset();
    setStatus('sent');
  } catch (err) {
    if (!mountedRef.current) return;
    console.error('[ContactForm] submission failed', err);
    setStatus('error');
  }
};
```

> Keep everything else in `ContactForm.tsx` (honeypot `botcheck` input, banner refs, `handleFieldChange`, spinner) exactly as-is.

- [ ] **Step 8.3: Run the existing contact-form tests + type-check**

```bash
pnpm type-check
pnpm test -- features/contact-form --run
```

Expected: all existing contact-form tests still green.

- [ ] **Step 8.4: Commit**

```bash
git add features/contact-form/components/ContactForm.tsx
git commit -m "fix(contact-form): memoise zod schema and guard post-submit state on unmount"
```

---

## Group 5 — Motion & Cursor Reduced-Motion (High #9, #10, #18)

> **Re-audit:** Task 10 (the `useReducedMotion` hook with lazy init + `change` subscription) and its `core/motion` barrel export are **DONE**. Only the cursor guard (Task 12) is still open; the Hero3D refactor (Task 11) is optional.

### Task 11 (optional): Use the hook in Hero3D (#10) — 🟡 OPTIONAL

> `features/hero-3d/components/Hero3D.tsx` already disables the canvas correctly via an inline `window.matchMedia('(prefers-reduced-motion: reduce)')` check combined with the fine-pointer check — it is **functionally correct**. This task is a consistency refactor only: swap the inline reduced-motion read for `useReducedMotion()` from `@/core/motion` (note: keep the `requestAnimationFrame` defer and the fine-pointer check; only the reduced-motion read changes). Skip unless you want the single-source-of-truth tidiness.

### Task 12: Guard the CustomCursor RAF loop (#18) — 🔴 TODO

> **Re-audit of `CustomCursor.tsx`:** the effect bails on non-fine/non-hover pointers (line 11) but **does not** bail on `prefers-reduced-motion: reduce` — the cursor RAF loop runs anyway. Add one line.

**Files:**

- Modify: `features/ui-components/components/CustomCursor.tsx`

- [ ] **Step 12.1: Add the reduced-motion bail-out**

Immediately after the existing pointer guard (current line 11), add:

```tsx
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
```

So the top of the effect reads:

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
pnpm test -- features/hero-3d core/motion features/ui-components --run
```

- [ ] **Step 12.3: Commit**

```bash
git add features/ui-components/components/CustomCursor.tsx
git commit -m "fix(motion): bail CustomCursor RAF loop under prefers-reduced-motion"
```

---

## Group 6 — Global CSS Reduced-Motion + Cursor Blend (High #16, #17, Medium #28)

> **Re-audit of `app/globals.css`:** the reduced-motion block already collapses all animations/transitions (`animation-duration: 0.001ms`), resets `.split-char`/`.split-word` transforms, and overrides `animate-[hero-*]` — so #16/#28 are **substantially covered**. The one clear remaining bug is **#17**: the light theme still sets `--cursor-blend: difference` (line 41), which inverts the cursor on light backgrounds.

### Task 13.1: Normalise the light-theme cursor blend (#17) — 🔴 TODO

**Files:**

- Modify: `app/globals.css` (light theme block, ~line 41)

- [ ] **Step 13.1.1:** In the `:root[data-theme='light']` block, change `--cursor-blend: difference;` → `--cursor-blend: normal;`. Leave the dark theme value (`difference`) untouched.

- [ ] **Step 13.1.2: Visual smoke**

```bash
pnpm build && pnpm start
# Switch theme to light → confirm the custom cursor is no longer inverted.
```

### Task 13.2 (optional): Harden the reduced-motion block (#16, #28) — 🟡 OPTIONAL

> The current block uses `animation-duration: 0.001ms` rather than `animation: none`. This is effectively equivalent for users. If you want the stronger, more explicit form, replace the universal rule's `animation-duration`/`animation-iteration-count` lines with `animation: none !important;` and keep the existing `.split-*` and `animate-[hero-*]` overrides. Low value; optional.

- [ ] **Step 13.3: Verify with axe**

```bash
pnpm test -- accessibility --run
```

- [ ] **Step 13.4: Commit**

```bash
git add app/globals.css
git commit -m "fix(css): normalise light-theme cursor blend (and optional reduced-motion hardening)"
```

---

## Group 7 — Test Harness Fixes (High #13, #14) — 🟡 OPTIONAL / PREVENTIVE

> **Re-audit:** All 44 tests pass with the current `vitest.setup.ts`. The `@/i18n/routing` `Link` mock currently returns a raw `document.createElement('a')` node and there is **no `next/navigation` mock**. Nothing in the suite renders a `<Link>` as a React child today, so it isn't breaking — but the raw-DOM-node return is not valid React rendering and will throw the moment a test renders `<Link>`. Treat this as **preventive**: do it only when you add a test that renders `<Link>` or calls a `next/navigation` router hook. If/when you do, follow the original Task 14 (return real JSX from the Link mock, add a `next/navigation` mock, rename the setup file to `vitest.setup.tsx`, and update `vitest.config.ts`'s `setupFiles` path).

---

## Group 8 — Barrels, Metadata, Sitemap — ✅ MOSTLY DONE

> **Re-audit results:**
>
> - **#8 / Task 15** — ✅ `features/ui-components/index.ts` is exactly `export * from './components'`; no orphaned `types`/`config` dirs.
> - **#21 / Task 16** — 🟡 OPTIONAL. `features/home/index.ts` uses sectioned wildcard re-exports (`export type * from './types'`, `export * from './config'`, `export * from './components'`). This works; converting to explicit named exports is a style preference only. Skip unless desired.
> - **#22 / Task 17** — ✅ `buildPersonJsonLd` just `JSON.stringify`s a static `PERSON_JSON_LD` literal; no runtime state.
> - **#24 / Task 18** — ✅ `buildMetadata` builds the hreflang map as `Object.fromEntries(...) as Record<Locale, string>`; type-safe.
> - **#26 / Task 19** — ✅ `localePrefix: 'always'` in `i18n/routing.ts`; `app/sitemap.ts` emits clean `${SITE_URL}/${locale}` URLs.
>
> **No action required for Group 8** (Task 16 optional).

---

## Group 9 — Final Verification

### Task 21: Full pipeline + E2E + manual smoke

- [ ] **Step 21.1: Full pipeline**

```bash
pnpm lint
pnpm type-check
pnpm test --run
pnpm build
pnpm test:e2e -- --project=chromium
```

Expected: all green.

- [ ] **Step 21.2: Manual smoke** (`pnpm build && pnpm start`)

1. `http://localhost:3000/en` — confirm all five security headers in DevTools → Network, no console errors.
2. Submit the contact form — POST to `api.web3forms.com` not blocked by CSP.
3. Mobile width → hamburger → Tab cycles **inside** the dialog → Escape returns focus to the hamburger.
4. DevTools → Rendering → emulate `prefers-reduced-motion: reduce` → hero entrance jumps to final state, CustomCursor does not spawn.
5. Switch to light theme → cursor is no longer inverted.
6. `/ar` renders RTL (`<html dir="rtl">`).

- [ ] **Step 21.3: Tree check**

```bash
git status
```

Expected: clean tree.

---

## Self-Review Notes (updated 2026-06-01)

**Open work after re-audit:** Tasks 1, 2, 3, 5, 6, 7, 8 (revised), 12, 13.1. Optional: 4, 11, 13.2, 14, 16.

**Already done (verified, no action):** 10, 13 (export), 15, 17, 18, 19, plus the entire Web3Forms contact-form migration and its tests, and TopNav scroll-lock/Escape/focus-restore + nav translation keys.

**Risks / trade-offs:**

- **Task 4** is the only high-risk item and is now a deliberate decision, not a required fix — the app is well-formed today. Skipping it is safe; if skipped, reconcile `.claude/rules/next-config.md`.
- **CSP** uses `'unsafe-inline'` for script/style (inline `ThemeInitScript` + Person JSON-LD + Tailwind runtime styles) and explicitly allows `https://api.web3forms.com` in `connect-src`/`form-action`. Tightening to nonces is out of scope.
- Each group is independent; commit per group so any single change can be reverted in isolation.
