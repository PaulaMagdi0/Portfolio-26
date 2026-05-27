# Project State / Handoff

**Last updated:** 2026-05-27 (v3 parity sweep complete; awaiting sign-off + legacy/ deletion)
**Branch:** `feature/nextjs-conversion`
**Latest commit:** `5d8de20 chore(parity-v3): test mocks + prettier polish for gate run`
**Working tree:** clean

---

## Active task for the next session

**Visual sign-off + legacy deletion.** All 14 v3 tasks are committed and quality gates green (lint, type-check, format, 21/21 unit, 19/19 e2e chromium, build). Walk both `/en` and `/ar` against `legacy/Portfolio.html` at 1440/1024/768/375. If everything passes muster, delete `legacy/` (v1 Task 18) and the branch is ready for merge.

Quick gate of what shipped in v3:

- Task 1: cursor centering — `translate(rx,ry) translate(-50%,-50%)`
- Task 2: sun/moon SVG inside ThemeToggle knob
- Task 3: hero eyebrow `flex-wrap gap-x-4 gap-y-3` + `lg:max-w-[58%]` headline container, scaled lg+ font down to fit one line
- Task 4: title underline hover-only — added `text-decoration:none`, lifted selector to `.work-row.group:hover .title-underline`
- Task 5: Certifications left-rail (md:col-span-3 heading, md:col-span-9 list), concise `Issued → Expires` dates, removed unused `issued/expires` translation keys
- Task 6: Stack `py-6 md:py-8` rows, `mb-16` intro, `leading-none` group titles, italic emph
- Task 7: Contact heading `<em>` now `italic` (was `not-italic`)
- Task 8: back-to-top `data-cursor-label="top"`
- Task 9: MetaCell labels — "Open to / Senior full-stack & consulting" + "Reply within / 24 hours" (both locales)
- Task 10: theme-swap rewritten — overlay grows 0→maxR with NEXT theme color, then `setTheme(next)` on complete, then fade
- Task 11: Cairo + Noto_Naskh_Arabic via `next/font` (preload:false), `html[lang="ar"]` font-family overrides in globals.css
- Task 12: 404 redesign — eyebrow + `text-[28vw]` serif numeral + ghost CTA + Paula watermark; `ui.notFound.*` keys in en/ar
- Task 13: trimmed Inter weights to 300/400; JetBrains_Mono to 400
- Task 14: gsap mock added to vitest.setup.ts so ThemeToggle test passes with new async setTheme path; Certifications row promoted to `<Reveal as="li">` so `<ol>` has direct `<li>` children (axe-clean)

Once you sign off, run:

```bash
git rm -r legacy/ && git commit -m "chore: remove legacy/ — Next.js port at full parity"
```

---

## Original v3 task index (kept for reference — all done)

```bash
pnpm dev                                          # localhost:3000
cd legacy && python3 -m http.server 8001          # localhost:8001/Portfolio.html
```

Open both side-by-side at 1440 / 1024 / 768 / 375 viewport widths.

### The 14 queued items (in priority order)

1. **Cursor centering bug.** `CustomCursor.tsx:22-23` sets `transform: translate(rx,ry)` which clobbers the CSS `translate(-50%,-50%)` centering. Combine both — use `translate(${rx}px,${ry}px) translate(-50%,-50%)` or position via `left/top` and keep CSS centering.

2. **ThemeToggle sun/moon icons missing.** Legacy `components.jsx:521-525` renders `<Icon.Sun|Moon className="ico" />` inside `.knob`. Current `ThemeToggle.tsx:79` renders empty `<span className="knob" />`. Add the inline SVG so the existing `.ico` CSS (`globals.css:380-384`) takes effect.

3. **Hero eyebrow row spacing + headline width.** Current `Hero.tsx:24` uses `gap-4` between rule and PORTFOLIO label; legacy keeps them tight (visually). Also "Software Engineer" wraps to two lines at lg+ — give the headline its own row with `max-w-[1100px]` or similar so it lays out on one line at ≥lg matching legacy `sections.jsx:106`.

4. **Project title underline always-on.** `WorkRow.tsx:137` has `title-underline inline` but the title appears underlined without hover. The `.title-underline` CSS expects `.group:hover` parent — verify the `<li className="work-row group">` wraps everything and no other CSS draws an underline. Image 9 shows the broken state.

5. **Certifications layout drift.** Legacy `sections.jsx:822+` puts the heading "Credentials & training." in a left rail (md:col-span-4) with cert rows in the remaining 8 cols. Also the date format is `Month YYYY → Month YYYY` (no "ISSUED"/"EXPIRES" words). Current `Certifications.tsx` renders heading on top and shows the verbose form. Rebuild to legacy layout.

6. **Stack micro-tweaks.** Compare row spacing, intro-paragraph max-width, and group-title leading. Legacy `sections.jsx:963-1010`.

7. **Contact heading italic.** `Contact.tsx:47` has `<em className="text-inkdim font-light not-italic">{sec('heading2')}</em>` — drop `not-italic` so "something" renders in italic per legacy `sections.jsx:1180`. Also tighten the inter-word spacing.

