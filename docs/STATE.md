# Project State / Handoff

**Last updated:** 2026-05-28 (round 2 of animation parity — caught 4 more misses the first audit pass missed; awaiting visual sign-off and `legacy/` deletion)
**Branch:** `feature/nextjs-conversion`
**Working tree:** clean
**Quality gates after round 2:** lint ✓, type-check ✓, build ✓ (vitest + e2e not re-run this session)

### Round 2 — animations the first audit missed

Round 1 (commits `27508da` → `c76d959`) ported the drift rows the explore-agent audit caught. The user then identified 4 additional gaps that the audit had classified as `match` when they weren't. All four are now fixed in this run:

1. **WorkRow metrics rendered as static text** — `features/home/components/WorkRow.tsx:181` rendered `{m.value}` directly. Legacy uses `<AnimatedMetric>` to tween 0→N over 1.6s ease-out cubic. The `AnimatedMetric` component already existed and was used in CaseStudyDrawer but wasn't wired up to WorkRow. **Fix:** import and wrap.

2. **SplitReveal scroll-mode safety timer killed char cascades** — `features/ui-components/components/SplitReveal.tsx:118` set a 1500ms safety timer that fired regardless of mode. In scroll mode, when a section was below the fold for >1.5s, the safety force-revealed the chars (`yPercent: 0, opacity: 1`); the observer later triggered `play()` but the GSAP tween then animated `0→0` — no visible cascade. This was the "section H2s appear instantly" symptom. **Fix:** safety timer now only runs in `mode === 'instant'`; scroll mode relies on the observer alone.

3. **PageLoader unmounted before its CSS curtain wipe could play** — `features/ui-components/components/PageLoader.tsx:82` returned `null` immediately after adding `html.loaded`. The 1.1s `clip-path: inset(0 0 100% 0)` transition (defined in `globals.css:499-503`) never played because React removed the element first. **Fix:** keep the element mounted for 1200ms after adding the `loaded` class.

4. **CaseStudyDrawer h2 + meta row had no entrance** — `features/home/components/CaseStudyDrawer.tsx:85` was a plain `<h2>`. Legacy uses a `motion.h2` (opacity 0→1, y 24→0, 0.75s ease [0.2,0.7,0.2,1], delay 0.05) plus a separate `motion.div` meta row for company · period (delay 0.18s). **Fix:** wrap h2 in `motion.h2` and add the meta row underneath.

---

## Active task for the next session

**Visual sign-off on the animation ports, then delete `legacy/` and merge.**

Plans:
- Audit: `docs/superpowers/plans/2026-05-28-legacy-animation-audit.md`
- Port batches + triage: `docs/superpowers/plans/2026-05-28-animation-port-batches.md`
- Audit spec (post-port, all rows now `match`): `docs/superpowers/specs/2026-05-28-animation-audit.md`

Side-by-side walk against `legacy/Portfolio.html` (served at `localhost:8001` via `cd legacy && python3 -m http.server 8001`) on `/en` and `/ar`, both themes, at 1440 / 1024 / 768 / 375. Focus areas — these are the ones that just changed:

1. **ClipReveal** (WorkRow swatches): clip-path bottom-edge reveal + scale 1.1→1.
2. **Reveal**: items now fire on `margin: '-80px'` not `amount: 0.2` — they enter slightly later.
3. **MaskReveal**: one-line text reveals glide for 1.1s (was 0.9s).
4. **TopNav**: scroll-state bg/border eases over 500ms (was 300ms).
5. **ScrollProgress**: top bar now glides over 100ms (was raw RAF snap).

On sign-off:
- `pnpm test:e2e --project=chromium` (skipped this session)
- `git rm -r legacy/` + commit
- merge `feature/nextjs-conversion` → `main`

---

## What shipped this run

