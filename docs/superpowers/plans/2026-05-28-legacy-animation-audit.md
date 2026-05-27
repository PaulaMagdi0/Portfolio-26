# Legacy Animation Audit + Porting

**Created:** 2026-05-28
**Branch:** `feature/nextjs-conversion`
**Goal:** Reach full motion parity with `legacy/Portfolio.html`. Anything that animates in legacy but is static, missing, or visibly different in the Next.js port gets ported or matched.

This is the last blocker before `legacy/` can be deleted and the branch can merge.

---

## Why this exists

Most components have already been ported. Some animations may have drifted in timing/easing/sequence during the port, and a few may have been dropped entirely. We need a structured comparison rather than a memory-driven sweep.

---

## Phase 1 — Audit (no code writes)

Dispatch an Explore agent with this prompt:

> Audit `legacy/Portfolio.html` and `legacy/src/*.jsx` for every animation. For each one, produce a row in a markdown table with these columns:
>
> 1. **Location** — what section / component owns it (e.g. `Hero headline`, `WorkRow hover`, `PageLoader counter`).
> 2. **Legacy implementation** — library (GSAP / Framer Motion / CSS keyframes / `requestAnimationFrame`), the key timing values (duration, delay, easing), and the trigger (mount, scroll, hover, click, intermediate state).
> 3. **Current Next.js implementation** — file path under `features/` or `core/`, library used, trigger and timing values.
> 4. **Status** — `match` / `drift` / `missing`.
> 5. **Notes** — for `drift` rows, summarize the visible difference; for `missing` rows, summarize what the legacy effect looks like.
>
> Cover at minimum:
> - PageLoader intro (counter, sub-labels, dismiss transition)
> - Hero entrance: amber rule, eyebrow fade, headline SplitReveal, kicker fade, CTA group fade
> - Hero 3D scene mount / parallax
> - TopNav scroll-state changes (background, border, active section indicator)
> - LiveClock tick / pulse
> - SectionHead reveal
> - Reveal / ClipReveal / SplitReveal scroll-trigger behaviors
> - Work section: row hover (arrow + title underline + swatch parallax), card tilt, scroll-into-view
> - Case-study drawer open/close
> - Experience timeline reveal
> - Education + Certifications row reveals
> - Stack: marquee scroll + group row reveals + tag hover
> - Contact: heading SplitReveal, form field focus/error transitions, EmailCopyButton copied state, ContactForm submit state transitions, back-to-top hover
> - Theme toggle (radial unmask from click point)
> - LocaleSwitcher open/close
> - CustomCursor: position lerp, label fade, hover state expand
> - ScrollProgress bar
> - Magnetic component pull
> - Reduced-motion fallbacks (which animations short-circuit and how)
>
> Do not write any code. Output the table only. Keep timing values exact (don't round). If something is gone from the legacy file but present in the Next.js port, mark it as `additive`.

Save the agent output verbatim to `docs/superpowers/specs/2026-05-28-animation-audit.md`.

---

## Phase 2 — Triage

Read the audit. For each `drift` and `missing` row, decide one of:

- **Port** — port the legacy behavior to the Next.js code.
- **Keep current** — the current behavior is better or equivalent; update the audit row to `match` with a note explaining why.
- **Defer** — niche detail, log as a future polish task.

Group `port` rows into commit-sized batches by section.

---

## Phase 3 — Port

One commit per batch. For each batch:

1. Write the diff using existing motion primitives (`@/core/motion` exposes `gsap`, ScrollTrigger, Lenis). Prefer adding to existing components over creating new ones.
2. Test against legacy at the relevant viewport widths (`localhost:8001` via `cd legacy && python3 -m http.server 8001`).
3. Verify reduced-motion fallback short-circuits the new motion.
4. Commit with `feat(motion): <section> — <what changed>` format.

After all batches:

```bash
pnpm lint
pnpm type-check
pnpm format:check
pnpm test -- --run
pnpm test:e2e --project=chromium
pnpm build
```

All must pass.

---

## Phase 4 — Sign-off + cleanup

1. Final visual walk on `/en` and `/ar`, both themes, at 1440 / 1024 / 768 / 375.
2. Side-by-side with `legacy/Portfolio.html` for any animation that was ported.
3. On sign-off: `git rm -r legacy/`, commit as `chore: remove legacy reference build`, and the branch is ready to merge.

---

## Out of scope

- New animations not present in legacy (use a separate polish plan if desired).
- Three.js scene tuning (already at parity; if drift is found, log separately).
- Performance regressions — measure with `pnpm analyze` only if a port adds noticeable bundle weight.
