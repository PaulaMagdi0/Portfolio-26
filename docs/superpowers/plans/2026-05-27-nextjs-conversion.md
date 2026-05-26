# Next.js Portfolio Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Paula Magdy's single-page portfolio from a Babel-in-the-browser React build (`Portfolio.html` + `src/*.jsx` via unpkg CDNs) into a Next.js 16 App Router project with full SEO, statically rendered for both `en` and `ar` (RTL) locales, while preserving every visual and interactive feature of the current site.

**Architecture:** App Router with `app/[locale]/page.tsx` composing feature sections. DDD-lite folder layout: `core/` for cross-feature utilities (motion, theme, seo, accessibility), `features/` for vertical slices (home, hero-3d, ui-components, contact-form, localization). No backend, no Redux, no TanStack Query — content is in typed config files; the contact form opens `mailto:`. Heavy client libs (three.js, gsap, lenis) load via `next/dynamic` with `ssr: false`. The legacy build moves to `legacy/` and is preserved as a reference until parity is verified.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict), Tailwind CSS 4 (`@theme` directive), `next-intl` (EN/AR with RTL), `next-themes`, `next/font/google`, `framer-motion`, `gsap` + ScrollTrigger + SplitText, `lenis`, `three`, `react-hook-form` + Zod, Vitest + React Testing Library + jest-axe, Playwright. Package manager: `pnpm`.

---

## File Structure

```
Portfolio/
├── .claude/                          # Project Claude config (already adapted for this scope)
├── docs/
│   └── superpowers/plans/            # This plan and any future plans
├── legacy/                            # Original static build (read-only reference)
│   ├── Portfolio.html
│   ├── .thumbnail
│   ├── src/
│   │   ├── app.jsx
│   │   ├── components.jsx
│   │   ├── hero3d.jsx
│   │   ├── i18n.jsx
│   │   ├── motion.jsx
│   │   └── sections.jsx
│   └── README.md
├── app/
│   ├── layout.tsx                    # Root HTML shell (no locale)
│   ├── fonts.ts                      # next/font/google declarations
│   ├── globals.css                   # Tailwind + @theme tokens + global styles
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── not-found.tsx
│   └── [locale]/
│       ├── layout.tsx                # Locale layout, generateMetadata, providers
│       ├── ClientProviders.tsx       # ThemeProvider + NextIntlClientProvider
│       ├── page.tsx                  # Home (composes feature sections)
│       └── not-found.tsx
├── core/
│   ├── motion/
│   │   ├── hooks/
│   │   │   ├── useLenis.ts
│   │   │   ├── useScrollVelocitySkew.ts
│   │   │   └── useReducedMotion.ts
│   │   ├── components/
│   │   │   ├── MotionProvider.tsx    # Wraps children, inits Lenis once
│   │   │   └── SplitReveal.tsx
│   │   ├── utils/gsap.ts             # registers ScrollTrigger + SplitText
│   │   └── index.ts
│   ├── seo/
│   │   ├── config/
│   │   │   ├── site.config.ts        # SITE_URL, defaults
│   │   │   └── person.config.ts      # Person JSON-LD data
│   │   ├── utils/
│   │   │   ├── buildMetadata.ts
│   │   │   └── buildPersonJsonLd.ts
│   │   └── index.ts
│   ├── theme/
│   │   ├── components/
│   │   │   └── ThemeProvider.tsx     # wraps next-themes
│   │   └── index.ts
│   └── accessibility/
│       ├── components/SkipLink.tsx
│       └── index.ts
├── features/
│   ├── home/
│   │   ├── components/
│   │   │   ├── Hero.tsx
│   │   │   ├── Work.tsx
│   │   │   ├── WorkRow.tsx
│   │   │   ├── CaseStudyDrawer.tsx
│   │   │   ├── Experience.tsx
│   │   │   ├── Education.tsx
│   │   │   ├── Certifications.tsx
│   │   │   ├── Stack.tsx
│   │   │   └── Contact.tsx
│   │   ├── config/
│   │   │   ├── work.config.ts
│   │   │   ├── experience.config.ts
│   │   │   ├── certifications.config.ts
│   │   │   ├── stack.config.ts
│   │   │   └── socials.config.ts
│   │   ├── translations/{en,ar}/pages.json
│   │   ├── types/
│   │   │   ├── work.types.ts
│   │   │   ├── experience.types.ts
│   │   │   ├── certifications.types.ts
│   │   │   └── stack.types.ts
│   │   ├── __tests__/
│   │   └── index.ts
│   ├── hero-3d/
│   │   ├── components/Hero3D.tsx
│   │   ├── components/Hero3DCanvas.tsx
│   │   └── index.ts
│   ├── ui-components/
│   │   ├── components/
│   │   │   ├── CustomCursor.tsx
│   │   │   ├── ScrollProgress.tsx
│   │   │   ├── TopNav.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── PageLoader.tsx
│   │   │   ├── Magnetic.tsx
│   │   │   ├── MaskReveal.tsx
│   │   │   ├── Reveal.tsx
│   │   │   ├── SectionHead.tsx
│   │   │   ├── AvailabilityPill.tsx
│   │   │   └── LiveClock.tsx
│   │   ├── translations/{en,ar}/ui.json
│   │   ├── __tests__/
│   │   └── index.ts
│   ├── contact-form/
│   │   ├── components/ContactForm.tsx
│   │   ├── components/Field.tsx
│   │   ├── types/contact.schema.ts
│   │   ├── utils/buildMailto.ts
│   │   ├── translations/{en,ar}/contact.json
│   │   ├── __tests__/
│   │   └── index.ts
│   └── localization/
│       ├── components/LocaleSwitcher.tsx
│       ├── translations/{en,ar}/locale.json
│       └── index.ts
├── i18n/
│   ├── config.ts                     # SUPPORTED_LOCALES, DEFAULT_LOCALE, directions
│   ├── routing.ts                    # next-intl routing + nav re-exports
│   └── request.ts                    # server-side message loader
├── components/ui/                    # shadcn/ui (only if needed; minimal at start)
├── lib/
│   └── utils.ts                      # cn()
├── public/
│   ├── resume.pdf
│   ├── og-image.png
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   └── icon.svg
├── e2e/
│   ├── home.spec.ts
│   ├── theme.spec.ts
│   ├── locale.spec.ts
│   └── contact.spec.ts
├── middleware.ts                     # next-intl middleware
├── next.config.ts
├── tsconfig.json
├── tailwind.config is unused in v4    # tokens live in app/globals.css @theme
├── vitest.config.ts
├── vitest.setup.ts
├── playwright.config.ts
├── .prettierrc
├── .prettierignore
├── eslint.config.mjs
├── .env.example
├── README.md
└── package.json
```

---

## Phase 0 — Preserve & scaffold

### Task 1: Archive the legacy build

**Files:**
- Modify: filesystem layout — move existing root files into `legacy/`
- Create: `legacy/README.md`

- [ ] **Step 1: Make legacy directory and move artifacts**

```bash
mkdir -p legacy
git mv Portfolio.html legacy/Portfolio.html
git mv src legacy/src
git mv .thumbnail legacy/.thumbnail
```

- [ ] **Step 2: Move existing project README to legacy**

```bash
git mv README.md legacy/README.md
```

- [ ] **Step 3: Verify**

```bash
ls legacy/
# Expected: Portfolio.html .thumbnail README.md src
ls
# Expected: only .claude .git .gitignore docs legacy
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: archive static React build to legacy/

Preserves the original Babel-in-browser portfolio under legacy/ as a
reference for the Next.js port. No code changes — pure rename."
```

### Task 2: Initialize Next.js 16

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `eslint.config.mjs`, `.gitignore` additions
- Modify: `.gitignore`

- [ ] **Step 1: Scaffold via create-next-app into current directory**

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --import-alias "@/*" --no-src-dir --turbopack --use-pnpm
```

Choose **No** for any prompt that would overwrite `.claude/` or `.git/`. If create-next-app refuses because the directory is non-empty, run with `--yes` and resolve conflicts manually for the files it expects to create.

- [ ] **Step 2: Verify scaffold output**

```bash
ls
# Expected (among others): app eslint.config.mjs next.config.ts package.json tsconfig.json
cat package.json | grep '"next"'
# Expected: a 16.x version
```

- [ ] **Step 3: Append entries to .gitignore**

Append to `.gitignore`:

```
# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Env
.env*.local
.env.production

# Vercel
.vercel

# Typescript
*.tsbuildinfo
next-env.d.ts

