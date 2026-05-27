# Project State / Handoff

**Last updated:** 2026-05-28 (AR localization complete; visual polish done; animation parity audit is next)
**Branch:** `feature/nextjs-conversion`
**Latest commit:** `2b434ca fix(resume): update references to 'resume.pdf' to 'Resume.pdf' for consistency`
**Working tree:** clean
**Quality gates (last full run after `6309285`):** lint ✓, type-check ✓, format ✓, vitest 21/21 ✓, playwright 19/19 ✓, build ✓

---

## Active task for the next session

**Audit legacy animations vs. the current Next.js implementation, then port any missing or drifted motion.**

Use the plan: `docs/superpowers/plans/2026-05-28-legacy-animation-audit.md`.

Suggested opening message for the next session:

> Read `docs/STATE.md`, then dispatch an Explore agent to audit
> `legacy/Portfolio.html` + `legacy/src/*.jsx` for every animation
> (page loader, hero text reveals, scroll triggers, hover effects,
> marquee, theme transitions, cursor, menu open/close). Return a gap
> list: legacy spec vs. current Next.js implementation, flagging
> anything missing or with different timing/easing. Don't write code
> yet.

### What ships AFTER the animation pass

1. Visual + motion parity with the legacy build on both `/en` and `/ar`.
2. Branch is ready for merge to `main`.
3. `legacy/` can be deleted (`git rm -r legacy/`).

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
