# Legacy Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore feature-for-feature legacy parity in the Next.js port — rebuild three sections (Contact, Stack, Certifications), polish two (Hero, TopNav), wire two dead scaffolds (BgSpotlight, theme-swap radial unmask), audit cursor labels, and delete the unused MetaCell.

**Architecture:** Top-to-bottom page sweep. Each task touches a self-contained area, leaves the dev server running green, and ends with a commit. The legacy build stays in `legacy/` until the user signs off after Task 17.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Tailwind v4, GSAP + ScrollTrigger + SplitText, Framer Motion, Lenis, next-intl, lucide-react, Vitest + RTL, Playwright.

**Spec:** `docs/superpowers/specs/2026-05-27-legacy-parity-design.md`

---

## Pre-flight

- [ ] **Step 0a: Verify dev server runs and current state is clean**

```bash
git status                                       # expect: clean on feature/nextjs-conversion
pnpm lint && pnpm type-check                     # expect: clean
pnpm test -- --run                               # expect: 21 passed
```

- [ ] **Step 0b: Launch dev server and legacy server in background terminals**

```bash
pnpm dev                                          # Terminal 1 — localhost:3000
cd legacy && python3 -m http.server 8001          # Terminal 2 — localhost:8001/Portfolio.html
```

Open both side-by-side at 1440 / 1024 / 768 / 375 viewport widths.

---

## Task 1: SplitReveal safety-fallback hardening

**Why first:** Hero rebuild (Task 2) restores char-stagger animation. STATE.md says this was simplified due to reliability. Harden the fallback before relying on it.

**Files:**
- Modify: `features/ui-components/components/SplitReveal.tsx`

- [ ] **Step 1: Read the current SplitReveal**

```bash
cat features/ui-components/components/SplitReveal.tsx
```

- [ ] **Step 2: Update the safety timeout to force visible state**

In the safety-timeout branch (currently 1.8s per the inventory), ensure these lines run even if the IntersectionObserver never fires AND if SplitText is unavailable:

```ts
if (hostRef.current) {
  hostRef.current.style.opacity = '1';
  hostRef.current.querySelectorAll<HTMLElement>('.split-char, .split-word').forEach((el) => {
    el.style.transform = 'none';
    el.style.opacity = '1';
  });
}
```

Cap the timeout at 1500ms (matches STATE.md guidance).

- [ ] **Step 3: Ensure `mode="instant"` plays on mount with the same fallback armed**

Verify the `instant` branch skips the IntersectionObserver, plays the GSAP timeline immediately, and the same 1.5s safety timeout fires if SplitText is missing.

- [ ] **Step 4: Run tests**

```bash
pnpm test -- --run
```

Expect: 21 passed.

- [ ] **Step 5: Commit**

```bash
git add features/ui-components/components/SplitReveal.tsx
git commit -m "fix(ui): harden SplitReveal safety fallback for char-stagger restoration"
```

---

## Task 2: Hero rebuild

**Files:**
- Modify: `features/home/components/Hero.tsx`
- Modify: `app/[locale]/page.tsx` (verify hero anchor name)
- Modify: `features/home/translations/en/pages.json` (add `hero.kicker`)
- Modify: `features/home/translations/ar/pages.json` (add `hero.kicker`)
- Modify: `features/ui-components/components/AvailabilityPill.tsx` (accept delaySeconds prop)
- Modify: `app/globals.css` (add hero keyframes)

- [ ] **Step 1: Add `hero.kicker` translation key (EN)**

In `features/home/translations/en/pages.json`, under `hero`, add:

```json
"kicker": "Building systems that teams rely on."
```

- [ ] **Step 2: Add `hero.kicker` translation key (AR)**

In `features/home/translations/ar/pages.json`, under `hero`, add:

```json
"kicker": "أبني أنظمة تعتمد عليها الفرق."
```

- [ ] **Step 3: Rewrite `features/home/components/Hero.tsx`**