# Test artifacts
/coverage
/playwright-report
/test-results
/blob-report
/playwright/.cache
```

- [ ] **Step 4: Smoke test**

```bash
pnpm dev
# Expected: server starts on http://localhost:3000 with default Next.js page
# Stop with Ctrl+C
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 16 + App Router + TS + Tailwind"
```

### Task 3: Install runtime dependencies

**Files:**
- Modify: `package.json` (via pnpm)

- [ ] **Step 1: Install runtime deps**

```bash
pnpm add next-intl next-themes framer-motion gsap lenis three react-hook-form zod @hookform/resolvers clsx tailwind-merge class-variance-authority
```

- [ ] **Step 2: Install dev deps**

```bash
pnpm add -D @types/three vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom jest-axe @types/jest-axe @playwright/test prettier prettier-plugin-tailwindcss @next/bundle-analyzer
```

- [ ] **Step 3: Verify versions**

```bash
pnpm list next next-intl next-themes framer-motion gsap lenis three
# Expected: next >=16.0.0, next-intl >=4.0.0, framer-motion >=11, gsap >=3.13, lenis >=1.1, three >=0.149
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install runtime and dev dependencies"
```

### Task 4: Update package.json scripts and prettier config

**Files:**
- Modify: `package.json`
- Create: `.prettierrc`, `.prettierignore`

- [ ] **Step 1: Replace the `scripts` block in package.json**

Set `scripts` to:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "lint:fix": "next lint --fix",
  "type-check": "tsc --noEmit",
  "format": "prettier --write \"**/*.{ts,tsx,js,jsx,mjs,cjs,json,css,md}\"",
  "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,mjs,cjs,json,css,md}\"",
  "test": "vitest",
  "test:coverage": "vitest --coverage",
  "test:e2e": "playwright test",
  "analyze": "ANALYZE=true next build",
  "prebuild": "pnpm lint && pnpm format:check && pnpm type-check"
}
```

- [ ] **Step 2: Create .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 3: Create .prettierignore**

```
.next
node_modules
pnpm-lock.yaml
public
legacy
.claude
docs
coverage
playwright-report
test-results
```

- [ ] **Step 4: Verify**

```bash
pnpm format:check
# Expected: PASS (or some files reformatted to spec)
pnpm type-check
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add package.json .prettierrc .prettierignore pnpm-lock.yaml
git commit -m "chore: configure prettier and pnpm scripts (lint/format/test/build)"
```

---

## Phase 1 — Foundation

### Task 5: Configure design tokens in app/globals.css

**Files:**
- Modify: `app/globals.css` (replace default content)

The legacy stylesheet (see `legacy/Portfolio.html:96-485`) defines CSS variables for both themes — port them into Tailwind v4's `@theme` directive so Tailwind generates utility classes like `text-ink`, `bg-bg`, `border-line`, etc.

- [ ] **Step 1: Write app/globals.css**

```css
@import 'tailwindcss';

@theme {
  --color-ink: rgb(237 237 237);
  --color-inkdim: rgb(163 163 163);
  --color-inkmute: rgb(92 92 92);
  --color-bg: rgb(10 10 10);
  --color-bg2: rgb(17 17 17);
  --color-line: rgb(31 31 31);
  --color-amber: rgb(212 165 116);
  --color-amberhi: rgb(230 189 140);

  --font-serif: var(--font-instrument-serif), ui-serif, Georgia, serif;
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, monospace;
}

:root,
:root[data-theme='dark'] {
  --grain-opacity: 0.06;
  --grain-blend: overlay;
  --vignette: radial-gradient(120% 80% at 50% -10%, rgba(212, 165, 116, 0.06), transparent 60%);
  --cursor-blend: difference;
  color-scheme: dark;
}

:root[data-theme='light'] {
  --color-ink: 22 19 16;
  --color-inkdim: 94 87 77;
  --color-inkmute: 155 147 136;
  --color-bg: 244 241 234;
  --color-bg2: 235 230 220;
  --color-line: 216 209 195;
  --color-amber: 160 108 42;
  --color-amberhi: 131 86 25;
  --grain-opacity: 0.045;
  --grain-blend: multiply;
  --vignette: radial-gradient(120% 80% at 50% -10%, rgba(160, 108, 42, 0.1), transparent 60%);
  --cursor-blend: difference;
  color-scheme: light;
}

html,
body {
  background: var(--color-bg);
  color: var(--color-ink);
  transition:
    background-color 400ms ease,
    color 400ms ease;
}

body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: var(--color-amber);
  color: var(--color-bg);
}

:focus-visible {
  outline: 2px solid var(--color-amber);
  outline-offset: 3px;
  border-radius: 4px;
}

@media (hover: hover) and (pointer: fine) {
  a,
  button,
  [data-magnetic] {
    cursor: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

Then port the remaining named styles from `legacy/Portfolio.html:96-485` (`.grain`, `.section-num`, `.mask-line`, `.btn-*`, `.work-row`, `.theme-toggle`, `.locale-toggle`, `#page-loader`, `.cursor-ring`, `.cursor-dot`, `.cursor-label`, `.vignette::before`, `.reveal-up`, `.bg-spotlight`, `.split-host`, `.split-line`, `.split-char`, `.split-word`, `.lenis.*`, `.marquee-logo`, `.title-underline`, `.no-scrollbar`, `.truncate-fade`, the print stylesheet, the skip-link) verbatim into `app/globals.css` — these are presentation primitives reused by multiple sections.

- [ ] **Step 2: Verify Tailwind classes generate**

```bash
pnpm dev
# Open http://localhost:3000 — confirm dark background, light text on the default page
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(theme): port design tokens and presentation primitives to globals.css"
```

### Task 6: Configure fonts via next/font/google

**Files:**
- Create: `app/fonts.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create app/fonts.ts**

```typescript
import { Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google';

export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-instrument-serif',
});

export const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});
```

- [ ] **Step 2: Apply variables on root <html>**

Replace `app/layout.tsx` body:

```tsx
import type { Metadata } from 'next';
import { instrumentSerif, inter, jetbrainsMono } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Verify**

```bash
pnpm dev
# Open DevTools → Network → Fonts: should see Google fonts proxied through /_next/static/media
```

- [ ] **Step 4: Commit**

```bash
git add app/fonts.ts app/layout.tsx
git commit -m "feat(fonts): load Instrument Serif, Inter, JetBrains Mono via next/font"
```

### Task 7: i18n config and routing helpers

**Files:**
- Create: `i18n/config.ts`, `i18n/routing.ts`, `i18n/request.ts`
- Create: `middleware.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Create i18n/config.ts**

```typescript
export const SUPPORTED_LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_DIRECTIONS: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
```

- [ ] **Step 2: Create i18n/routing.ts**

```typescript
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from './config';

export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

- [ ] **Step 3: Create i18n/request.ts**

```typescript
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const [home, ui, contact, locales] = await Promise.all([
    import(`../features/home/translations/${locale}/pages.json`),
    import(`../features/ui-components/translations/${locale}/ui.json`),
    import(`../features/contact-form/translations/${locale}/contact.json`),
    import(`../features/localization/translations/${locale}/locale.json`),
  ]);

  return {
    locale,
    messages: {
      home: home.default,
      ui: ui.default,
      contact: contact.default,
      locale: locales.default,
    },
  };
});
```

- [ ] **Step 4: Create middleware.ts**

```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

- [ ] **Step 5: Modify next.config.ts**

```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

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
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/Portfolio.html',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default analyzer(withNextIntl(nextConfig));
```

- [ ] **Step 6: Commit**

```bash
git add i18n middleware.ts next.config.ts
git commit -m "feat(i18n): configure next-intl routing, middleware, and request loader"
```

### Task 8: Create empty translation namespaces (placeholders to unblock i18n loading)

**Files:**
- Create: `features/home/translations/{en,ar}/pages.json`
- Create: `features/ui-components/translations/{en,ar}/ui.json`
- Create: `features/contact-form/translations/{en,ar}/contact.json`
- Create: `features/localization/translations/{en,ar}/locale.json`

- [ ] **Step 1: Create all 8 placeholder files**

```bash
mkdir -p features/home/translations/en features/home/translations/ar
mkdir -p features/ui-components/translations/en features/ui-components/translations/ar
mkdir -p features/contact-form/translations/en features/contact-form/translations/ar
mkdir -p features/localization/translations/en features/localization/translations/ar
for f in features/home/translations/en/pages.json features/home/translations/ar/pages.json \
         features/ui-components/translations/en/ui.json features/ui-components/translations/ar/ui.json \
         features/contact-form/translations/en/contact.json features/contact-form/translations/ar/contact.json \
         features/localization/translations/en/locale.json features/localization/translations/ar/locale.json; do
  echo '{}' > "$f"