8. **Back-to-top shows "OPEN" cursor label.** `Contact.tsx:147` has `data-cursor-label="open"`. Change to `"top"` (or remove the attribute).

9. **MetaCell content recommendation.** User asked for stronger suggestions vs current Based-in / Years / Currently / Focus. Recommended: keep Years coding 6+; swap Currently → "Open to" (Senior full-stack & consulting); swap Focus → "Reply within" (24h). Confirm with user before changing.

10. **Theme-swap animation order.** Legacy `components.jsx:476-510` probes the NEXT theme's `--bg` via a synchronous data-theme swap, then animates clip-path FROM 0 → maxR (mask grows, hiding the swap), then fades the overlay. Current `ThemeToggle.tsx:46-68` does the opposite (starts at maxR, shrinks to 0). Rewrite to match.

11. **Arabic font joining broken.** Body uses Inter / Instrument Serif — neither has Arabic ligature support, so AR letters render disconnected. Add `next/font/google` Noto Naskh Arabic (or Cairo) as a CSS variable `--font-arabic-serif` and apply via `html[lang="ar"]` selector to body + serif headings. User has delegated full AR design discretion.

12. **404 page redesign.** Current `app/[locale]/not-found.tsx` is plain "404 / Not found". Match site chrome: serif 404 numeral, mono subline, ghost button to home, grain + vignette layers, Paula watermark optional.

13. **Next.js preload warnings.** Console shows `The resource <font-url> was preloaded using link preload but not used within a few seconds`. Likely from `next/font/google` loading variants we don't render. Audit `app/fonts.ts` (or equivalent) and remove unused weights/styles; ensure `display: 'swap'` is set.

14. **Quality gates re-run.** After all 13 fixes: `pnpm lint && pnpm type-check && pnpm test -- --run && pnpm test:e2e --project=chromium`.

---

## Status at a glance

**Done in this session (committed as `b12225f`):**

The Next.js 16 portfolio now has the **v2 parity sweep** on top of the original parity work:

- **SectionHead** — gap-6 outer + gap-4 inner, md:mb-16, rule -2px, num tracking 0.2em
- **Magnetic** — Framer Motion spring physics (stiffness 200, damping 18, mass 0.4) via static motion-tag map (`as` narrowed to `'button' | 'a' | 'span' | 'div'`)
- **CustomCursor** — `data-cursor-label` rendered as `<span class="cursor-label">` child (was `textContent`)
- **TopNav** — mobile active uses `text-amber`; hamburger spans `-translate-y-1 / translate-y-1`
- **LiveClock** — wrapped in `font-mono text-[11px] tracking-[0.18em] text-inkdim tabular-nums`
- **AvailabilityPill** — dot upsized to `h-2 w-2`
- **CaseStudyDrawer** — contribution amber rule delay `0.70 + mt-2`, sticky header `tracking-[0.2em]`
- **AnimatedMetric** — default duration `1600ms`
- **Certifications** — logo `opacity-90`
- **Stack** — chips `text-[12px] px-2.5 py-1.5`
- **Contact** — bottom-strip pulse dot `h-1.5 w-1.5`, Paula watermark `text-center`
- **Field** — conditional `border-amber` on error
- **NEW: MetaCell + HeroMetaStrip** — restored info strip between Hero and Work with `home.metaStrip.*` translations in en + ar

**Gated tasks still open:**
- v1 parity Task 18 (delete `legacy/`) — gated on user sign-off after all visual issues resolved.

---

## Plans

- `docs/superpowers/plans/2026-05-27-nextjs-conversion.md` — original port (35 tasks, complete except Task 35 gated).
- `docs/superpowers/plans/2026-05-27-legacy-parity.md` — v1 parity sweep (18 tasks; 17 done, Task 18 gated).
- `docs/superpowers/plans/2026-05-27-legacy-parity-v2.md` — v2 sweep (9 tasks, all complete).
- `docs/superpowers/plans/2026-05-27-legacy-parity-v3.md` — **active plan** for next session (14 tasks from the 2026-05-27 screenshot review).

Spec: `docs/superpowers/specs/2026-05-27-legacy-parity-design.md`.

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

1. **This file (STATE.md).** Active task + 14 queued items.
2. `docs/superpowers/plans/2026-05-27-legacy-parity-v2.md` — v2 plan (extend with new tasks).
3. `docs/superpowers/specs/2026-05-27-legacy-parity-design.md` — parity design doc.
4. `.claude/CLAUDE.md` and `AGENTS.md` — project conventions.
5. `legacy/Portfolio.html` + `legacy/src/*.jsx` — design source-of-truth.

---

## Branch / merge state

Branch `feature/nextjs-conversion` is **NOT yet ready for merge** — the 14 queued visual issues must land first, then `legacy/` deletion (v1 Task 18), then merge.

```bash
git remote add origin <your-repo-url>
git push -u origin feature/nextjs-conversion
```