```tsx
import { getTranslations } from 'next-intl/server';
import { ArrowDown, Download } from 'lucide-react';
import { Hero3DLazy } from './Hero3DLazy';
import { HeroHeadline } from './HeroHeadline';
import {
  AvailabilityPill,
  Magnetic,
  Reveal,
  SplitReveal,
} from '@/features/ui-components';

export async function Hero() {
  const t = await getTranslations('home.hero');

  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col overflow-hidden px-6 pt-28 pb-12 md:px-10 md:pt-32 md:pb-16"
    >
      <div
        aria-hidden
        className="text-amber pointer-events-none absolute top-1/2 right-[-40px] hidden -translate-y-1/2 lg:block xl:right-[-60px] 2xl:right-[-80px]"
      >
        <div className="h-[420px] w-[420px] xl:h-[520px] xl:w-[520px] 2xl:h-[640px] 2xl:w-[640px]">
          <Hero3DLazy />
        </div>
      </div>

      <Reveal as="div" className="relative z-10 flex items-center gap-4">
        <span
          aria-hidden
          className="bg-amber inline-block h-px w-12 origin-left scale-x-0 animate-[hero-rule_1.1s_cubic-bezier(0.2,0.7,0.2,1)_0.2s_forwards]"
        />
        <span className="font-mono text-[11px] tracking-[0.2em] text-inkmute uppercase opacity-0 animate-[hero-fade_0.7s_ease-out_0.6s_forwards]">
          {t('portfolio')}
        </span>
        <span className="ml-auto">
          <AvailabilityPill delaySeconds={1.0} />
        </span>
      </Reveal>

      <div className="relative z-10 mt-8 md:mt-12 max-w-[1100px]">
        <HeroHeadline>
          <SplitReveal
            as="h1"
            mode="instant"
            delay={0.15}
            stagger={0.014}
            duration={1.0}
            className="font-serif text-[14vw] sm:text-[12vw] md:text-[9.5vw] lg:text-[120px] xl:text-[140px] 2xl:text-[160px] leading-[0.95] tracking-[-0.02em] text-ink"
          >
            {t('headline')}
            <span className="text-amber">.</span>
          </SplitReveal>
        </HeroHeadline>
      </div>

      <div className="relative z-10 mt-10 md:mt-14 max-w-[560px] opacity-0 animate-[hero-fade_0.9s_ease-out_1s_forwards]">
        <p className="font-mono text-[11px] tracking-[0.18em] text-amber uppercase">
          {t('kicker')}
        </p>
        <p className="mt-4 text-[15px] md:text-[17px] leading-[1.55] text-inkdim">
          {t('descriptionLead')}
          <em className="text-ink not-italic">{t('descriptionEmph')}</em>
        </p>
      </div>

      <div className="relative z-10 mt-8 flex flex-wrap items-center gap-4 opacity-0 animate-[hero-fade_0.9s_ease-out_1.2s_forwards]">
        <Magnetic as="span" strength={0.25}>
          <a href="#work" className="btn-base btn-primary">
            {t('ctaWork')}
            <ArrowDown className="h-4 w-4" aria-hidden />
          </a>
        </Magnetic>
        <Magnetic as="span" strength={0.25}>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-label="open"
            className="btn-base btn-ghost"
          >
            {t('ctaResume')}
            <Download className="h-4 w-4" aria-hidden />
          </a>
        </Magnetic>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Append keyframes to `app/globals.css`**

```css
@keyframes hero-rule {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

@keyframes hero-fade {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  [class*='animate-[hero-'] {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

- [ ] **Step 5: Update `AvailabilityPill` to accept `delaySeconds`**

In `features/ui-components/components/AvailabilityPill.tsx`, accept `delaySeconds?: number` (default 0.2) and pass it to the framer-motion `transition.delay`:

```tsx
type Props = { delaySeconds?: number };
export function AvailabilityPill({ delaySeconds = 0.2 }: Props) {
  // existing render — set transition={{ delay: delaySeconds, duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
}
```

- [ ] **Step 6: Verify `app/[locale]/page.tsx` does not conflict on `id="top"`**

Only the Hero section should claim `id="top"`. The Back-to-top anchor (added in Task 11) targets this.

- [ ] **Step 7: Manual verify side-by-side with legacy**

Boot dev server. Confirm: amber rule scales in, `Portfolio / 2026` fades in at 0.6s, AvailabilityPill slides in from right at 1.0s, headline chars stagger up, sub-kicker + paragraph fade in at 1.0s, CTAs at 1.2s. 3D scene anchored right at lg+. No MetaCell row below.

- [ ] **Step 8: Quality gates**

```bash
pnpm lint && pnpm type-check && pnpm test -- --run
```

- [ ] **Step 9: Commit**

```bash
git add features/home/components/Hero.tsx \
        features/home/translations/en/pages.json \
        features/home/translations/ar/pages.json \
        features/ui-components/components/AvailabilityPill.tsx \
        app/globals.css
git commit -m "feat(hero): restore legacy eyebrow rule, sub-kicker, AvailabilityPill mount, char-stagger headline"
```

---

## Task 3: Delete MetaCell

**Files:**
- Delete: `features/home/components/MetaCell.tsx`
- Modify: `features/home/components/index.ts`
- Modify: `features/home/translations/en/pages.json` (remove `hero.meta.*`)
- Modify: `features/home/translations/ar/pages.json` (remove `hero.meta.*`)

- [ ] **Step 1: Remove the MetaCell file**

```bash
rm features/home/components/MetaCell.tsx
```

- [ ] **Step 2: Remove its barrel export**

Open `features/home/components/index.ts` and delete the `MetaCell` line.

- [ ] **Step 3: Remove `hero.meta` from both locales**

Delete the entire `meta: { ... }` block under `hero` in both `pages.json` files.

- [ ] **Step 4: Search for stragglers**

```bash
grep -rn "MetaCell\|hero\.meta" features app
```

Expect: zero matches.

- [ ] **Step 5: Quality gates**

```bash
pnpm lint && pnpm type-check && pnpm test -- --run
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(home): remove MetaCell row (not present in legacy)"
```

---

## Task 4: TopNav rebuild

**Files:**
- Modify: `features/ui-components/components/TopNav.tsx`
- Modify: `features/ui-components/translations/en/ui.json` (add `nav.cairo` if missing)
- Modify: `features/ui-components/translations/ar/ui.json` (mirror)
- Modify: `app/globals.css` (add `ping-slow` keyframes)

- [ ] **Step 1: Verify nav translation keys**

Required: `ui.nav.primary`, `.work`, `.experience`, `.certifications`, `.stack`, `.contact`, `.openMenu`, `.closeMenu`, `.cairo` ("Cairo, EG"). Add `nav.cairo` if missing in either locale.

- [ ] **Step 2: Rewrite `features/ui-components/components/TopNav.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LiveClock } from './LiveClock';
import { ThemeToggle } from './ThemeToggle';
import { LocaleSwitcher } from '@/features/localization';

const SECTIONS = ['work', 'experience', 'certifications', 'stack', 'contact'] as const;
type SectionId = (typeof SECTIONS)[number];

export function TopNav() {
  const t = useTranslations('ui.nav');
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
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <nav
      aria-label={t('primary')}
      className={`fixed inset-x-0 top-0 z-60 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled ? 'border-line bg-bg/70 border-b backdrop-blur-md' : 'border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 md:px-10">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-serif text-[20px] text-ink">Paula Magdy</span>
          <span className="hidden font-mono text-[12px] text-inkmute md:inline">— {t('cairo')}</span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {SECTIONS.map((id, i) => {
            const isActive = active === id;
            return (
              <li key={id} className="relative">
                <a
                  href={`#${id}`}
                  className={`group flex items-baseline gap-1.5 text-[13px] transition-colors ${
                    isActive ? 'text-ink' : 'text-inkdim hover:text-ink'
                  }`}
                >
                  <span className={`font-mono text-[10px] ${isActive ? 'text-amber' : 'text-inkmute'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{t(id)}</span>
                </a>
                <span
                  aria-hidden
                  className={`bg-amber absolute right-0 -bottom-1 left-0 h-px origin-left transition-transform duration-500 ease-out ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
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
            aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
            onClick={() => setMenuOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center md:hidden"
          >
            <span
              aria-hidden
              className={`bg-ink absolute h-px w-5 transition-transform duration-300 ${
                menuOpen ? 'rotate-45' : '-translate-y-1.5'
              }`}
            />
            <span
              aria-hidden
              className={`bg-ink absolute h-px w-5 transition-transform duration-300 ${
                menuOpen ? '-rotate-45' : 'translate-y-1.5'
              }`}
            />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        className={`bg-bg/95 fixed inset-0 z-50 backdrop-blur-md transition-opacity duration-300 md:hidden ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMenuOpen(false);
        }}
      >
        <div className="flex h-full flex-col justify-between px-6 pt-24 pb-10">
          <ul className="space-y-0">
            {SECTIONS.map((id, i) => (
              <li key={id} className="border-line border-b">
                <a
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  className={`group flex items-baseline gap-4 py-6 ${
                    active === id ? 'text-ink' : 'text-inkdim hover:text-ink'
                  }`}
                >
                  <span className={`font-mono text-[11px] ${active === id ? 'text-amber' : 'text-inkmute'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-serif text-[40px] leading-none">{t(id)}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <span aria-hidden className="bg-emerald-400 h-2 w-2 rounded-full animate-ping-slow" />
            <LiveClock />
            <span className="font-mono text-[12px] text-inkmute">· {t('cairo')}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Append `ping-slow` keyframes to `app/globals.css`**

```css
@keyframes ping-slow {
  0% { transform: scale(1); opacity: 1; }
  75%, 100% { transform: scale(1.8); opacity: 0; }
}
.animate-ping-slow {
  animation: ping-slow 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
}
```

- [ ] **Step 4: Update existing TopNav test (if it asserts the old shape)**

```bash
pnpm test -- features/ui-components/__tests__/components/TopNav.test.tsx --run
```

If failures reference the old structure (no active-section detection, no number prefix), update assertions to behavior-only: nav renders 5 links, opens mobile drawer, traps escape, etc.

- [ ] **Step 5: Quality gates and manual verify**

```bash
pnpm lint && pnpm type-check
```

Scroll: verify active link shows amber number + scale-x underline. Open mobile menu: serif 40px links, mono amber number prefixes, pulse + clock + Cairo at bottom.

- [ ] **Step 6: Commit**

```bash
git add features/ui-components/components/TopNav.tsx \
        features/ui-components/translations \
        app/globals.css \
        features/ui-components/__tests__
git commit -m "feat(nav): active-section detection, number prefixes, mobile drawer styling"
```

---

## Task 5: WorkRow semantic + ArrowUpRight hover polish

**Files:**
- Modify: `features/home/components/WorkRow.tsx`

- [ ] **Step 1: Change wrapper from `<button>` to `<article role="button" tabIndex={0}>`**

```tsx
<article
  role="button"
  tabIndex={0}
  aria-label={ariaLabel}
  onClick={onClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }}
  data-magnetic
  data-cursor-label={cursorLabel}
  className="group focus-visible:ring-amber/60 work-row grid cursor-pointer grid-cols-1 gap-6 rounded-sm py-10 focus-visible:ring-1 focus-visible:outline-none md:grid-cols-12 md:gap-8 md:py-14"
>
```

- [ ] **Step 2: Add Framer Motion ArrowUpRight near the title**

Add `useState` for `hovered`, attach `onMouseEnter`/`onMouseLeave` on `<article>` to toggle it, then render inside or beside the title:

```tsx
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const [hovered, setHovered] = useState(false);

<motion.span
  aria-hidden
  className="text-amber inline-flex"
  animate={{
    x: hovered ? 4 : 0,
    y: hovered ? -4 : 0,
    opacity: hovered ? 1 : 0.5,
  }}
  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
>
  <ArrowUpRight className="h-5 w-5" />
</motion.span>
```

- [ ] **Step 3: Quality gates and manual verify**

```bash
pnpm lint && pnpm type-check && pnpm test -- --run
```

Hover a row: title underline grows, ArrowUpRight nudges up-right and reaches full opacity. Tab into row: focus ring is amber.

- [ ] **Step 4: Commit**

```bash
git add features/home/components/WorkRow.tsx
git commit -m "polish(work): article role=button semantics, ArrowUpRight hover spring"
```

---

## Task 6: CaseStudyDrawer verify + sticky header badge

**Files:**
- Modify: `features/home/components/CaseStudyDrawer.tsx`

- [ ] **Step 1: Read the current drawer**

```bash
cat features/home/components/CaseStudyDrawer.tsx
```

- [ ] **Step 2: Position drawer below nav and add sticky header**

If currently `fixed inset-0`, change to:

```tsx
<motion.aside
  role="dialog"
  aria-modal
  aria-label={t('caseStudy.label')}
  data-lenis-prevent
  className="bg-bg2 border-line fixed top-16 right-0 bottom-0 left-0 z-70 overflow-y-auto overscroll-contain border-l md:left-auto md:w-[680px]"
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
>
  <div className="bg-bg2/95 border-line sticky top-0 z-10 flex items-center justify-between border-b px-8 py-5 backdrop-blur-sm">
    <span className="font-mono text-[10px] tracking-[0.18em] uppercase">
      <span className="text-amber">{t('caseStudy.label')}</span>
      <span className="text-inkmute"> · {t(`${project.id}.badge`)}</span>
    </span>
    <button
      type="button"
      aria-label={t('caseStudy.close')}
      data-cursor-label="close"
      onClick={onClose}
      className="hover:text-amber text-ink"
    >
      <X className="h-5 w-5" />
    </button>
  </div>
  <div className="p-8 md:p-12">{/* existing CSBlocks */}</div>
</motion.aside>
```

- [ ] **Step 3: Set CSBlock delays to match legacy**

Pass these `delaySeconds` to the CSBlocks:
- role: 0.28
- problem: 0.36
- architecture: 0.44
- contributions: 0.52
- outcomes: 0.60
- stack: 0.70

- [ ] **Step 4: Verify contribution-list amber rules use `initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}` with `originX: 0`**

Duration 0.5, ease easeOut, stagger applied to both the rule and the text via per-item delays.

- [ ] **Step 5: Quality gates and visual verify**

```bash
pnpm lint && pnpm type-check && pnpm test -- --run
```

Open each project's case study: sticky header reads `CASE STUDY · <BADGE>`, drawer slides from right, contributions list staggers, drawer scroll doesn't bleed.

- [ ] **Step 6: Commit**

```bash
git add features/home/components/CaseStudyDrawer.tsx
git commit -m "polish(work): drawer sticky header, badge label, top-16 positioning, CSBlock delays"
```

---

## Task 7: Stack section rebuild

**Files:**
- Modify: `features/home/components/Stack.tsx`
- Modify: `features/home/config/stack.config.ts` (verify 26 logos)
- Modify: `features/home/translations/en/pages.json` (add `stack.intro1`, `.introEmph`)
- Modify: `features/home/translations/ar/pages.json` (mirror)

- [ ] **Step 1: Audit `MARQUEE_TOOLS` and add missing legacy entries**

Legacy list (26): React, Next.js, TypeScript, JavaScript, Tailwind CSS, Vitest, Playwright, Node.js, NestJS, Express, Django, Flask, Laravel, Jest, Redis, PostgreSQL, MySQL, MongoDB, Prisma, AWS, Azure, Docker, Kubernetes, Python, PHP, C++.

```bash
cat features/home/config/stack.config.ts
```

If any are missing, append following the existing shape (Simple Icons CDN URL pattern).

- [ ] **Step 2: Add stack intro translation keys**

In `features/home/translations/en/pages.json` under `stack`:

```json
"intro1": "Tools I reach for daily, grouped by where they live in the stack —",
"introEmph": " chosen for shipping, not for the résumé."
```

Mirror in AR.

- [ ] **Step 3: Rewrite `features/home/components/Stack.tsx`**

```tsx
import { getTranslations } from 'next-intl/server';
import { MARQUEE_TOOLS, STACK } from '../config';
import { Marquee, Reveal, SectionHead, SplitReveal } from '@/features/ui-components';

export async function Stack() {
  const t = await getTranslations('home.stack');

  return (
    <section id="stack" className="px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead num="05" label={t('label')} />

        <div className="border-line -mx-6 mt-8 mb-14 border-y py-6 md:-mx-10 md:mb-20 md:py-8">
          <Marquee speed={48} pauseOnHover draggable ariaLabel="Tooling marquee">
            {MARQUEE_TOOLS.map((tool) => (
              <div key={tool.name} className="mx-8 flex items-center gap-3">
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="marquee-logo h-9 w-9 md:h-10 md:w-10"
                  loading="lazy"
                  draggable={false}
                />
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-inkdim md:text-[12px]">
                  {tool.name}
                </span>
              </div>
            ))}
          </Marquee>
        </div>

        <Reveal>
          <SplitReveal
            as="p"
            stagger={0.008}
            duration={0.9}
            className="font-serif text-[28px] leading-[1.15] text-ink md:text-[40px] max-w-[820px] mb-14"
          >
            {t('intro1')}
            <em className="text-inkdim font-light not-italic">{t('introEmph')}</em>
          </SplitReveal>
        </Reveal>

        <ul>
          {STACK.map((group, i) => (
            <Reveal
              as="li"
              key={group.titleKey}
              delay={i * 0.04}
              className="border-line grid grid-cols-1 gap-6 border-t py-6 md:grid-cols-12"
            >
              <div className="md:col-span-3 flex items-baseline gap-3">
                <span className="font-mono text-[10px] text-amber">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-serif text-[24px] text-ink md:text-[28px]">{t(group.titleKey)}</h3>
              </div>
              <ul className="md:col-span-9 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="font-mono text-[12px] text-inkdim hover:text-ink hover:border-amber/40 border-line bg-bg2/40 rounded-md border px-2.5 py-1.5 transition-colors"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify `STACK` shape**

The config exposes `frontend`, `backend`, `databases`, `cloud`, `languages` group objects. If `titleKey` is shaped differently (e.g., `group.title` instead of `group.titleKey`), adapt the JSX to the actual field name.

- [ ] **Step 5: Quality gates and visual compare**

```bash
pnpm lint && pnpm type-check && pnpm test -- --run
```

- [ ] **Step 6: Commit**

```bash
git add features/home/components/Stack.tsx \
        features/home/config/stack.config.ts \
        features/home/translations
git commit -m "feat(stack): marquee-first layout, serif group titles with 01-05 indices, chip rows"
```

---

## Task 8: Certifications section rebuild

**Files:**
- Modify: `features/home/components/Certifications.tsx`
- Modify: `features/home/translations/en/pages.json` (add `certs.heading1`, `.heading2` if missing)
- Modify: `features/home/translations/ar/pages.json` (mirror)

- [ ] **Step 1: Add heading translation keys**

In `features/home/translations/en/pages.json` under `certs`:

```json
"heading1": "Credentials",
"heading2": "& training."
```

Mirror in AR.

- [ ] **Step 2: Rewrite `features/home/components/Certifications.tsx`**

```tsx
import { getTranslations } from 'next-intl/server';
import { CERTIFICATIONS } from '../config';
import { Magnetic, Reveal, SectionHead, SplitReveal } from '@/features/ui-components';

export async function Certifications() {
  const t = await getTranslations('home.certs');

  return (
    <section id="certifications" className="px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead num="04" label={t('label')} />

        <Reveal>
          <SplitReveal
            as="h2"
            stagger={0.018}
            duration={0.95}
            className="font-serif text-[34px] leading-[1.05] text-ink md:text-[44px] mt-6 mb-12"
          >
            {t('heading1')}
            <br />
            <em className="text-inkdim font-light not-italic">{t('heading2')}</em>
          </SplitReveal>
        </Reveal>

        <ul>
          {CERTIFICATIONS.map((c, i) => (
            <Reveal
              as="li"
              key={c.id}
              delay={i * 0.05}
              className="border-line grid grid-cols-1 gap-6 border-t py-8 first:border-t-0 md:grid-cols-12 md:py-10"
            >
              <div className="md:col-span-3 flex flex-col gap-3">
                <Magnetic strength={0.35}>
                  <img
                    src={c.logo}
                    alt={t(c.issuerKey)}
                    className="marquee-logo h-8 w-auto"
                    loading="lazy"
                    draggable={false}
                  />
                </Magnetic>
                <p className="font-mono text-[11px] tracking-[0.1em] text-amber uppercase">
                  {t('issued')}: {t(`${c.id}.issued`)}
                  {c.expiresKey && <> · {t('expires')}: {t(`${c.id}.expires`)}</>}
                </p>
              </div>
              <div className="md:col-span-9 space-y-3">
                <h3 className="font-serif text-[24px] text-ink md:text-[28px]">{t(c.nameKey)}</h3>
                <p className="font-mono text-[13px] text-inkdim">
                  {t(c.issuerKey)}
                  {c.divisionKey && <span className="text-inkmute"> · {t(c.divisionKey)}</span>}
                </p>
                <p className="text-[14px] text-inkdim max-w-[600px]">{t(c.descKey)}</p>
                {c.credentialId && (
                  <p className="font-mono text-[11px] text-inkmute">
                    {t('credId')}: <span className="text-ink break-all">{c.credentialId}</span>
                  </p>
                )}
                {c.skills && (
                  <ul className="flex flex-wrap gap-2 mt-2">
                    {c.skills.map((skill) => (
                      <li
                        key={skill}
                        className="font-mono text-[11px] text-inkdim border-line bg-bg2/40 rounded-md border px-2 py-1"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify `CERTIFICATIONS` config shape**

The config should expose `id`, `logo`, `nameKey`, `issuerKey`, `divisionKey?`, `descKey`, `credentialId?`, `skills?`, `expiresKey?`. Adapt render if field names differ.

- [ ] **Step 4: Quality gates**

```bash
pnpm lint && pnpm type-check && pnpm test -- --run
```

- [ ] **Step 5: Manual verify**

Hover each cert logo — magnetic strength 0.35 should be visibly stronger than the default 0.25. Layout matches legacy vertical list, not card grid.

- [ ] **Step 6: Commit**

```bash
git add features/home/components/Certifications.tsx \
        features/home/translations
git commit -m "feat(certs): vertical list with magnetic logos and 12-col rail"
```

---

## Task 9: Contact section — Part A (headline + underline-only form)

**Files:**
- Modify: `features/contact-form/components/Field.tsx`
- Modify: `features/contact-form/components/ContactForm.tsx`
- Modify: `features/home/components/Contact.tsx` (headline + pitch column + form column)
- Modify: `features/home/translations/en/pages.json` (verify contact keys)
- Modify: `features/home/translations/ar/pages.json` (mirror)

- [ ] **Step 1: Add or verify contact translation keys**

Required keys in `home.contact`: `label`, `heading1`, `heading2`, `sendMessage`, `pitchHeading`, `pitchDescription`, `formName`, `formEmail`, `formMessage`, `formNamePlaceholder`, `formEmailPlaceholder`, `formMessagePlaceholder`, `formSend`, `formSending`, `formSent`, `formHelper`, `email`, `phone`, `phoneValue`, `elsewhere`, `copied`, `footerBuilt`, `backToTop`. Plus `socials.github`, `.linkedin`, `.leetcode`, `.hackerrank` (label strings).

Values for new EN keys (mirror to AR with appropriate translations):

```json
"heading1": "Let's build",
"heading2": "something",
"sendMessage": "Send a message",
"pitchHeading": "Tell me what you're building.",
"pitchDescription": "Open to senior full-stack roles and consulting engagements on scalable web platforms. Replies within 24 hours.",
"formNamePlaceholder": "Jane Doe",
"formEmailPlaceholder": "you@company.com",
"formMessagePlaceholder": "A few lines about what you're working on or the role you have in mind.",
"formSend": "Send message",
"formSending": "Opening mail…",
"formSent": "Message ready",
"formHelper": "Opens in your mail client",
"phoneValue": "+20 127 776 7028",
"copied": "copied to clipboard",
"footerBuilt": "Designed and built by Paula Magdy · Cairo, 2026",
"backToTop": "Back to top",
"socials": {
  "github": "GitHub",
  "linkedin": "LinkedIn",
  "leetcode": "LeetCode",
  "hackerrank": "HackerRank"
}
```

- [ ] **Step 2: Rewrite `features/contact-form/components/Field.tsx`**

```tsx
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

type CommonProps = {
  label: string;
  error?: string;
  multiline?: boolean;
};

type InputProps = CommonProps & InputHTMLAttributes<HTMLInputElement> & { multiline?: false };
type TextareaProps = CommonProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true };

export const Field = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps | TextareaProps>(
  function Field({ label, error, multiline, id, ...rest }, ref) {
    const errorId = error ? `${id}-error` : undefined;
    const sharedClassName =
      'block w-full border-b border-line bg-transparent pb-2 pt-1 font-serif text-[20px] md:text-[24px] text-ink placeholder:text-inkmute placeholder:font-serif focus:border-amber/70 focus:outline-none transition-colors';

    return (
      <div className="mb-8">
        <div className="mb-2 flex items-baseline justify-between">
          <label htmlFor={id} className="font-mono text-[10px] tracking-[0.18em] uppercase text-inkmute">
            {label}
          </label>
          {error && (
            <span id={errorId} role="alert" className="font-mono text-[10px] text-amber">
              {error}
            </span>
          )}
        </div>
        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={id}
            rows={4}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={`${sharedClassName} resize-none`}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={id}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={sharedClassName}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
    );
  },
);
```

- [ ] **Step 3: Rewrite `features/contact-form/components/ContactForm.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { buildContactSchema, type ContactFormValues } from '../types/contact.schema';
import { buildMailto } from '../utils/buildMailto';
import { Field } from './Field';
import { Magnetic } from '@/features/ui-components';

export function ContactForm() {
  const t = useTranslations();
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(buildContactSchema(t)),
  });

  const onSubmit = handleSubmit((values) => {
    setStatus('sending');
    const url = buildMailto(values);
    requestAnimationFrame(() => {
      window.location.href = url;
    });
    setTimeout(() => setStatus('sent'), 200);
    setTimeout(() => setStatus('idle'), 4000);
  });

  const label =
    status === 'sending'
      ? t('home.contact.formSending')
      : status === 'sent'
        ? t('home.contact.formSent')
        : t('home.contact.formSend');

  return (
    <form onSubmit={onSubmit} noValidate>
      <Field
        id="contact-name"
        label={t('home.contact.formName')}
        placeholder={t('home.contact.formNamePlaceholder')}
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      <Field
        id="contact-email"
        label={t('home.contact.formEmail')}
        type="email"
        placeholder={t('home.contact.formEmailPlaceholder')}
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Field
        id="contact-message"
        label={t('home.contact.formMessage')}
        placeholder={t('home.contact.formMessagePlaceholder')}
        multiline
        error={errors.message?.message}
        {...register('message')}
      />

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Magnetic as="span" strength={0.25}>
          <button
            type="submit"
            disabled={status !== 'idle'}
            data-cursor-label="send"
            className="btn-base btn-primary disabled:opacity-60"
          >
            {label}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </button>
        </Magnetic>
        <span className="font-mono text-[12px] text-inkmute">{t('home.contact.formHelper')}</span>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Rewrite the headline portion of `features/home/components/Contact.tsx`**

Replace the existing Contact component (direct strip + bottom strip + watermark come in Tasks 10/11):

```tsx
import { getTranslations } from 'next-intl/server';
import { ContactForm } from '@/features/contact-form';
import { Reveal, SectionHead, SplitReveal } from '@/features/ui-components';

export async function Contact() {
  const t = await getTranslations('home.contact');

  return (
    <section
      id="contact"
      className="relative px-6 pt-16 pb-10 md:px-10 md:pt-24 overflow-hidden"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionHead num="06" label={t('label')} />

        <Reveal>
          <SplitReveal
            as="h2"
            stagger={0.018}
            duration={1.0}
            className="font-serif text-[14vw] sm:text-[12vw] md:text-[9.5vw] lg:text-[120px] xl:text-[140px] 2xl:text-[160px] leading-[0.95] tracking-[-0.02em] text-ink mt-8 mb-12 md:mb-16"
          >
            {t('heading1')}{' '}
            <em className="text-inkdim font-light not-italic">{t('heading2')}</em>
            <span className="text-amber">.</span>
          </SplitReveal>
        </Reveal>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-inkmute mb-4">
              {t('sendMessage')}
            </p>
            <h3 className="font-serif text-[22px] text-ink md:text-[26px] mb-3">
              {t('pitchHeading')}
            </h3>
            <p className="text-[14px] text-inkdim max-w-[300px]">{t('pitchDescription')}</p>
          </div>
          <div className="md:col-span-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Update existing contact-form tests**

Behavior-only assertions: each Field renders the right label, error appears with `role="alert"`, submit triggers mailto via `window.location.href`. Drop any assertions on `bg-bg2 rounded-md` class strings — they're style brittleness.

- [ ] **Step 6: Quality gates**

```bash
pnpm lint && pnpm type-check && pnpm test -- --run
```

- [ ] **Step 7: Commit**

```bash
git add features/contact-form features/home/components/Contact.tsx features/home/translations
git commit -m "feat(contact): legacy headline + underline-only form + magnetic submit"
```

---

## Task 10: Contact section — Part B (direct-contact strip + EmailCopyButton)

**Files:**
- Create: `features/home/components/EmailCopyButton.tsx`
- Modify: `features/home/components/Contact.tsx`
- Modify: `features/home/components/index.ts` (export EmailCopyButton)

- [ ] **Step 1: Create `features/home/components/EmailCopyButton.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Props = { email: string };

export function EmailCopyButton({ email }: Props) {
  const t = useTranslations('home.contact');
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = email;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <button
        type="button"
        onClick={onCopy}
        data-cursor-label="copy"
        aria-label={`Copy email ${email}`}
        className="group flex items-center gap-3 font-serif text-[20px] text-ink md:text-[24px] hover:text-amber transition-colors"
      >
        <span>{email}</span>
        <span className="relative inline-block h-5 w-5">
          <AnimatePresence initial={false} mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0"
              >
                <Check className="h-5 w-5" aria-hidden />
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0"
              >
                <Copy className="h-5 w-5" aria-hidden />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </button>
      <AnimatePresence>
        {copied && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="font-mono text-[11px] text-amber mt-2"
          >
            {t('copied')}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Export EmailCopyButton**

In `features/home/components/index.ts` add:

```ts
export { EmailCopyButton } from './EmailCopyButton';
```

- [ ] **Step 3: Append direct-contact strip to `Contact.tsx`**

Add new imports at the top:

```tsx
'use client';  // Contact stays server — see note below
```

Note: because `EmailCopyButton` is a client component and uses `useTranslations`, render it directly inside the server `Contact` — Next.js will mount the client island automatically. No need to change Contact to a client component.

Inside the `<div className="mx-auto max-w-[1200px]">`, after the existing grid block, insert:

```tsx
import { ArrowUpRight, Github, Linkedin, Code2, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { EmailCopyButton } from './EmailCopyButton';
import { RECIPIENT_EMAIL, SOCIALS } from '../config';

const SOCIAL_ICONS = {
  'home.contact.socials.github': Github,
  'home.contact.socials.linkedin': Linkedin,
  'home.contact.socials.leetcode': Code2,
  'home.contact.socials.hackerrank': Terminal,
} as const;

// ... inside the return, after the pitch/form grid:
<div className="border-line mt-16 grid grid-cols-1 gap-8 border-t pt-10 md:grid-cols-12 md:gap-6 md:pt-12 mb-12">
  <Reveal as="div" className="md:col-span-5">
    <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-inkmute mb-3">{t('email')}</p>
    <EmailCopyButton email={RECIPIENT_EMAIL} />
  </Reveal>

  <Reveal as="div" delay={0.05} className="md:col-span-3">
    <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-inkmute mb-3">{t('phone')}</p>
    <p className="font-serif text-[20px] text-ink md:text-[24px]">{t('phoneValue')}</p>
  </Reveal>

  <Reveal as="div" delay={0.1} className="md:col-span-4">
    <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-inkmute mb-3">{t('elsewhere')}</p>
    <ul className="grid grid-cols-2 gap-3">
      {SOCIALS.map((s) => {
        const Icon = SOCIAL_ICONS[s.labelKey as keyof typeof SOCIAL_ICONS];
        return (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-label="open"
              className="group flex items-center gap-2 text-inkdim hover:text-amber transition-colors"
            >
              {Icon && <Icon className="h-4 w-4" aria-hidden />}
              <span className="font-mono text-[12px]">{t(s.labelKey)}</span>
              <span className="ml-auto inline-flex transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  </Reveal>
</div>
```

Note: since `t(s.labelKey)` resolves keys like `home.contact.socials.github` from a server component, this works because the translations are loaded server-side. The framer-motion piece is replaced with a CSS group-hover transform to keep this section a server component (avoids 'use client' bloat).

- [ ] **Step 4: Quality gates and manual verify**

```bash
pnpm lint && pnpm type-check && pnpm test -- --run
```

Click email cell → clipboard write + check icon crossfade + amber "copied to clipboard" message vanishing after 2s. Hover socials → ArrowUpRight nudges and color shifts to amber.

- [ ] **Step 5: Commit**

```bash
git add features/home/components/EmailCopyButton.tsx \
        features/home/components/Contact.tsx \
        features/home/components/index.ts \
        features/home/translations
git commit -m "feat(contact): direct-contact strip with copy-to-clipboard, phone, socials"
```

---

## Task 11: Contact section — Part C (bottom strip + watermark + back-to-top)

**Files:**
- Modify: `features/home/components/Contact.tsx`

- [ ] **Step 1: Append bottom strip and watermark**

Add to the imports of `Contact.tsx`:

```tsx
import { LiveClock } from '@/features/ui-components';
import { ChevronUp } from 'lucide-react';
```

Inside `<div className="mx-auto max-w-[1200px]">`, after the direct-contact strip, add:

```tsx
<div className="border-line border-t pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  <p className="font-mono text-[11px] text-inkmute">{t('footerBuilt')}</p>
  <div className="flex items-center gap-3">
    <span aria-hidden className="bg-emerald-400 h-2 w-2 rounded-full animate-ping-slow" />
    <LiveClock />
    <a
      href="#top"
      data-cursor-label="open"
      className="text-inkdim hover:text-ink inline-flex items-center gap-1 font-mono text-[11px] transition-colors"
    >
      <span>{t('backToTop')}</span>
      <ChevronUp className="h-3.5 w-3.5" aria-hidden />
    </a>
  </div>
</div>
```

Then outside the inner `max-w-[1200px]` wrapper but inside the `<section>`, add the watermark:

```tsx
<div aria-hidden className="pointer-events-none absolute -bottom-20 left-0 right-0 select-none">
  <p className="font-serif tracking-tighter text-ink opacity-[0.04] text-[28vw] leading-none">Paula</p>
</div>
```

- [ ] **Step 2: Quality gates and manual verify**

```bash
pnpm lint && pnpm type-check && pnpm test -- --run
```

Footer credit + LiveClock + pulse dot + `Back to top` link with chevron render at the bottom. Clicking "Back to top" scrolls to the Hero (`#top`). "Paula" watermark renders at low opacity behind content.

- [ ] **Step 3: Commit**

```bash
git add features/home/components/Contact.tsx
git commit -m "feat(contact): bottom strip with footer credit, back-to-top, Paula watermark"
```

---

## Task 12: BgSpotlight wiring

**Files:**
- Create: `features/ui-components/components/BgSpotlight.tsx`
- Modify: `features/ui-components/index.ts`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Create `features/ui-components/components/BgSpotlight.tsx`**

```tsx
'use client';
import { useEffect } from 'react';

export function BgSpotlight() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let rafId = 0;
    let pending = false;
    let mx = 0;
    let my = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!pending) {
        pending = true;
        rafId = requestAnimationFrame(() => {
          document.documentElement.style.setProperty('--mx', `${mx}px`);
          document.documentElement.style.setProperty('--my', `${my}px`);
          pending = false;
        });
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return <div className="bg-spotlight" aria-hidden />;
}
```

- [ ] **Step 2: Export from `features/ui-components/index.ts`**

Add under Components:

```ts
export { BgSpotlight } from './components/BgSpotlight';
```

- [ ] **Step 3: Mount in `app/[locale]/page.tsx`**

Add `BgSpotlight` to the imports and render after `CustomCursor`:

```tsx
import { BgSpotlight, CustomCursor, PageLoader, ScrollProgress, TopNav } from '@/features/ui-components';

// in JSX:
<PageLoader />
<CustomCursor />
<BgSpotlight />
<ScrollProgress />
<TopNav />
```

- [ ] **Step 4: Verify `.bg-spotlight` CSS reads `--mx`/`--my`**

```bash
grep -n "bg-spotlight\|--mx\|--my" app/globals.css
```

If `--mx`/`--my` lack a sensible initial value, prepend in `:root`:

```css
:root {
  --mx: -100px;
  --my: -100px;
}
```

- [ ] **Step 5: Manual verify and commit**

Move mouse — 500px radial glow follows cursor at ~7% ink alpha. Touch device → no glow.

```bash
pnpm lint && pnpm type-check && pnpm test -- --run
git add features/ui-components/components/BgSpotlight.tsx \
        features/ui-components/index.ts \
        app/[locale]/page.tsx \
        app/globals.css
git commit -m "feat(chrome): wire BgSpotlight mouse-follow radial gradient"
```

---

## Task 13: Theme-swap radial unmask

**Files:**
- Modify: `features/ui-components/components/ThemeToggle.tsx`

- [ ] **Step 1: Replace ThemeToggle with the animated flow**

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Moon, Sun } from 'lucide-react';
import { gsap } from 'gsap';
import { useTheme } from '@/core/theme';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations('ui.theme');
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const isLight = resolvedTheme === 'light';

  const onClick = async () => {
    const next = isLight ? 'dark' : 'light';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const btn = buttonRef.current;

    if (reduced || !btn) {
      setTheme(next);
      return;
    }

    const root = document.documentElement;
    const prev = root.getAttribute('data-theme');
    root.setAttribute('data-theme', next);
    const targetBg = getComputedStyle(root).getPropertyValue('--color-bg').trim() || 'rgb(10 10 10)';
    if (prev) root.setAttribute('data-theme', prev);

    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxR = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));

    const overlay = document.createElement('div');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 100;
      background: rgb(${targetBg});
      clip-path: circle(0px at ${cx}px ${cy}px);
      pointer-events: none;
      will-change: clip-path, opacity;
    `;
    document.body.appendChild(overlay);

    await new Promise<void>((resolve) => {
      gsap.to(overlay, {
        clipPath: `circle(${maxR}px at ${cx}px ${cy}px)`,
        duration: 0.7,
        ease: 'power2.inOut',
        onComplete: () => resolve(),
      });
    });

    setTheme(next);

    await new Promise<void>((resolve) => {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => resolve(),
      });
    });

    overlay.remove();
  };

  if (!mounted) {
    return <span className="theme-toggle" aria-hidden style={{ width: 52, height: 26 }} />;
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label={isLight ? t('switchToDark') : t('switchToLight')}
      title={isLight ? t('switchToDark') : t('switchToLight')}
      className="theme-toggle"
      data-theme-state={isLight ? 'light' : 'dark'}
    >
      <span className="theme-toggle-knob">
        {isLight ? <Sun className="h-2.5 w-2.5" /> : <Moon className="h-2.5 w-2.5" />}
      </span>
    </button>
  );
}
```

- [ ] **Step 2: Update `ThemeToggle.test.tsx`**

In the test, mock `matchMedia` so reduced-motion returns true — the test then exercises the synchronous path (`setTheme` is called directly with no overlay involved). Existing assertions on `setTheme` should pass.

- [ ] **Step 3: Quality gates and manual verify**

```bash
pnpm test -- features/ui-components/__tests__/components/ThemeToggle.test.tsx --run
pnpm lint && pnpm type-check
```

Click toggle → radial circle expands from the toggle to farthest corner over 0.7s in target theme bg, theme flips at peak, overlay fades 0.35s.

- [ ] **Step 4: Commit**

```bash
git add features/ui-components/components/ThemeToggle.tsx \
        features/ui-components/__tests__
git commit -m "feat(theme): animated radial-unmask on theme swap"
```

---

## Task 14: Cursor-label audit

**Files:**
- Modify: various

- [ ] **Step 1: Grep current `data-cursor-label` usages**

```bash
grep -rn "data-cursor-label" features app
```

- [ ] **Step 2: Add missing labels**

| Element | File | Label |
|---|---|---|
| WorkRow article (live row) | `features/home/components/WorkRow.tsx` | hostname from `project.url` |
| WorkRow article (case-study row) | `features/home/components/WorkRow.tsx` | `"case study"` |
| Hero "Download Resume" link | (set in Task 2) | `"open"` |
| Case study close button | (set in Task 6) | `"close"` |
| Email copy button | (set in Task 10) | `"copy"` |
| Contact form submit | (set in Task 9) | `"send"` |
| Social links | (set in Task 10) | `"open"` |
| Back-to-top anchor | (set in Task 11) | `"open"` |

If any earlier task missed its label, edit the relevant file here.

- [ ] **Step 3: Manual verify**

Hover each labeled element on a fine-pointer device — cursor morphs into the amber pill with the correct label text.

- [ ] **Step 4: Quality gates and commit**

```bash
pnpm lint && pnpm type-check && pnpm test -- --run
git add -A
git commit -m "polish(cursor): full data-cursor-label audit across interactive elements"
```

---

## Task 15: Final translation cleanup

**Files:**
- Modify: `features/home/translations/en/pages.json`
- Modify: `features/home/translations/ar/pages.json`
- Modify: `features/ui-components/translations/*.json` (if any keys drift)

- [ ] **Step 1: Diff EN vs AR for parity**

```bash
node -e "
const en = require('./features/home/translations/en/pages.json');
const ar = require('./features/home/translations/ar/pages.json');
const walk = (o, p='') => Object.keys(o).flatMap(k => typeof o[k] === 'object' ? walk(o[k], p+k+'.') : [p+k]);
const enKeys = new Set(walk(en));
const arKeys = new Set(walk(ar));
console.log('In EN not AR:', [...enKeys].filter(k => !arKeys.has(k)));
console.log('In AR not EN:', [...arKeys].filter(k => !enKeys.has(k)));
"
```

Expect: both lists empty.

- [ ] **Step 2: Search for hardcoded English strings inside JSX**

```bash
grep -rn "Case Study\|Close case study\|Open menu\|Close menu\|Switch to" features app | grep -v "__tests__\|\.test\."
```

Any hits should be replaced with `t('...')` calls referencing existing keys (or new ones).

- [ ] **Step 3: Quality gates and commit**

```bash
pnpm lint && pnpm type-check && pnpm test -- --run
git add features/home/translations features/ui-components/translations features app
git commit -m "i18n: parity sweep — fill missing keys, replace hardcoded strings"
```

---

## Task 16: Full verification sweep

- [ ] **Step 1: Run the entire quality pipeline**

```bash
pnpm lint
pnpm type-check
pnpm format:check
pnpm test -- --run
pnpm test:e2e -- --project=chromium
```

All must pass.

- [ ] **Step 2: Run the verify spec to dump screenshots**

```bash
pnpm test:e2e -- --project=chromium e2e/verify.spec.ts
```

Inspect each PNG in `test-results/verify/` against the legacy at `localhost:8001/Portfolio.html`.

- [ ] **Step 3: Walk through every section in the browser at 1440 / 1024 / 768 / 375**

Verify per section: layout, animation order/timing, hover states, cursor labels, keyboard tab order, focus rings, theme-swap radial unmask, skip-link reachability, reduced-motion collapses animations.

- [ ] **Step 4: Run production build**

```bash
pnpm build
pnpm start
```

Verify no console errors and the same visual fidelity.

- [ ] **Step 5: Commit verification marker (optional)**

If everything passes without further fixes:

```bash
git commit --allow-empty -m "verify: full legacy-parity sweep passed"
```

---

## Task 17: STATE.md update

**Files:**
- Modify: `docs/STATE.md`

- [ ] **Step 1: Update STATE.md**

- Mark the legacy-parity task done.
- Note `legacy/` deletion is pending user sign-off.
- Bump "Last updated" to today.
- Add "Active task for next session" note pointing to Task 18.

- [ ] **Step 2: Commit**

```bash
git add docs/STATE.md
git commit -m "docs: STATE.md — legacy parity sweep complete, awaiting sign-off"
```

---

## Task 18: Delete `legacy/` (ONLY after explicit user sign-off)

Per user instruction `"keep the legacy/ until we get every thing successfully"`, do not delete until the user confirms parity holds.

- [ ] **Step 1: User confirms parity**

The user reviews `/en` and `/ar` against `legacy/Portfolio.html` and signs off.

- [ ] **Step 2: Remove legacy**

```bash
git rm -r legacy/
git commit -m "chore: remove legacy/ — Next.js port at full parity"
```

- [ ] **Step 3: Update STATE.md**

Remove the deletion-pending note.

```bash
git add docs/STATE.md
git commit -m "docs: STATE.md — legacy/ deleted, parity sweep closed"
```

---

## Self-review checklist (executor)

- [ ] Every section in the spec has a corresponding task above.
- [ ] No `TBD` / `TODO` / `fill in` placeholders.
- [ ] Code blocks show the actual code an engineer needs — no `...` standing in for required code.
- [ ] Type/prop/function names match across tasks (`delaySeconds` on `AvailabilityPill` in Task 2, `EmailCopyButton({ email })` in Task 10, `Field({ multiline })` in Task 9).
- [ ] Translation key names match between EN/AR additions and component usage (`hero.kicker`, `stack.intro1`, `contact.heading1/2`, `contact.phoneValue`, `contact.socials.*`, etc.).
- [ ] Tests are updated when component shape changes (Task 9: ContactForm + Field, Task 13: ThemeToggle, Task 4: TopNav).
- [ ] Each task ends with a green tree (lint + type-check + tests) before its commit.
- [ ] Task 18 (delete `legacy/`) is explicitly gated on user approval.