done
```

These files will be filled per-feature as their components are ported (Phase 2). The full English keys come from `legacy/Portfolio.html:540-700` (the `I18N_EN` dictionary) — partition them by namespace as the relevant feature is ported.

- [ ] **Step 2: Commit**

```bash
git add features/*/translations
git commit -m "chore(i18n): create empty translation namespaces"
```

### Task 9: Move app router from app/ to app/[locale]/

**Files:**
- Delete: `app/page.tsx` (the scaffold home page)
- Create: `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `app/[locale]/ClientProviders.tsx`, `app/[locale]/not-found.tsx`, `app/not-found.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Delete the scaffold page**

```bash
rm app/page.tsx
```

- [ ] **Step 2: Create app/[locale]/ClientProviders.tsx**

```tsx
'use client';

import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import type { AbstractIntlMessages } from 'next-intl';

interface ClientProvidersProps {
  locale: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
}

export function ClientProviders({ locale, messages, children }: ClientProvidersProps) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 3: Create app/[locale]/layout.tsx**

```tsx
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { LOCALE_DIRECTIONS, SUPPORTED_LOCALES, isLocale } from '@/i18n/config';
import { ClientProviders } from './ClientProviders';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
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
    <ClientProviders locale={locale} messages={messages}>
      <div lang={locale} dir={dir}>
        {children}
      </div>
    </ClientProviders>
  );
}
```

Note: setting `lang`/`dir` on a wrapper `<div>` is intentional — the root `<html>` doesn't have locale context. Tailwind's `rtl:` variant works against the closest `[dir]` ancestor, so wrapping at this level is sufficient.

- [ ] **Step 4: Create app/[locale]/page.tsx (temporary placeholder)**

```tsx
import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/config';
import { notFound } from 'next/navigation';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <main id="main" className="min-h-dvh grid place-items-center">
      <p className="font-serif text-4xl">Portfolio scaffold — locale: {locale}</p>
    </main>
  );
}
```

- [ ] **Step 5: Create app/[locale]/not-found.tsx**

```tsx
import { Link } from '@/i18n/routing';

export default function NotFound() {
  return (
    <main className="min-h-dvh grid place-items-center px-6 text-center">
      <div>
        <h1 className="font-serif text-6xl mb-4">404</h1>
        <p className="text-inkdim mb-6">The page you are looking for does not exist.</p>
        <Link href="/" className="underline underline-offset-4">
          Back home
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Create app/not-found.tsx**

```tsx
export default function GlobalNotFound() {
  return (
    <html>
      <body>
        <main className="min-h-dvh grid place-items-center px-6 text-center">
          <div>
            <h1 className="font-serif text-6xl mb-4">404</h1>
            <p>Not found</p>
          </div>
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Smoke test both locales**

```bash
pnpm dev
# Open http://localhost:3000 — should redirect to /en
# Open http://localhost:3000/ar — should render with dir="rtl"
```

- [ ] **Step 8: Commit**

```bash
git add app i18n
git commit -m "feat(routing): mount app under [locale] with next-intl + ThemeProvider"
```

### Task 10: lib/utils with cn()

**Files:**
- Create: `lib/utils.ts`

- [ ] **Step 1: Write lib/utils.ts**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/utils.ts
git commit -m "feat(lib): add cn() utility for class merging"
```

### Task 11: Test infrastructure

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `__tests__/lib/cn.test.ts`

- [ ] **Step 1: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
```

Install `@vitejs/plugin-react` as well: `pnpm add -D @vitejs/plugin-react`

- [ ] **Step 2: Create vitest.setup.ts**

```typescript
import '@testing-library/jest-dom/vitest';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from 'jest-axe/extend-expect';
import { expect } from 'vitest';

expect.extend(matchers as never);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as never;
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as never;
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('next-intl', async () => {
  const actual = await vi.importActual<typeof import('next-intl')>('next-intl');
  return {
    ...actual,
    useTranslations:
      (namespace?: string) =>
      (key: string) =>
        namespace ? `${namespace}.${key}` : key,
    useLocale: () => 'en',
  };
});

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, ...props }: { children: React.ReactNode }) =>
    Object.assign(document.createElement('a'), props, { textContent: children?.toString() ?? '' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  redirect: vi.fn(),
}));
```

- [ ] **Step 3: Create playwright.config.ts**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

- [ ] **Step 4: Create __tests__/lib/cn.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('merges conflicting tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
```

- [ ] **Step 5: Run the test**

```bash
pnpm test -- --run
# Expected: 3 passed
```

- [ ] **Step 6: Install playwright browsers**

```bash
npx playwright install --with-deps chromium
```

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts vitest.setup.ts playwright.config.ts __tests__ package.json pnpm-lock.yaml
git commit -m "feat(test): configure Vitest + jest-axe + Playwright"
```

---

## Phase 2 — Core utilities (motion, theme, accessibility)

### Task 12: core/motion — Lenis, GSAP registration, useReducedMotion

**Files:**
- Create: `core/motion/utils/gsap.ts`, `core/motion/hooks/useReducedMotion.ts`, `core/motion/hooks/useLenis.ts`, `core/motion/components/MotionProvider.tsx`, `core/motion/index.ts`

- [ ] **Step 1: gsap registration**

`core/motion/utils/gsap.ts`:

```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

let registered = false;

export function registerGsapPlugins() {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
}

export { gsap, ScrollTrigger, SplitText };
```

- [ ] **Step 2: useReducedMotion hook**

`core/motion/hooks/useReducedMotion.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
```

- [ ] **Step 3: useLenis hook**

`core/motion/hooks/useLenis.ts`:

```typescript
'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger, registerGsapPlugins } from '../utils/gsap';

export function useLenis(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    registerGsapPlugins();
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', () => ScrollTrigger.update());

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, [enabled]);
}
```

- [ ] **Step 4: MotionProvider component**

`core/motion/components/MotionProvider.tsx`:

```tsx
'use client';

import { useLenis } from '../hooks/useLenis';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

interface MotionProviderProps {
  children: ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  const reduced = useReducedMotion();
  useLenis(!reduced);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
```

- [ ] **Step 5: Barrel index**

`core/motion/index.ts`:

```typescript
export { MotionProvider } from './components/MotionProvider';
export { useReducedMotion } from './hooks/useReducedMotion';
export { useLenis } from './hooks/useLenis';
export { gsap, ScrollTrigger, SplitText, registerGsapPlugins } from './utils/gsap';
```

- [ ] **Step 6: Mount MotionProvider in ClientProviders**

Edit `app/[locale]/ClientProviders.tsx`, wrap `NextIntlClientProvider` children with `<MotionProvider>`:

```tsx
'use client';

import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import { MotionProvider } from '@/core/motion';
import type { ReactNode } from 'react';
import type { AbstractIntlMessages } from 'next-intl';

interface ClientProvidersProps {
  locale: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
}

export function ClientProviders({ locale, messages, children }: ClientProvidersProps) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <MotionProvider>{children}</MotionProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 7: Smoke test**

```bash
pnpm dev
# Scroll page — Lenis smooth scroll should be active
# Toggle "prefers-reduced-motion: reduce" in DevTools → no Lenis behavior, native scroll
```

- [ ] **Step 8: Commit**

```bash
git add core/motion app/[locale]/ClientProviders.tsx
git commit -m "feat(motion): add Lenis + GSAP setup with reduced-motion gating"
```

### Task 13: core/seo — metadata and JSON-LD builders

**Files:**
- Create: `core/seo/config/site.config.ts`, `core/seo/config/person.config.ts`, `core/seo/utils/buildMetadata.ts`, `core/seo/utils/buildPersonJsonLd.ts`, `core/seo/index.ts`

- [ ] **Step 1: Site config**

`core/seo/config/site.config.ts`:

```typescript
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paulamagdy.com';
export const SITE_NAME = 'Paula Magdy';
export const SITE_TWITTER = '@paulamagdy';
export const OG_IMAGE = '/og-image.png';
```

- [ ] **Step 2: Person JSON-LD config**

`core/seo/config/person.config.ts`:

```typescript
import { SITE_URL } from './site.config';

export const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Paula Magdy',
  jobTitle: 'Software Engineer',
  url: SITE_URL,
  image: `${SITE_URL}/og-image.png`,
  email: 'mailto:paulamagdy665@gmail.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Cairo',
    addressCountry: 'EG',
  },
  knowsAbout: [
    'Next.js',
    'NestJS',
    'TypeScript',
    'PostgreSQL',
    'AWS',
    'Software Architecture',
    'Domain-Driven Design',
  ],
  sameAs: [
    'https://github.com/paula-magdy',
    'https://www.linkedin.com/in/paula-magdy/',
  ],
} as const;
```

(Adjust the `sameAs` and `email` to the actual values from `legacy/src/sections.jsx:1013-1020` — `SOCIALS` array and `RECIPIENT_EMAIL`.)

- [ ] **Step 3: buildMetadata helper**

`core/seo/utils/buildMetadata.ts`:

```typescript
import type { Metadata } from 'next';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/config';
import { SITE_NAME, SITE_TWITTER, SITE_URL, OG_IMAGE } from '../config/site.config';

interface BuildMetadataInput {
  locale: Locale;
  title: string;
  description: string;
  path?: string;
}

export function buildMetadata({ locale, title, description, path = '' }: BuildMetadataInput): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`]),
  ) as Record<Locale, string>;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: { ...languages, 'x-default': `${SITE_URL}/en${path}` },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: SITE_NAME,
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: SITE_TWITTER,
      images: [OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  };
}
```

- [ ] **Step 4: buildPersonJsonLd**

`core/seo/utils/buildPersonJsonLd.ts`:

```typescript
import { PERSON_JSON_LD } from '../config/person.config';

export function buildPersonJsonLd(): string {
  return JSON.stringify(PERSON_JSON_LD);
}
```

- [ ] **Step 5: Barrel**

`core/seo/index.ts`:

```typescript
export { buildMetadata } from './utils/buildMetadata';
export { buildPersonJsonLd } from './utils/buildPersonJsonLd';
export { SITE_URL, SITE_NAME, OG_IMAGE } from './config/site.config';
```

- [ ] **Step 6: Wire generateMetadata in app/[locale]/layout.tsx**

Add to `app/[locale]/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildMetadata, buildPersonJsonLd } from '@/core/seo';
import { isLocale } from '@/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'home.meta' });
  return buildMetadata({
    locale,
    title: t('title'),
    description: t('description'),
  });
}
```

And inside the layout body, emit the JSON-LD script:

```tsx
return (
  <ClientProviders locale={locale} messages={messages}>
    <div lang={locale} dir={dir}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildPersonJsonLd() }}
      />
      {children}
    </div>
  </ClientProviders>
);
```

- [ ] **Step 7: Add the meta translation keys**

`features/home/translations/en/pages.json`:

```json
{
  "meta": {
    "title": "Paula Magdy — Software Engineer",
    "description": "Paula Magdy — Software Engineer based in Cairo. Building government-grade platforms on Next.js, NestJS, AWS, and PostgreSQL. Available for senior full-stack roles and consulting."
  }
}
```

`features/home/translations/ar/pages.json`:

```json
{
  "meta": {
    "title": "بولا مجدي — مهندسة برمجيات",
    "description": "بولا مجدي — مهندسة برمجيات مقيمة في القاهرة. أبني منصات بمعايير حكومية باستخدام Next.js وNestJS وAWS وPostgreSQL. متاحة للأدوار الكاملة في تطوير البرمجيات والاستشارات."
  }
}
```

- [ ] **Step 8: Verify**

```bash
pnpm build
# Expected: build succeeds, generates static pages for /en and /ar
# Open http://localhost:3000/en — View Source → confirm <title>, <meta name="description">, JSON-LD <script>, alternate language links
```

- [ ] **Step 9: Commit**

```bash
git add core/seo app/[locale]/layout.tsx features/home/translations
git commit -m "feat(seo): wire per-locale metadata + Person JSON-LD"
```

### Task 14: core/accessibility — SkipLink

**Files:**
- Create: `core/accessibility/components/SkipLink.tsx`, `core/accessibility/index.ts`

- [ ] **Step 1: SkipLink component**

`core/accessibility/components/SkipLink.tsx`:

```tsx
import { useTranslations } from 'next-intl';

export function SkipLink() {
  const t = useTranslations('ui.a11y');
  return (
    <a href="#main" className="skip-link">
      {t('skipToContent')}
    </a>
  );
}
```

Mark with `'use client'` only if `useTranslations` requires it in your usage; in a server component, switch to `getTranslations`. Easiest is to keep as server component:

```tsx
import { getTranslations } from 'next-intl/server';

export async function SkipLink() {
  const t = await getTranslations('ui.a11y');
  return (
    <a href="#main" className="skip-link">
      {t('skipToContent')}
    </a>
  );
}
```

- [ ] **Step 2: Barrel**

```typescript
export { SkipLink } from './components/SkipLink';
```

- [ ] **Step 3: Add translation key**

`features/ui-components/translations/en/ui.json`:

```json
{
  "a11y": {
    "skipToContent": "Skip to content"
  }
}
```

`features/ui-components/translations/ar/ui.json`:

```json
{
  "a11y": {
    "skipToContent": "تخطّي إلى المحتوى"
  }
}
```

- [ ] **Step 4: Mount in app/[locale]/layout.tsx**

Add `<SkipLink />` as the first child inside the `<div lang dir>`.

- [ ] **Step 5: Commit**

```bash
git add core/accessibility app/[locale]/layout.tsx features/ui-components/translations
git commit -m "feat(a11y): add skip-to-content link"
```

---

## Phase 3 — UI chrome (ui-components feature)

### Task 15: SectionHead, Reveal, MaskReveal, SplitReveal, Magnetic — animation primitives

**Files:**
- Create: `features/ui-components/components/{SectionHead,Reveal,MaskReveal,SplitReveal,Magnetic}.tsx`
- Modify: `features/ui-components/components/index.ts`, `features/ui-components/index.ts`

These mirror the helpers in `legacy/src/components.jsx:275-376` and `legacy/src/motion.jsx`.

- [ ] **Step 1: Reveal**

`features/ui-components/components/Reveal.tsx`:

```tsx
'use client';

import { motion, type Variants } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: ElementType;
}

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function Reveal({ children, delay = 0, y = 24, className = '', as = 'div' }: RevealProps) {
  const Component = motion[as as 'div'] ?? motion.div;
  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] }}
      variants={{ ...variants, hidden: { ...variants.hidden, y } }}
      className={className}
    >
      {children}
    </Component>
  );
}
```

- [ ] **Step 2: MaskReveal**

`features/ui-components/components/MaskReveal.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface MaskRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function MaskReveal({ children, delay = 0, className = '' }: MaskRevealProps) {
  return (
    <span className={`mask-line ${className}`}>
      <motion.span
        initial={{ y: '110%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] }}
        className="mask-inner"
      >
        {children}
      </motion.span>
    </span>
  );
}
```

- [ ] **Step 3: SplitReveal (GSAP SplitText)**

`features/ui-components/components/SplitReveal.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap, SplitText, ScrollTrigger, registerGsapPlugins } from '@/core/motion';
import type { ElementType, ReactNode } from 'react';

interface SplitRevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  stagger?: number;
  duration?: number;
}

export function SplitReveal({
  children,
  as: Component = 'h2',
  className = '',
  stagger = 0.018,
  duration = 0.95,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGsapPlugins();
    if (!ref.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const split = new SplitText(ref.current, { type: 'lines,chars', linesClass: 'split-line' });
    const tween = gsap.from(split.chars, {
      yPercent: 110,
      duration,
      ease: 'power3.out',
      stagger,
      scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
    });

    return () => {
      tween.kill();
      split.revert();
      ScrollTrigger.getAll()
        .filter((t) => t.trigger === ref.current)
        .forEach((t) => t.kill());
    };
  }, [duration, stagger]);

  return (
    <Component ref={ref as never} className={`split-host ${className}`}>
      {children}
    </Component>
  );
}
```

- [ ] **Step 4: Magnetic, SectionHead**

`features/ui-components/components/Magnetic.tsx`:

```tsx
'use client';

import { useRef, type ElementType, type ReactNode } from 'react';

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: ElementType;
}

export function Magnetic({
  children,
  className = '',
  strength = 0.25,
  as: Component = 'button',
}: MagneticProps) {
  const ref = useRef<HTMLElement | null>(null);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const y = (e.clientY - (rect.top + rect.height / 2)) * strength;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = '';
  };

  return (
    <Component
      ref={ref as never}
      data-magnetic
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
    >
      {children}
    </Component>
  );
}
```

`features/ui-components/components/SectionHead.tsx`:

```tsx
import type { ReactNode } from 'react';

interface SectionHeadProps {
  num: string;
  label: string;
  kicker?: ReactNode;
  children?: ReactNode;
}

export function SectionHead({ num, label, kicker, children }: SectionHeadProps) {
  return (
    <header className="mb-10 md:mb-14">
      <div className="flex items-center gap-4 mb-3">
        <span className="section-num">{num}</span>
        <span className="h-rule" />
        <span className="section-num">{label}</span>
      </div>
      {kicker ? <div className="mt-2">{kicker}</div> : null}
      {children}
    </header>
  );
}
```

- [ ] **Step 5: Barrel**

`features/ui-components/components/index.ts`:

```typescript
export { Reveal } from './Reveal';
export { MaskReveal } from './MaskReveal';
export { SplitReveal } from './SplitReveal';
export { Magnetic } from './Magnetic';
export { SectionHead } from './SectionHead';
```

`features/ui-components/index.ts`:

```typescript
export * from './components';
```

- [ ] **Step 6: Smoke test (visual)**

Compose a test page snippet using `<Reveal>{...}</Reveal>` and confirm the fade-up triggers in viewport.

- [ ] **Step 7: Commit**

```bash
git add features/ui-components
git commit -m "feat(ui): add Reveal, MaskReveal, SplitReveal, Magnetic, SectionHead"
```

### Task 16: CustomCursor, ScrollProgress, LiveClock, AvailabilityPill

**Files:**
- Create: `features/ui-components/components/{CustomCursor,ScrollProgress,LiveClock,AvailabilityPill}.tsx`
- Modify: `features/ui-components/components/index.ts`

Direct ports from `legacy/src/components.jsx:6-114` and `:363-376`.

- [ ] **Step 1: CustomCursor**

Port `legacy/src/components.jsx:6-72` into a `'use client'` TSX component. The DOM hooks (mousemove, hover detection) move into `useEffect`. The component renders two divs (`<div className="cursor-ring">` and `<div className="cursor-dot">`) that follow the mouse. Hide on coarse pointer via the existing media query in `globals.css`.

`features/ui-components/components/CustomCursor.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let rafId = 0;

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx}px, ${ry}px)`;
      if (dotRef.current) dotRef.current.style.transform = `translate(${mx}px, ${my}px)`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!ringRef.current || !target) return;
      const interactive = target.closest('a, button, [data-magnetic]');
      ringRef.current.classList.toggle('hover', !!interactive);
      const labelEl = target.closest('[data-cursor-label]') as HTMLElement | null;
      if (labelEl?.dataset.cursorLabel) {
        ringRef.current.classList.add('labeled');
        ringRef.current.innerHTML = `<span class="cursor-label">${labelEl.dataset.cursorLabel}</span>`;
      } else {
        ringRef.current.classList.remove('labeled');
        ringRef.current.innerHTML = '';
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  );
}
```

- [ ] **Step 2: ScrollProgress**

Port `legacy/src/components.jsx:73-97`:

`features/ui-components/components/ScrollProgress.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? window.scrollY / max : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${pct})`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-px z-[70] bg-line"
    >
      <div ref={ref} className="origin-left h-full bg-amber" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
}
```

- [ ] **Step 3: LiveClock, AvailabilityPill**

Port `legacy/src/components.jsx:98-114` (LiveClock — Africa/Cairo formatter ticking every second) and `:363-376` (AvailabilityPill — pulsing dot + label).

- [ ] **Step 4: Barrel updates**

Add the 4 new exports to `features/ui-components/components/index.ts`.

- [ ] **Step 5: Smoke test**

Mount each in `app/[locale]/page.tsx` temporarily, then verify by scrolling and hovering.

- [ ] **Step 6: Tests**

`features/ui-components/__tests__/components/ScrollProgress.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ScrollProgress } from '@/features/ui-components';

describe('ScrollProgress', () => {
  it('renders a hidden progress track', () => {
    const { container } = render(<ScrollProgress />);
    const track = container.querySelector('div[aria-hidden]');
    expect(track).toBeInTheDocument();
  });
});
```

`features/ui-components/__tests__/components/ScrollProgress.accessibility.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ScrollProgress } from '@/features/ui-components';

describe('ScrollProgress accessibility', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<ScrollProgress />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 7: Commit**

```bash
git add features/ui-components
git commit -m "feat(ui): port CustomCursor, ScrollProgress, LiveClock, AvailabilityPill"
```

### Task 17: ThemeToggle + LocaleSwitcher

**Files:**
- Create: `features/ui-components/components/ThemeToggle.tsx`, `features/localization/components/LocaleSwitcher.tsx`, `features/localization/index.ts`
- Modify: `features/ui-components/components/index.ts`

- [ ] **Step 1: ThemeToggle (uses next-themes)**

`features/ui-components/components/ThemeToggle.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations('ui.theme');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
```

Add translation keys to `features/ui-components/translations/{en,ar}/ui.json` under `theme.switchToDark` / `theme.switchToLight`.

- [ ] **Step 2: LocaleSwitcher**

`features/localization/components/LocaleSwitcher.tsx`:

```tsx
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
```

Add `locale.groupLabel` translations.

- [ ] **Step 3: Barrels**

`features/localization/index.ts`:

```typescript
export { LocaleSwitcher } from './components/LocaleSwitcher';
```

Add `ThemeToggle` to `features/ui-components/components/index.ts`.

- [ ] **Step 4: Tests**

`features/ui-components/__tests__/components/ThemeToggle.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '@/features/ui-components';
import { ThemeProvider } from 'next-themes';

describe('ThemeToggle', () => {
  it('toggles between light and dark', async () => {
    render(
      <ThemeProvider attribute="data-theme" defaultTheme="dark">
        <ThemeToggle />
      </ThemeProvider>,
    );
    const button = await screen.findByRole('button');
    expect(button).toHaveAccessibleName(/switchToLight|switchToDark/);
    await userEvent.click(button);
  });
});
```

- [ ] **Step 5: Commit**

```bash
git add features/ui-components features/localization
git commit -m "feat(ui): ThemeToggle (next-themes) and LocaleSwitcher (next-intl)"
```

### Task 18: TopNav (composes ThemeToggle + LocaleSwitcher + nav links)

**Files:**
- Create: `features/ui-components/components/TopNav.tsx`
- Modify: `features/ui-components/components/index.ts`

Port `legacy/src/components.jsx:116-274` — a sticky nav with brand mark, in-page anchors (`#work`, `#experience`, `#contact`), the theme toggle, and the locale toggle. Use `useTranslations('ui.nav')` for labels.

- [ ] **Step 1: Write TopNav.tsx**

Structure:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from './ThemeToggle';
import { LocaleSwitcher } from '@/features/localization';
import { LiveClock } from './LiveClock';
import { cn } from '@/lib/utils';

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
        'fixed top-0 inset-x-0 z-[60] px-6 md:px-10 py-4 transition-colors',
        scrolled && 'backdrop-blur-md bg-bg/60 border-b border-line',
      )}
      aria-label={t('primary')}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
        <a href="#main" className="font-serif text-xl">
          Paula Magdy<span className="text-amber">.</span>
        </a>
        <ul className="hidden md:flex items-center gap-7 text-sm">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-inkdim hover:text-ink">
                {t(s.key)}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-xs font-mono text-inkmute">
            <LiveClock />
          </span>
          <LocaleSwitcher />
          <ThemeToggle />
          <button
            type="button"
            className="md:hidden font-mono text-xs uppercase tracking-widest"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? t('closeMenu') : t('openMenu')}
          </button>
        </div>
      </div>
      {menuOpen ? (
        <ul id="mobile-menu" className="md:hidden mt-4 grid gap-3 text-base">
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
```

- [ ] **Step 2: Add nav translations**

`features/ui-components/translations/en/ui.json` (merge):

```json
{
  "nav": {
    "primary": "Primary",
    "work": "Work",
    "experience": "Experience",
    "certifications": "Certifications",
    "stack": "Stack",
    "contact": "Contact",
    "openMenu": "Open menu",
    "closeMenu": "Close menu"
  }
}
```

Same keys in `ar/ui.json` with Arabic values.

- [ ] **Step 3: Commit**

```bash
git add features/ui-components
git commit -m "feat(ui): port TopNav with theme toggle and locale switcher"
```

### Task 19: PageLoader

**Files:**
- Create: `features/ui-components/components/PageLoader.tsx`
- Modify: `features/ui-components/components/index.ts`, `app/[locale]/layout.tsx`

Port `legacy/src/app.jsx:26-91` — the editorial splash that drives the counter, staged status text, and progress bar based on `document.fonts.ready` plus a minimum display time.

- [ ] **Step 1: PageLoader.tsx**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

export function PageLoader() {
  const t = useTranslations('ui.loader');
  const [done, setDone] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stages = [
      t('initializing'),
      t('loadingAssets'),
      t('loadingFonts'),
      t('compositing'),
      t('almostReady'),
    ];

    let pct = 0;
    let stageIdx = 0;
    let rafId = 0;
    let fontsReady = false;
    let cancelled = false;

    const apply = () => {
      if (counterRef.current) counterRef.current.textContent = String(Math.floor(pct)).padStart(2, '0');
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${pct / 100})`;
      const newStage = Math.min(stages.length - 1, Math.floor(pct / 22));
      if (newStage !== stageIdx && statusRef.current) {
        stageIdx = newStage;
        statusRef.current.style.opacity = '0';
        setTimeout(() => {
          if (cancelled || !statusRef.current) return;
          statusRef.current.textContent = stages[newStage];
          statusRef.current.style.opacity = '1';
        }, 180);
      }
    };
    apply();

    const tick = () => {
      if (cancelled) return;
      const target = fontsReady ? 100 : 92;
      const step = (target - pct) * 0.06 + 0.3;
      pct = Math.min(target, pct + step);
      apply();
      if (pct < 100) {
        rafId = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          if (!cancelled) {
            document.documentElement.classList.add('loaded');
            setDone(true);
          }
        }, 280);
      }
    };
    rafId = requestAnimationFrame(tick);

    const fontsPromise = document.fonts?.ready ?? Promise.resolve();
    Promise.all([fontsPromise, new Promise((r) => setTimeout(r, 900))]).then(() => {
      fontsReady = true;
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [t]);

  if (done) return null;

  return (
    <div id="page-loader" aria-hidden>
      <div className="pl-top">
        <span className="pl-name">
          Paula Magdy<span className="pl-dot">.</span>
        </span>
        <span ref={statusRef} className="pl-status">
          {t('initializing')}
        </span>
      </div>
      <div className="pl-center">
        <div className="pl-counter-wrap">
          <span ref={counterRef} className="pl-counter">
            00
          </span>
          <span className="pl-percent">%</span>
        </div>
      </div>
      <div className="pl-bottom">
        <span className="pl-meta">
          <span className="pl-pulse" />
          Portfolio · 2026
        </span>
        <span className="pl-progress">
          <span ref={fillRef} className="pl-progress-fill" />
        </span>
        <span className="pl-meta pl-locale">Cairo · EG</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add loader translations**

`features/ui-components/translations/en/ui.json` (merge):

```json
{
  "loader": {
    "initializing": "INITIALIZING",
    "loadingAssets": "LOADING ASSETS",
    "loadingFonts": "LOADING FONTS",
    "compositing": "COMPOSITING",
    "almostReady": "ALMOST READY"
  }
}
```

Same keys in `ar/ui.json` with Arabic values.

- [ ] **Step 3: Mount in layout**

Add `<PageLoader />` inside `app/[locale]/layout.tsx` before children, alongside `<SkipLink />`.

- [ ] **Step 4: Commit**

```bash
git add features/ui-components app/[locale]/layout.tsx
git commit -m "feat(ui): port editorial PageLoader"
```

---

## Phase 4 — Home page sections (features/home)

### Task 20: Section types and typed content config

**Files:**
- Create: `features/home/types/{work,experience,certifications,stack}.types.ts`, `features/home/config/{work,experience,certifications,stack,socials}.config.ts`, `features/home/types/index.ts`, `features/home/index.ts`

- [ ] **Step 1: Types**

`features/home/types/work.types.ts`:

```typescript
export interface WorkMetric {
  value: string;
  labelKey: string;
}

export interface WorkCaseStudy {
  role: string;
  problem: string;
  architecture: string;
  contributions: readonly string[];
}

export type WorkKind = 'live' | 'private';

export interface WorkProject {
  id: string;
  nameKey: string;
  companyKey: string;
  periodKey: string;
  blurbKey: string;
  metrics: readonly WorkMetric[];
  stack: readonly string[];
  swatch: readonly [string, string, string];
  kind: WorkKind;
  url?: string;
  badge: string;
  caseStudy: WorkCaseStudy;
}
```

Repeat with `experience`, `certifications`, `stack` types using the shape from `legacy/src/sections.jsx:160-295`, `:658-680`, `:770-878`, `:883-893`.

- [ ] **Step 2: Config files**

`features/home/config/work.config.ts`: define `WORK` array of `WorkProject` items. Replace inline English strings from the legacy file with `*Key` translation keys (`home.work.mie.name`, `home.work.mie.period`, etc.) and move the strings into `features/home/translations/{en,ar}/pages.json` under the `work` namespace. Keep `swatch`, `stack`, `id`, `url`, `kind`, `metrics[].value`, `caseStudy.contributions` as raw values — these aren't user-facing copy; some (contributions) are short enough to move to translations later. Start by translating the canonical English content; add Arabic translations during a later polish pass.

`features/home/config/experience.config.ts`, `certifications.config.ts`, `stack.config.ts`, `socials.config.ts`: same treatment.

- [ ] **Step 3: Barrel**

`features/home/index.ts`:

```typescript
export * from './components';
export * from './config';
export * from './types';
```

- [ ] **Step 4: Commit**

```bash
git add features/home/{types,config,index.ts}
git commit -m "feat(home): port content config (work, experience, certs, stack, socials) with typed schemas"
```

### Task 21: Hero (without 3D)

**Files:**
- Create: `features/home/components/Hero.tsx`, `features/home/components/AnimatedMetric.tsx`, `features/home/components/MetaCell.tsx`
- Modify: `features/home/translations/{en,ar}/pages.json`

Port `legacy/src/sections.jsx:55-159`. The hero is the LCP element — make as much of it server-rendered as possible. The animated metric counter and the MaskReveal headline are client. The 3D scene mounts via `next/dynamic` later (Task 22).

- [ ] **Step 1: Hero structure (server component)**

```tsx
import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { MaskReveal, Reveal, Magnetic } from '@/features/ui-components';
import { AnimatedMetric } from './AnimatedMetric';
import { MetaCell } from './MetaCell';

const Hero3D = dynamic(() => import('@/features/hero-3d').then((m) => m.Hero3D), { ssr: false });

export async function Hero() {
  const t = await getTranslations('home.hero');
  return (
    <section id="hero" className="relative px-6 md:px-10 pt-32 md:pt-36 pb-24 md:pb-32">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7">
          <Reveal>
            <div className="flex items-center gap-3 mb-8">
              <span className="section-num">{t('portfolio')}</span>
              <span className="text-amber w-2 h-2 rounded-full" aria-hidden />
              <span className="section-num">{t('availability')}</span>
            </div>
          </Reveal>
          <h1 className="font-serif text-[clamp(56px,9vw,160px)] leading-[0.95] tracking-[-0.02em]">
            <MaskReveal>{t('headline')}</MaskReveal>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-inkdim">
            <span>{t('descriptionLead')}</span>
            <em className="text-ink">{t('descriptionEmph')}</em>
          </p>
          <div className="mt-10 flex items-center gap-4">
            <Magnetic as="a" className="btn-base btn-primary">
              <a href="#work">{t('ctaWork')}</a>
            </Magnetic>
            <Magnetic as="a" className="btn-base btn-ghost">
              <a href="/resume.pdf" download>
                {t('ctaResume')}
              </a>
            </Magnetic>
          </div>
        </div>
        <div className="lg:col-span-5 relative aspect-[4/5] min-h-[420px]">
          <Hero3D />
        </div>
      </div>
      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
        <MetaCell label={t('meta.based')} value={t('meta.basedValue')} />
        <MetaCell label={t('meta.focus')} value={t('meta.focusValue')} />
        <MetaCell label={t('meta.years')} value={t('meta.yearsValue')} />
        <MetaCell label={t('meta.metric')} value={<AnimatedMetric value="−35%" />} />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: MetaCell**

```tsx
import type { ReactNode } from 'react';

export function MetaCell({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-t border-line pt-3">
      <span className="block section-num mb-1">{label}</span>
      <span className="text-ink text-lg font-serif">{value}</span>
    </div>
  );
}
```

- [ ] **Step 3: AnimatedMetric**

Port `legacy/src/sections.jsx:8-54` — counts up the numeric portion of the metric on viewport entry.

- [ ] **Step 4: Translations**

Add all `home.hero.*` keys to `features/home/translations/{en,ar}/pages.json`, sourced from `legacy/Portfolio.html:550-565` plus the meta cells.

- [ ] **Step 5: Wire Hero into the page**

Replace the placeholder body of `app/[locale]/page.tsx` with `<Hero />` (and later, other sections).

- [ ] **Step 6: Visual smoke test**

```bash
pnpm dev
# Open /en — hero text in place, CTA buttons clickable, no console errors
```

- [ ] **Step 7: Commit**

```bash
git add features/home app/[locale]/page.tsx
git commit -m "feat(home): port Hero with animated metric, meta cells, CTAs"
```

### Task 22: Hero 3D scene (lazy)

**Files:**
- Create: `features/hero-3d/components/Hero3D.tsx`, `features/hero-3d/components/Hero3DCanvas.tsx`, `features/hero-3d/index.ts`

Port `legacy/src/hero3d.jsx` — a Three.js scene (renderer, scene, camera, lights, geometry) initialized on mount and disposed on unmount.

- [ ] **Step 1: Hero3DCanvas (client)**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function Hero3DCanvas() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const mount = ref.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      35,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // ... port geometry / lights / material from legacy/src/hero3d.jsx
    // (omitted here for brevity — copy verbatim, then add types)

    let rafId = 0;
    const animate = () => {
      // ... animation logic from legacy
      renderer.render(scene, camera);
      if (!reduced) rafId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        const material = (obj as THREE.Mesh).material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else if (material) (material as THREE.Material).dispose();
      });
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={ref} className="absolute inset-0" />;
}
```

(Copy the geometry/lighting code from `legacy/src/hero3d.jsx` lines 1-206 — port to TypeScript by typing each variable.)

- [ ] **Step 2: Hero3D (wrapper that delegates to Canvas)**

```tsx
'use client';

import { Hero3DCanvas } from './Hero3DCanvas';

export function Hero3D() {
  return <Hero3DCanvas />;
}
```

- [ ] **Step 3: Barrel**

```typescript
export { Hero3D } from './components/Hero3D';
```

- [ ] **Step 4: Visual smoke test**

Open the hero in dev mode. Verify the 3D scene renders (or fails gracefully on a browser without WebGL).

- [ ] **Step 5: Commit**

```bash
git add features/hero-3d
git commit -m "feat(hero-3d): port Three.js scene, lazy-loaded via next/dynamic"
```

### Task 23: Work section + CaseStudyDrawer

**Files:**
- Create: `features/home/components/Work.tsx`, `features/home/components/WorkRow.tsx`, `features/home/components/CaseStudyDrawer.tsx`, `features/home/components/CSBlock.tsx`

Port `legacy/src/sections.jsx:300-657`.

- [ ] **Step 1: WorkRow**

Renders one row: project name, period, blurb, metrics, swatch, badge. On click for `kind === 'private'`, opens the CaseStudyDrawer; for `kind === 'live'`, opens the external URL in a new tab.

- [ ] **Step 2: CaseStudyDrawer**

Slide-in right drawer with a backdrop. Locks body scroll, closes on backdrop click / Escape. Uses `framer-motion` for slide animation.

```tsx
'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CSBlock } from './CSBlock';
import type { WorkProject } from '../types/work.types';

interface CaseStudyDrawerProps {
  project: WorkProject | null;
  onClose: () => void;
}

export function CaseStudyDrawer({ project, onClose }: CaseStudyDrawerProps) {
  const t = useTranslations('home.work.caseStudy');

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-[68]"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal
            aria-label={t('label')}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[640px] z-[70] bg-bg2 border-l border-line overflow-y-auto p-8 md:p-12"
            dir="auto"
          >
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-xs uppercase tracking-widest mb-8"
            >
              {t('close')}
            </button>
            <h2 className="font-serif text-3xl md:text-4xl mb-8">{project.id}</h2>
            <CSBlock label={t('role')}>{project.caseStudy.role}</CSBlock>
            <CSBlock label={t('problem')}>{project.caseStudy.problem}</CSBlock>
            <CSBlock label={t('architecture')}>{project.caseStudy.architecture}</CSBlock>
            <CSBlock label={t('contributions')} last>
              <ul className="space-y-3">
                {project.caseStudy.contributions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </CSBlock>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Work composer**

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SectionHead, Reveal, SplitReveal } from '@/features/ui-components';
import { WORK } from '../config/work.config';
import { WorkRow } from './WorkRow';
import { CaseStudyDrawer } from './CaseStudyDrawer';
import type { WorkProject } from '../types/work.types';

export function Work() {
  const t = useTranslations('home.work');
  const [active, setActive] = useState<WorkProject | null>(null);

  return (
    <section id="work" className="relative px-6 md:px-10 py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto">
        <SectionHead num="01" label={t('label')} />
        <Reveal>
          <SplitReveal as="h2" className="font-serif text-[40px] md:text-[56px] leading-tight mb-12">
            {t('intro1')}
            <em className="text-inkdim">{t('introEmph')}</em>
          </SplitReveal>
        </Reveal>
        <ol className="work-rows">
          {WORK.map((project, i) => (
            <WorkRow key={project.id} project={project} index={i} onOpen={setActive} />
          ))}
        </ol>
      </div>
      <CaseStudyDrawer project={active} onClose={() => setActive(null)} />
    </section>
  );
}
```

- [ ] **Step 4: Translations**

Add all `home.work.*` keys.

- [ ] **Step 5: Commit**

```bash
git add features/home
git commit -m "feat(home): port Work section with CaseStudyDrawer"
```

### Task 24: Experience, Education, Certifications, Stack

**Files:**
- Create: `features/home/components/{Experience,Education,Certifications,Stack}.tsx`

Port `legacy/src/sections.jsx:682-1012` — each section is a fairly direct port:

- **Experience** (`:682-732`): roles in a left/right grid with mono period markers.
- **Education** (`:735-767`): single education entry, B.Sc. CS & Information Systems.
- **Certifications** (`:809-878`): list of certs with logo, issuer, dates, credential id, skills.
- **Stack** (`:960-1012`): grouped by category (frontend/backend/databases/cloud/languages) with marquee logos.

- [ ] **Step 1: Implement each as a server component**

Each section follows the same pattern: `getTranslations('home.<section>')`, map over the config array, use `<SectionHead>` + `<Reveal>` + `<SplitReveal>`. Mark components `'use client'` ONLY if they use hooks (none of these four do — they're presentational).

- [ ] **Step 2: Add per-section translations**

Move legacy `experience.*`, `education.*`, `certs.*`, `stack.*` keys into `features/home/translations/{en,ar}/pages.json`.

- [ ] **Step 3: Wire all four into the home page**

`app/[locale]/page.tsx`:

```tsx
import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/config';
import { notFound } from 'next/navigation';
import { Hero, Work, Experience, Education, Certifications, Stack, Contact } from '@/features/home';
import { TopNav, CustomCursor, ScrollProgress, PageLoader } from '@/features/ui-components';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <>
      <PageLoader />
      <CustomCursor />
      <ScrollProgress />
      <TopNav />
      <main id="main" className="relative z-10">
        <Hero />
        <Work />
        <Experience />
        <Education />
        <Certifications />
        <Stack />
        <Contact />
      </main>
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add features/home app/[locale]/page.tsx
git commit -m "feat(home): port Experience, Education, Certifications, Stack sections"
```

### Task 25: Contact form

**Files:**
- Create: `features/contact-form/types/contact.schema.ts`, `features/contact-form/utils/buildMailto.ts`, `features/contact-form/components/Field.tsx`, `features/contact-form/components/ContactForm.tsx`, `features/contact-form/index.ts`
- Create: `features/home/components/Contact.tsx`

Port `legacy/src/sections.jsx:1023-1304`.

- [ ] **Step 1: Zod schema**

`features/contact-form/types/contact.schema.ts`:

```typescript
import { z } from 'zod';
import { useTranslations } from 'next-intl';

export const buildContactSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    name: z.string().min(1, t('errors.nameRequired')).max(80, t('errors.nameMax')),
    email: z.string().email(t('errors.emailInvalid')),
    message: z.string().min(10, t('errors.messageMin')).max(2000, t('errors.messageMax')),
  });

export type ContactFormValues = z.infer<ReturnType<typeof buildContactSchema>>;
```

- [ ] **Step 2: buildMailto util**

`features/contact-form/utils/buildMailto.ts`:

```typescript
import type { ContactFormValues } from '../types/contact.schema';

const RECIPIENT = 'paulamagdy665@gmail.com';

export function buildMailto({ name, email, message }: ContactFormValues): string {
  const subject = `Portfolio inquiry from ${name}`;
  const body = `${message}\n\n— ${name}\n${email}`;
  return `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
```

- [ ] **Step 3: Field component**

Mirror legacy `Field` (`legacy/src/sections.jsx:1023-1060`) — text input or textarea with floating label, error display.

- [ ] **Step 4: ContactForm**

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Field } from './Field';
import { buildContactSchema, type ContactFormValues } from '../types/contact.schema';
import { buildMailto } from '../utils/buildMailto';

export function ContactForm() {
  const t = useTranslations('contact');
  const schema = buildContactSchema(t);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: ContactFormValues) => {
    setStatus('sending');
    const url = buildMailto(values);
    window.location.href = url;
    setTimeout(() => setStatus('sent'), 200);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6">
      <Field
        id="name"
        label={t('formName')}
        placeholder={t('formNamePlaceholder')}
        {...register('name')}
        error={errors.name?.message}
      />
      <Field
        id="email"
        type="email"
        label={t('formEmail')}
        placeholder={t('formEmailPlaceholder')}
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
      <button type="submit" className="btn-base btn-primary w-fit">
        {status === 'sending' ? t('formSending') : status === 'sent' ? t('formSent') : t('formSend')}
      </button>
      <p className="text-xs font-mono text-inkmute">{t('formHelper')}</p>
    </form>
  );
}
```

- [ ] **Step 5: Contact section (server component wrapper)**

`features/home/components/Contact.tsx`:

```tsx
import { getTranslations } from 'next-intl/server';
import { SectionHead, Reveal, SplitReveal } from '@/features/ui-components';
import { ContactForm } from '@/features/contact-form';
import { SOCIALS } from '../config/socials.config';

export async function Contact() {
  const t = await getTranslations('home.contact');
  return (
    <section id="contact" className="relative px-6 md:px-10 py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto">
        <SectionHead num="06" label={t('label')} />
        <Reveal>
          <SplitReveal as="h2" className="font-serif text-[48px] md:text-[72px] leading-tight mb-12">
            {t('heading1')} <em className="text-inkdim">{t('heading2')}</em>
          </SplitReveal>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-7">
            <h3 className="font-serif text-2xl mb-4">{t('pitchHeading')}</h3>
            <p className="text-inkdim mb-8 max-w-[480px]">{t('pitchDescription')}</p>
            <ContactForm />
          </div>
          <aside className="md:col-span-5 grid gap-6 content-start">
            <div>
              <span className="section-num">{t('email')}</span>
              <a className="block mt-2 underline underline-offset-4">paulamagdy665@gmail.com</a>
            </div>
            <div>
              <span className="section-num">{t('elsewhere')}</span>
              <ul className="mt-2 space-y-1">
                {SOCIALS.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Add contact translations**

`features/contact-form/translations/en/contact.json`:

```json
{
  "formName": "Your name",
  "formEmail": "Email",
  "formMessage": "Message",
  "formNamePlaceholder": "Jane Doe",
  "formEmailPlaceholder": "you@company.com",
  "formMessagePlaceholder": "A few lines about what you're working on or the role you have in mind.",
  "formSend": "Send message",
  "formSending": "Opening mail…",
  "formSent": "Message ready",
  "formHelper": "Opens in your mail client",
  "errors": {
    "nameRequired": "Please enter your name.",
    "nameMax": "Name is too long.",
    "emailInvalid": "Please enter a valid email address.",
    "messageMin": "Message must be at least 10 characters.",
    "messageMax": "Message is too long."
  }
}
```

Arabic translations in `ar/contact.json`.

Add `home.contact.*` keys (label, heading1, heading2, pitchHeading, pitchDescription, email, elsewhere, etc.) to `features/home/translations/{en,ar}/pages.json`.

- [ ] **Step 7: Tests**

`features/contact-form/__tests__/utils/buildMailto.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildMailto } from '@/features/contact-form/utils/buildMailto';

describe('buildMailto', () => {
  it('builds a mailto URL with URL-encoded subject and body', () => {
    const url = buildMailto({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Hello & world',
    });
    expect(url).toMatch(/^mailto:paulamagdy665@gmail\.com\?/);
    expect(url).toContain(`subject=${encodeURIComponent('Portfolio inquiry from Jane Doe')}`);
    expect(url).toContain(encodeURIComponent('Hello & world'));
  });
});
```

- [ ] **Step 8: Commit**

```bash
git add features/contact-form features/home
git commit -m "feat(contact): port contact form with rhf+zod and mailto submission"
```

---

## Phase 5 — SEO and discoverability

### Task 26: sitemap.ts

**Files:**
- Create: `app/sitemap.ts`

- [ ] **Step 1: Write app/sitemap.ts**

```typescript
import type { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES } from '@/i18n/config';
import { SITE_URL } from '@/core/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return SUPPORTED_LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 1,
    alternates: {
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map((l) => [l, `${SITE_URL}/${l}`]),
      ),
    },
  }));
}
```

- [ ] **Step 2: Verify**

```bash
pnpm build
# Confirm app/sitemap.xml is generated; curl localhost:3000/sitemap.xml after pnpm start
```

- [ ] **Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat(seo): generate sitemap with hreflang alternates"
```

### Task 27: robots.ts

**Files:**
- Create: `app/robots.ts`

- [ ] **Step 1: Write**

```typescript
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/core/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add app/robots.ts
git commit -m "feat(seo): add robots.txt with sitemap pointer"
```

### Task 28: Open Graph image and resume

**Files:**
- Create: `public/og-image.png` (1200×630), `public/resume.pdf`, `public/favicon.ico`, `public/apple-touch-icon.png`, `public/icon.svg`

- [ ] **Step 1: Provide assets**

Copy/generate the og-image (1200×630), favicon set, and resume PDF into `public/`. Sources: the user's existing resume; design the OG image to match the editorial look (Instrument Serif "Paula Magdy" + tagline on amber/dark background).

If user doesn't have an OG image, generate one with the Next.js OG image API (`app/[locale]/opengraph-image.tsx`) using `ImageResponse`:

```tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Paula Magdy — Software Engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          color: '#ededed',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 96, lineHeight: 1.05 }}>
          Paula Magdy<span style={{ color: '#d4a574' }}>.</span>
        </div>
        <div style={{ marginTop: 24, fontSize: 36, color: '#a3a3a3' }}>
          Software Engineer · Cairo
        </div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add public app/[locale]/opengraph-image.tsx
git commit -m "feat(seo): add OG image generator, resume, favicons"
```

---

## Phase 6 — Testing and quality

### Task 29: E2E smoke tests

**Files:**
- Create: `e2e/home.spec.ts`, `e2e/locale.spec.ts`, `e2e/theme.spec.ts`, `e2e/contact.spec.ts`

- [ ] **Step 1: home.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test('home page loads in both locales', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.getByRole('heading', { name: /Software Engineer/i })).toBeVisible();

  await page.goto('/ar');
  await expect(page.locator('[dir="rtl"]')).toBeVisible();
});
```

- [ ] **Step 2: locale.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test('locale switcher rewrites URL', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('button', { name: 'AR' }).click();
  await expect(page).toHaveURL(/\/ar\/?$/);
});
```

- [ ] **Step 3: theme.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test('theme toggle persists across reload', async ({ page }) => {
  await page.goto('/en');
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  await page.getByRole('button', { name: /switchTo/i }).click();
  const after = await html.getAttribute('data-theme');
  expect(after).not.toBe(before);

  await page.reload();
  expect(await html.getAttribute('data-theme')).toBe(after);
});
```

- [ ] **Step 4: contact.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test('contact form produces a mailto link', async ({ page }) => {
  await page.goto('/en');
  await page.getByLabel('Your name').fill('Jane Doe');
  await page.getByLabel('Email').fill('jane@example.com');
  await page.getByLabel('Message').fill('Hello there, this is a test message.');
  // Capture mailto navigation
  const navigationPromise = page.waitForRequest(/^mailto:/).catch(() => null);
  await page.getByRole('button', { name: /Send message/i }).click();
  // Mailto links don't fire as requests in Playwright; instead inspect the href on the page
  // or assert the status text changed
  await expect(page.getByText(/Message ready|Opening mail/i)).toBeVisible({ timeout: 2000 });
});
```

- [ ] **Step 5: Run**

```bash
pnpm test:e2e -- --project=chromium
# Expected: all 4 tests pass
```

- [ ] **Step 6: Commit**

```bash
git add e2e
git commit -m "test(e2e): home, locale switch, theme persistence, contact form"
```

### Task 30: A11y test pass

**Files:**
- Create: `features/home/__tests__/components/{Hero,Work,Experience,Contact}.accessibility.test.tsx`

- [ ] **Step 1: Template for one section**

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Hero } from '@/features/home/components/Hero';

describe('Hero a11y', () => {
  it('has no a11y violations', async () => {
    // Hero is async — render as a thenable
    const result = await Hero();
    const { container } = render(<>{result}</>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

Repeat for Work (mock the active drawer state), Experience, Contact.

- [ ] **Step 2: Run**

```bash
pnpm test -- --run --testPathPattern=accessibility
# Expected: all pass
```

- [ ] **Step 3: Commit**

```bash
git add features/home/__tests__
git commit -m "test(a11y): jest-axe coverage for top-level sections"
```

### Task 31: Lighthouse and bundle analysis

**Files:** none

- [ ] **Step 1: Build**

```bash
pnpm build
pnpm start &
sleep 4
```

- [ ] **Step 2: Run Lighthouse**

```bash
npx -y lighthouse@latest http://localhost:3000/en --only-categories=performance,accessibility,best-practices,seo --quiet --chrome-flags="--headless"
```

Targets:
- Performance ≥ 90
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO = 100

If targets aren't met, profile with `pnpm analyze` and DevTools.

- [ ] **Step 3: Document results**

Append a short results block to README.md under "Performance".

- [ ] **Step 4: Stop server, commit any tuning**

```bash
kill %1
git add README.md
git commit -m "docs: record Lighthouse baseline" || true
```

---

## Phase 7 — Polish and ship

### Task 32: README rewrite

**Files:**
- Create: `README.md` (new)

- [ ] **Step 1: Write a new top-level README** covering: stack, scripts, dev/build commands, folder layout summary, deployment notes. Keep it under 80 lines.

```bash
git add README.md
git commit -m "docs: rewrite README for Next.js project"
```

### Task 33: .env.example

**Files:**
- Create: `.env.example`

```
# Public site URL — used by SEO metadata, sitemap, og-image
NEXT_PUBLIC_SITE_URL=https://paulamagdy.com
```

```bash
git add .env.example
git commit -m "chore: add .env.example"
```

### Task 34: Final review — run full check pipeline

**Files:** none

- [ ] **Step 1: Run check**

```bash
pnpm lint && pnpm format:check && pnpm type-check && pnpm test -- --run
# Expected: all pass
```

- [ ] **Step 2: Fix any failures, recommit**

### Task 35: Delete legacy (only after parity confirmed)

**Files:**
- Delete: `legacy/`

- [ ] **Step 1: Manual parity check**

Open `pnpm start` build alongside `legacy/Portfolio.html` (served via `python3 -m http.server 8000`) and compare side-by-side for both locales. Confirm:

- Hero matches (text, 3D, CTAs, meta cells, animated metric)
- Each Work row matches; CaseStudyDrawer opens and closes
- Experience, Education, Certifications, Stack render with same content
- Contact form submits a mailto link
- Theme toggle works, persists; locale switch works; loader plays
- RTL layout is correct for `ar`

- [ ] **Step 2: Confirm with user before deleting**

Stop here. The user must explicitly approve `rm -rf legacy/`. Do not delete without consent.

- [ ] **Step 3: When approved**

```bash
git rm -r legacy/
git commit -m "chore: remove legacy static React build (Next.js port at parity)"
```

---

## Self-Review

**1. Spec coverage check:**

- Replace in-place, move legacy to `legacy/` → Task 1 ✓
- Pragmatic DDD-lite folder structure → File Structure ✓
- Next.js 16 App Router → Task 2, Task 9 ✓
- next-intl EN/AR with RTL → Tasks 7, 8, 9 ✓
- next-themes → Task 9 ✓
- framer-motion, gsap, lenis, three → Tasks 12, 15, 16, 22 ✓
- All sections of legacy portfolio (Hero, Work, Experience, Education, Certifications, Stack, Contact) → Tasks 21, 22, 23, 24, 25 ✓
- Page loader → Task 19 ✓
- Custom cursor, scroll progress → Task 16 ✓
- SEO (per-locale metadata, hreflang, JSON-LD, sitemap, robots, OG) → Tasks 13, 26, 27, 28 ✓
- Tests (unit, a11y, E2E) → Tasks 11, 16, 17, 25, 29, 30 ✓
- README + .env.example → Tasks 32, 33 ✓
- Lighthouse target verification → Task 31 ✓
- Cleanup of legacy → Task 35 (gated on user approval) ✓

**2. Placeholder scan:**

- Task 12 step 4 has `// ... port geometry / lights / material from legacy/src/hero3d.jsx` and similar — these are intentional skip markers for verbatim copy from a known source line range, not placeholders. The plan tells the engineer *exactly* which file to read. Acceptable given the source is large but mechanical to port.
- Task 24 step 1 says "follow the same pattern" — that's a meta-instruction backed by the pattern shown in Task 23. Acceptable.
- No TBDs, no "implement later".

**3. Type consistency check:**

- `WorkProject` interface defined in Task 20 — consumed in Tasks 23, 24, 25. Same shape used throughout.
- `Locale` exported from `i18n/config.ts` in Task 7 — used in Tasks 9, 13, 17.
- `ContactFormValues` defined in Task 25 step 1 — used in step 2 (`buildMailto`) and step 4 (`ContactForm`).

**4. Risks / known unknowns:**

- The legacy `motion.jsx` and `hero3d.jsx` are large (425 and 206 lines). Port tasks (12, 22) reference them but don't reproduce every line — the engineer must read the legacy file to port it. This is the right level of granularity for a plan of this size; reproducing 600+ lines verbatim in plan steps would add no value.
- The 3D scene visual fidelity depends on faithfully copying the geometry/lighting logic. Visual diff is the verification.
- Arabic translations: the plan keeps initial Arabic content thin; full translation is a polish pass after parity.
- Contact form mailto in Playwright: `mailto:` URLs don't always fire as `waitForRequest` in headless Playwright. Task 29 step 4 uses a status-text assertion as a fallback. If that proves brittle, the test should assert the `href` attribute on a hidden anchor instead.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-27-nextjs-conversion.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
