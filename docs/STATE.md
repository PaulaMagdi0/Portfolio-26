# Project State / Handoff

**Last updated:** 2026-05-28 (v3 sweep done; AR localization 80% done; 3 small files left)
**Branch:** `feature/nextjs-conversion`
**Latest commit:** `6feb01c fix(i18n): update Arabic clock location code translation from "كاي" to "قاه"`
**Working tree:** clean
**Quality gates:** `pnpm type-check` ✓ clean (last verified after `1d62bc0`)

---

## Active task for the next session

**Finish the 3 remaining localization files**, then run quality gates, do the AR visual walk-through, and delete `legacy/`.

The remaining work is described in `docs/superpowers/plans/2026-05-28-i18n-finish.md` (3 short tasks). Each file is a small mechanical edit — the v3 spec is closed.

### What ships AFTER those 3 commits

1. AR-complete: every visible string + every numeral is locale-aware.
2. Branch is ready for merge to `main`.
3. `legacy/` can be deleted (`git rm -r legacy/`).

---

## What shipped this run (26 commits since the v3 baseline)

### v3 parity sweep (Tasks 1-14, commits `e0a11c8` → `5d8de20`)
All 14 screenshot-review tasks landed. See `docs/superpowers/plans/2026-05-27-legacy-parity-v3.md` for spec details.

### Post-v3 hot-fixes (commits `62d0026` → `3e56d47`)
- Hero 3D scene re-anchored to the 1200px content column (was floating off the viewport edge)
- Amber eyebrow rule baseline `scaleX(1)` so it paints before the CSS keyframe runs
- WorkRow title row restored to legacy structure: inline arrow, `title-underline` on inner span (tracks text not the box), `shrink-0` on arrow, `mb-3` wrapper

### AR localization batch (commits `a8065af` → `1d62bc0`)
- **SplitText skip for Arabic** (`a8065af`) — character splitting was breaking Arabic letter shaping; reduced-motion-style fade for RTL
- **Per-glyph Latin/Arabic font fallback** (`b5f9f6a`) — Latin face first in font stack; Cairo/Noto Naskh loaded with `subsets:['arabic']` so Latin codepoints fall through to Inter/Instrument Serif/JetBrains Mono naturally
- **AR hero headline size override** (`b5f9f6a`) — `clamp(48px, 8vw, 92px)` so the Arabic headline fits beside the 3D scene
- **RTL logical properties** (`02ea765`) — `end-*` and `ms-*` for the hero 3D anchor + eyebrow pill + social arrow
- **Translation infrastructure** (`60f4de6`) — `ui.brand`, `ui.clock`, `ui.cursor` namespaces in both locales; `lib/digits.ts` with `toLocaleDigits(value, locale)` mapping `0-9` → `٠-٩` on AR
- **PageLoader** (`e383d6d`) — brand, portfolio, cairo, counter digits all locale-aware
- **TopNav + SectionHead** (`6f9756a`) — brand via `t('brand.name')`; section number digits via `toLocaleDigits`
- **TopNav `tBrand` hook + LiveClock + Hero + AnimatedMetric** (`1d62bc0`) — LiveClock uses `ar-EG-u-nu-arab` Intl.DateTimeFormat on AR; Hero resume `data-cursor-label` translated; AnimatedMetric live-counting digits localized
- **Arabic clock location code** (`6feb01c`) — `ui.clock.locationCode` updated to `"قاه"` (was `"كاي"`)

### Plans
- `docs/superpowers/plans/2026-05-27-nextjs-conversion.md` — original 35-task port (complete except Task 35 — legacy/ deletion, still gated)
- `docs/superpowers/plans/2026-05-27-legacy-parity.md` — v1 sweep (Task 18 / legacy/ deletion still gated)
- `docs/superpowers/plans/2026-05-27-legacy-parity-v2.md` — v2 sweep (complete)
- `docs/superpowers/plans/2026-05-27-legacy-parity-v3.md` — v3 sweep (complete; commits `e0a11c8` → `5d8de20`)
- `docs/superpowers/plans/2026-05-28-i18n-finish.md` — **active plan**: 3 remaining localization edits

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
2. **`docs/superpowers/plans/2026-05-28-i18n-finish.md`** — the active 3-task plan.
3. `.claude/CLAUDE.md` and `AGENTS.md` — project conventions.
4. `legacy/Portfolio.html` + `legacy/src/*.jsx` — design source-of-truth (still on disk, deletion gated on sign-off).

---

## Branch / merge state

Branch `feature/nextjs-conversion` is **NOT yet ready for merge** — finish the 3 i18n tasks, run gates, visual walk both locales, then delete `legacy/`, then merge.