### i18n finish — 3 remaining files (commits `944666a` → `5e3606d`)
- **Contact.tsx** (`944666a`) — `ui.cursor.open/top` cursor labels; `ui.brand.watermark`; phone wrapper bidi
- **WorkRow.tsx** (`f38e243`) — `ui.cursor.caseStudy/visit` cursor labels; index/total digits via `toLocaleDigits`
- **not-found.tsx** (`5e3606d`) — `ui.brand.watermark`

### Visual + i18n polish (commits `8fed0f7` → `2b434ca`)
- **Marquee + cursor labels + social arrows** (`8fed0f7`) — `ui.cursor.send/copy`, `ui.stack.marqueeLabel`, `home.contact.copyAria` keys; EmailCopyButton and ContactForm cursor labels via next-intl; social arrow `rtl:-scale-x-100` mirroring
- **Cert dates + phone bidi** (`a6c1ada`) — `home.certs.{id}.issued/expires` keys with Arabic month names + Arabic-Indic year digits; Contact phone wrapped in `<bdi>` for clean right-alignment under RTL
- **Marquee RTL bugfix v1** (`5d5a665`) — reverted my own broken RTL reverse-scroll; added `dir="ltr"` to inner track
- **Marquee RTL bugfix v2** (`169b370`) — moved `dir="ltr"` to the wrap div so the inner aligns to the wrap's left edge regardless of locale (root cause: RTL inheritance pinned the `width: max-content` child to the right edge)
- **Contact bottom strip polish** (`bf92a6e`) — vertical divider between LiveClock and back-to-top; link brightened from `text-inkdim`/11px to `text-ink`/12px with `hover:text-amber`
- **Hero resume cursor label vs. icon** (`e3ed2a4` → `6309285`) — added `ui.cursor.download`, then swapped the download glyph for an external-link arrow and reverted the cursor back to `tCursor('open')` so icon + action (`target="_blank"`) + cursor all agree
- **Resume.pdf rename** (`2b434ca`) — file capitalization aligned

### Plans
- `docs/superpowers/plans/2026-05-27-nextjs-conversion.md` — original 35-task port (complete except Task 35 — `legacy/` deletion, still gated)
- `docs/superpowers/plans/2026-05-27-legacy-parity.md` — v1 sweep (Task 18 / `legacy/` deletion still gated)
- `docs/superpowers/plans/2026-05-27-legacy-parity-v2.md` — v2 sweep (complete)
- `docs/superpowers/plans/2026-05-27-legacy-parity-v3.md` — v3 sweep (complete)
- `docs/superpowers/plans/2026-05-28-i18n-finish.md` — i18n finish (**complete**; all 3 commits landed)
- `docs/superpowers/plans/2026-05-28-legacy-animation-audit.md` — **active plan**: animation parity audit + porting

---

## How to verify

```bash
git log --oneline feature/nextjs-conversion | head -30

pnpm lint                              # expect: clean
pnpm type-check                        # expect: clean
pnpm format:check                      # expect: clean
pnpm test -- --run                     # expect: 21/21 passed
pnpm test:e2e --project=chromium       # expect: 19/19 passed
pnpm build                             # expect: clean SSG of /en and /ar
pnpm dev                               # localhost:3000
```

Walk `/en` and `/ar` at 1440 / 1024 / 768 / 375 against `legacy/Portfolio.html` (served at `localhost:8001` via `cd legacy && python3 -m http.server 8001`).

---

## Key files to read first when resuming

1. **This file (STATE.md).** Active task + status.
2. **`docs/superpowers/plans/2026-05-28-legacy-animation-audit.md`** — the active animation audit plan.
3. `.claude/CLAUDE.md` and `AGENTS.md` — project conventions.
4. `legacy/Portfolio.html` + `legacy/src/*.jsx` — design + motion source-of-truth (still on disk, deletion gated on animation parity sign-off).

---

## Branch / merge state

Branch `feature/nextjs-conversion` is **NOT yet ready for merge** — run the animation audit, port any motion gaps, do a final visual walk on both locales, then delete `legacy/`, then merge.
