# Legacy Parity Sweep v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) or superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close every remaining visual/behavioral drift between `legacy/` and the Next.js port that survived the v1 sweep, plus restore a `MetaCell` info strip between Hero and Work.

**Architecture:** Targeted file-by-file edits. No new components except `MetaCell.tsx`. Each task touches a self-contained area and ends with a commit.

**Tech Stack:** Next.js 16, React 19, TS strict, Tailwind v4, GSAP, Framer Motion, next-intl.

**Audit source-of-truth:** Four parallel Explore agents diffed legacy ↔ current. See `docs/superpowers/specs/2026-05-27-legacy-parity-design.md` for the original parity spec.

---

## Task 1: SectionHead layout, margin, tracking

**Files:**
- Modify: `features/ui-components/components/SectionHead.tsx`

**Drift:** Legacy uses `gap-6` outer + `gap-4` inner, `md:mb-16`, `translate-y-[-2px]` on rule, and `tracking-[0.2em]` for the amber `num`. Current is `gap-4` flat, `md:mb-14`, no rule offset, num inherits `0.18em` from `.section-num`.

- [ ] Edit `SectionHead.tsx` to: outer `gap-6`, inner `gap-4`, `md:mb-16`, num `font-mono text-[11px] tracking-[0.2em] uppercase text-amber`, rule `-translate-y-[2px]`.
- [ ] Commit: `fix(section-head): restore legacy gap-6/gap-4, mb-16, rule -2px, num tracking 0.2em`

---

## Task 2: Magnetic — Framer Motion spring physics

**Files:**
- Modify: `features/ui-components/components/Magnetic.tsx`

**Drift:** Current uses raw DOM `style.transform`, instant on every mousemove. Legacy uses a Framer Motion spring (`stiffness: 200, damping: 18, mass: 0.4`).

- [ ] Replace DOM transform with `useMotionValue` + `useSpring({ stiffness: 200, damping: 18, mass: 0.4 })`, render with `motion(Component)`.
- [ ] Commit: `fix(magnetic): restore Framer spring physics`

---

## Task 3: CustomCursor — render label as styled span

**Files:**
- Modify: `features/ui-components/components/CustomCursor.tsx`

**Drift:** `ring.textContent = label` strips `.cursor-label` styling. Legacy renders `<span class="cursor-label">` inside the ring.

- [ ] Replace `textContent` with a managed child `<span class="cursor-label">` created/removed via DOM.
- [ ] Commit: `fix(cursor): render data-cursor-label inside .cursor-label span`

---

## Task 4: TopNav mobile active + hamburger offsets

**Files:**
- Modify: `features/ui-components/components/TopNav.tsx`

**Drift:** Mobile active link is `text-ink` — should be `text-amber`. Hamburger `-translate-y-1.5 / translate-y-1.5` — should be `-1 / 1`.

- [ ] Active class → `text-amber`. Hamburger spans → `-translate-y-1` / `translate-y-1`.
- [ ] Commit: `fix(nav): mobile active amber, hamburger spans -y-1/+y-1`

---

## Task 5: LiveClock + AvailabilityPill styling

**Files:**
- Modify: `features/ui-components/components/LiveClock.tsx`
- Modify: `features/ui-components/components/AvailabilityPill.tsx`

**Drift:** LiveClock renders unstyled text. Legacy: `font-mono text-[11px] tracking-[0.18em] text-inkdim tabular-nums`. AvailabilityPill dot `h-1.5 w-1.5` — should be `h-2 w-2`.

- [ ] LiveClock: wrap with styled span. AvailabilityPill: dot `h-2 w-2`.
- [ ] Commit: `fix(chrome): LiveClock mono+tracking, AvailabilityPill 8px dot`

---

## Task 6: CaseStudyDrawer + AnimatedMetric timings

**Files:**
- Modify: `features/home/components/CaseStudyDrawer.tsx`
- Modify: `features/home/components/AnimatedMetric.tsx`

**Drift:**
- Contribution amber rule: delay `0.67` → `0.70`, `mt-2.5` → `mt-2`
- Drawer sticky header: `tracking-[0.18em]` → `tracking-[0.2em]`
- AnimatedMetric default `durationMs = 1200` → `1600`

- [ ] Apply each edit.
- [ ] Commit: `fix(case-study): rule delay 0.70+mt-2, header 0.2em, metric 1.6s`

---

## Task 7: Certifications, Stack, Contact micro-drifts

**Files:**
- Modify: `features/home/components/Certifications.tsx`
- Modify: `features/home/components/Stack.tsx`
- Modify: `features/home/components/Contact.tsx`
- Modify: `features/contact-form/components/Field.tsx`

**Drift:**
- Cert `<img>`: add `opacity-90`
- Stack `Marquee`: pass `pauseOnHover` + `draggable`; chips `text-[12px]` not `[11px]`
- Field input: error border `border-amber`; default `border-line focus:border-amber/70`
- Paula watermark `<p>`: add `text-center`
- Bottom-strip pulse dot: `h-2 w-2` → `h-1.5 w-1.5`

- [ ] Apply each edit.
- [ ] Commit: `fix(sections): cert opacity, stack chip 12px, field error border, watermark center, pulse 1.5`

---

## Task 8: Restore MetaCell strip between Hero and Work

**Files:**
- Create: `features/home/components/MetaCell.tsx`
- Create: `features/home/components/HeroMetaStrip.tsx`
- Modify: `features/home/components/index.ts`
- Modify: `features/home/translations/en/pages.json`
- Modify: `features/home/translations/ar/pages.json`
- Modify: `app/[locale]/page.tsx`

Render between Hero and Work, inside a `max-w-[1200px]` container, with `border-y border-line py-8`:
`[Based in: Cairo, EG] [Years coding: 6+] [Currently: Challenge Group] [Email: p.magdy@…]`

- [ ] Add `MetaCell` + `HeroMetaStrip` (server component that calls `getTranslations`).
- [ ] Wire `home.meta.{location,years,currently,email}` keys in en + ar pages.json.
- [ ] Mount `<HeroMetaStrip />` after `<Hero />` in `app/[locale]/page.tsx`.
- [ ] Commit: `feat(home): MetaCell info strip between Hero and Work`

---

## Task 9: Quality gates + visual verify

- [ ] `pnpm lint && pnpm type-check && pnpm test -- --run`
- [ ] `pnpm dev` and walk `/en` + `/ar` at 1440/1024/768/375
- [ ] Compare side-by-side with `legacy/Portfolio.html`
- [ ] Final patch commit if test snapshots/assertions need updating
