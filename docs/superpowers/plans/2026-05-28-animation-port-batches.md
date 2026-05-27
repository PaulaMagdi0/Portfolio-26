# Animation Parity — Port Batches (Phase 2 + 3)

**Created:** 2026-05-28
**Branch:** `feature/nextjs-conversion`
**Parent plan:** [`2026-05-28-legacy-animation-audit.md`](./2026-05-28-legacy-animation-audit.md)
**Audit source:** [`docs/superpowers/specs/2026-05-28-animation-audit.md`](../specs/2026-05-28-animation-audit.md)

This file is the Phase 2 triage output: a decision per `drift` row from the audit, grouped into commit-sized batches for Phase 3.

---

## Triage decisions

12 drift rows + 1 additive. Decisions below.

| # | Row | Decision | Reasoning |
|---|-----|----------|-----------|
| 1 | Hero eyebrow fade (0.5s implicit → 0.7s explicit) | **Keep current** | Sits inside a layered Hero entrance (1.1s rule, 1.0s headline, 0.9s kicker, 0.9s CTA). 0.7s ease-out reads as designed rather than as a default. No visible regression. Mark audit row → `match`. |
| 2 | TopNav scroll state (500ms → 300ms) | **Port** | Header settles ~40% faster than designed. Easy single-token change. |
| 3 | Reveal viewport (`margin: '-80px'` → `amount: 0.2`) | **Port** | Different IntersectionObserver semantics → content reveals at a different scroll offset than the legacy design. Restoring `margin: '-80px'` is the simpler/safer change and is what the legacy file ships. |
| 4 | ClipReveal (clipPath inset dropped, IntersectionObserver replaces ScrollTrigger) | **Port** | This is the most visible drift. Legacy reveals the swatch from a bottom mask while scaling; current only scales. Affects WorkRow swatches and any other ClipReveal usage. |
| 5 | MaskReveal duration (1.1s → 0.9s) | **Port** | 200ms faster than designed. Used in one-line text reveals — easy to swing back. |
| 6 | WorkRow swatch ClipReveal | **Inherited port** | Resolves automatically when ClipReveal (#4) is ported. No separate code change. |
| 7 | CaseStudyDrawer backdrop fade (0.25s → 0.3s) | **Keep current** | 50ms on a translucent overlay is below visual threshold. Mark audit row → `match`. |
| 8 | CaseStudy contributions list delay offset (0.62 → 0.6) | **Keep current** | 20ms behind the 0.45s drawer slide. Imperceptible. Mark audit row → `match`. |
| 9 | CaseStudy metrics grid delay offset (0.75 → 0.68) | **Keep current** | 70ms inside a 0.55s sequenced grid that has already begun fading in. Imperceptible. Mark audit row → `match`. |
| 10 | CaseStudy stack tags delay offset (0.85 → 0.78) | **Keep current** | 70ms inside a 0.4s tag stagger. Imperceptible. Mark audit row → `match`. |
| 11 | Stack marquee speed (48 → 50 px/s) | **Port** | Trivial one-line change to restore the legacy speed. ~4% slowdown — borderline imperceptible, but cost is zero. |
| 12 | ScrollProgress bar (smoothing transition dropped) | **Port** | Legacy smooths each scroll update with a 100ms ease-out CSS transition. Current updates the transform raw via RAF. Affects the top-of-page progress indicator on every scroll. |
| (A) | LocaleSwitcher open/close (additive — stub, no motion) | **Defer** | Out of scope. Log a future polish task if the switcher gets a real menu surface. |

**Net:** 5 Port targets (+1 inherited), 5 Keep, 1 Defer.

---

## Port batches

One commit per batch. Each commit message format: `feat(motion): <area> — <what changed>`.

### Batch 1 — Reveal viewport & MaskReveal duration

Smallest, lowest-risk motion-primitive changes. Both are local to `features/ui-components/`.

**Files:**
- `features/ui-components/components/Reveal.tsx` — change viewport from `{ once: true, amount: 0.2 }` to `{ once: true, margin: '-80px' }`.
- `features/ui-components/components/MaskReveal.tsx` — change transition duration from `900ms` to `1100ms`.

**Verification:**
- Visual check at `/en` and `/ar` against `legacy/Portfolio.html` (served at `localhost:8001`).
- Section heads, Experience timeline, Certifications, Stack groups should fire slightly later than they do now.
- One-line text reveals (where MaskReveal is used) should glide for 200ms longer.

**Commit:** `feat(motion): reveal — restore legacy viewport margin and MaskReveal 1.1s duration`

---

### Batch 2 — ClipReveal full reveal animation

The largest behavior change. Restores clip-path inset reveal alongside the scale, and swaps the IntersectionObserver trigger back to GSAP ScrollTrigger.

**File:**
- `features/ui-components/components/ClipReveal.tsx` — wire GSAP timeline:
  - Outer wrapper: `clipPath: inset(0 0 100% 0)` → `inset(0 0 0% 0)`.
  - Inner: `scale: 1.1` → `scale: 1`.
  - Duration 1.1s, ease power3.out.
  - Trigger: ScrollTrigger `start: 'top 88%', once: true`.
  - Honor `prefers-reduced-motion` — skip both transforms and immediately set final state.

**Verification:**
- WorkRow swatches should reveal from a bottom-edge mask, not just scale.
- Section media (if any uses ClipReveal) should match.
- Reduced-motion users should see swatches at final state with no animation.

**Commit:** `feat(motion): clip-reveal — restore clipPath inset reveal + ScrollTrigger`

---

### Batch 3 — TopNav scroll transition timing

Restore the 500ms settling duration on scroll-state changes.

**File:**
- `features/ui-components/components/TopNav.tsx` — change `transition-[background-color,border-color,backdrop-filter] duration-300` to `duration-500`.

**Verification:**
- Scroll past 20px from the top — header bg/border/backdrop should ease in over 500ms, not snap in 300ms.
- Side-by-side with legacy.

**Commit:** `feat(motion): top-nav — restore 500ms scroll-state transition`

---

### Batch 4 — ScrollProgress smoothing

Restore the 100ms ease-out CSS transition on the progress bar's scaleX.

**File:**
- `features/ui-components/components/ScrollProgress.tsx` — add `transition: transform 100ms ease-out` to the bar element (Tailwind: `transition-transform duration-100 ease-out`). Keep the RAF-driven scaleX update; CSS handles the smoothing between frames.

**Verification:**
- Fast scroll: bar should glide rather than jump per frame.
- Slow scroll: bar tracks continuously.
- Reduced-motion: transition should still be 100ms (it's a continuous indicator, not a discrete animation — safe to keep).

**Commit:** `feat(motion): scroll-progress — add 100ms ease-out smoothing`

---

### Batch 5 — Stack marquee speed

Restore legacy 48 px/s default.

**File:**
- `features/ui-components/components/Marquee.tsx` — change default speed from `50` to `48`.

**Caveat:** if any other consumer of Marquee depends on the current speed, audit before changing the default. (Stack is the only consumer in the home page audit; confirm with a grep before committing.)

**Verification:**
- Stack marquee should be marginally slower (4%).
- All other marquee usages, if any, should be reviewed for the same change.

**Commit:** `feat(motion): marquee — restore legacy 48 px/s default speed`

---

## After all batches

```bash
pnpm lint
pnpm type-check
pnpm format:check
pnpm test -- --run
pnpm test:e2e --project=chromium
pnpm build
```

All must pass.

Then update `docs/superpowers/specs/2026-05-28-animation-audit.md`:
- Flip the 5 "Keep current" rows from `drift` to `match` with a one-line note (`Keep — drift below visible threshold`).
- Flip the 5 ported rows from `drift` to `match`.
- Update the Summary block.

Then `docs/STATE.md`:
- Bump "Last updated" line.
- Note the animation parity batches landed.
- Hand off to Phase 4 (legacy/ deletion).

---

## Phase 4 — sign-off + cleanup

(Same as the parent plan.)

1. Final visual walk on `/en` and `/ar`, both themes, at 1440 / 1024 / 768 / 375.
2. Side-by-side with `legacy/Portfolio.html` for every batch.
3. On sign-off: `git rm -r legacy/`, commit as `chore: remove legacy reference build`. Branch is ready to merge.
