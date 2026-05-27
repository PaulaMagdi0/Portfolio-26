# Project State / Handoff

**Last updated:** 2026-05-27 (parity sweep complete)
**Branch:** `feature/nextjs-conversion`
**Latest commit:** `82c438f fix(hero): unify h1 ownership between HeroHeadline and SplitReveal`
**Working tree:** clean

---

## Active task for the next session

**Visual sign-off on the legacy parity sweep.** Walk `/en` and `/ar` against `legacy/Portfolio.html` side-by-side and confirm parity holds. Once confirmed, run Task 18 in `docs/superpowers/plans/2026-05-27-legacy-parity.md` — delete `legacy/` and commit.

```bash
pnpm dev                                          # localhost:3000
cd legacy && python3 -m http.server 8001          # localhost:8001/Portfolio.html
```

Open both side-by-side at 1440 / 1024 / 768 / 375 viewport widths.

---

## Status at a glance

The Next.js 16 portfolio is **at full legacy parity**. All 7 home sections render in both `en` and `ar` locales. SEO is wired (sitemap, robots, OG images, Person JSON-LD, hreflang). **21/21 unit tests pass, 19/19 chromium E2E tests pass**, lint + format + type-check + build all green.

Two plans drove the work:
- `docs/superpowers/plans/2026-05-27-nextjs-conversion.md` — original port (35 tasks, all done except gated Task 35).
- `docs/superpowers/plans/2026-05-27-legacy-parity.md` — parity sweep (18 tasks; 17 done, Task 18 = delete `legacy/` is gated on user sign-off).

Spec: `docs/superpowers/specs/2026-05-27-legacy-parity-design.md`.

---

## Parity sweep — what landed

1. **SplitReveal hardened** — `mode='instant'`, 1.5s safety timeout that forces visible state when SplitText silently fails.
2. **Hero rebuilt** — eyebrow with animated amber rule + `Portfolio / 2026` label + AvailabilityPill at right (delay 1.0s); `<h1>` with char-stagger SplitReveal (instant mode); amber mono sub-kicker `Building systems that teams rely on.`; CTAs; 3D scene anchored right at lg+. Section id renamed `#hero` → `#top`.
3. **MetaCell removed** — was a net-new addition, not in legacy.
4. **TopNav rebuilt** — active-section detection (viewport 0.42 band), mono `01–05` amber number prefixes, scale-x amber underline on active, full-screen mobile drawer with serif 40px links + bottom pulse/clock/Cairo row.
5. **WorkRow polish** — `<article role="button">` semantics, framer-motion ArrowUpRight spring on hover/focus, focus-visible amber ring.
6. **CaseStudyDrawer parity** — top-16 below nav, sticky header with `CASE STUDY · <BADGE>` label, CSBlock delays match legacy (0.28 / 0.36 / 0.44 / 0.52 / 0.60 / 0.70).
7. **Stack rebuilt** — full-bleed marquee FIRST (speed 48), serif intro paragraph, 5 group rows with `01–05` amber indices + serif group titles + chip rows.
8. **Certifications rebuilt** — vertical list with magnetic logos (strength 0.35), 12-col rail with name/issuer/division/desc/CredId/skills.
9. **Contact rebuilt** — huge serif `Let's build something.` headline; 4/8 pitch+form grid; **underline-only** serif inputs (not boxed); magnetic submit with ArrowUpRight; **direct-contact strip** with click-to-copy email (Check icon crossfade + amber "copied" toast), phone, and 4 socials (GitHub/LinkedIn/LeetCode/HackerRank with brand SVGs and group-hover ArrowUpRight); **bottom strip** with footer credit + green-pulse LiveClock + Back-to-top anchor; giant `Paula` watermark at 0.04 opacity.
10. **BgSpotlight wired** — `--mx`/`--my` cursor follow that was sitting in dead CSS scaffolding.
11. **Theme-swap radial unmask** — GSAP clip-path shrink from full-screen to circle(0) at the toggle's click point, then opacity fade. Reduced-motion short-circuits.
12. **Cursor labels** — `data-cursor-label` set on download/case-study/copy/send/close/open across the page.
13. **Translation parity** — EN/AR fully synced (0 keys diverge). Added `hero.kicker`, `stack.intro1/introEmph`, `contact.phoneValue/footerBuilt/backToTop`, `nav.cairo`. Removed `hero.meta.*`.

---

## What's left (prioritized)

### 1. User sign-off + `legacy/` deletion (Task 18)

The **only remaining task in the parity plan**. After visual sign-off:

```bash
git rm -r legacy/
git commit -m "chore: remove legacy/ — Next.js port at full parity"
```

Then bump this file to remove the deletion-pending note.

### 2. Arabic OG image with proper script rendering (deferred)

`app/[locale]/opengraph-image.tsx` emits Latin text for both locales. Satori needs a bundled Noto Naskh Arabic font to render certain GSUB substitutions. Path: add font to `public/fonts/`, pass via `ImageResponse({ fonts })`, branch text on `safeLocale === 'ar'`.

### 3. Arabic translation polish (deferred)

The new keys (`hero.kicker`, `stack.intro*`, `contact.phoneValue/footerBuilt/backToTop`) were AI-drafted alongside the parity edits. A native Arabic reviewer should pass over the AR strings before shipping — tone target: editorial, professional, parallel to English.

### 4. Lighthouse SEO 92 → 100 (production env only)

SEO is 92 on localhost because the `canonical` audit fails when `NEXT_PUBLIC_SITE_URL` defaults to `http://localhost:3000`. Setting that env var to the real production URL lifts it to 100. No code change required.

### 5. Firefox/WebKit Playwright browsers (only if CI needs cross-browser)

`pnpm test:e2e` only runs Chromium locally — Firefox/WebKit binaries aren't installed. Run `npx playwright install` in CI if needed.

---

## How to verify the current state

```bash
git log --oneline feature/nextjs-conversion | head -25

pnpm lint                              # expect: clean
pnpm type-check                        # expect: clean
pnpm format:check                      # expect: clean
pnpm test -- --run                     # expect: 21/21 passed
pnpm test:e2e --project=chromium       # expect: 19/19 passed
pnpm build                             # expect: clean SSG of /en and /ar

pnpm dev                               # localhost:3000
```

---

## Key files to read first when resuming

1. `docs/superpowers/specs/2026-05-27-legacy-parity-design.md` — parity design doc.
2. `docs/superpowers/plans/2026-05-27-legacy-parity.md` — 18-task plan (Task 18 still open).
3. `docs/superpowers/plans/2026-05-27-nextjs-conversion.md` — original port plan (for context).
4. `.claude/CLAUDE.md` and `AGENTS.md` — project conventions.
5. `e2e/verify.spec.ts` — comprehensive flow regression check.
6. This file.

---

## Branch / merge state

Branch `feature/nextjs-conversion` is **ready for merge to `main`** once Task 18 (delete `legacy/`) is signed off. No remote configured; to push:

```bash
git remote add origin <your-repo-url>
git push -u origin feature/nextjs-conversion
```
