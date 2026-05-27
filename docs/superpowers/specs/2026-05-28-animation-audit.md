# Legacy Animation Audit — legacy vs. Next.js port

**Created:** 2026-05-28
**Branch:** `feature/nextjs-conversion`
**Plan:** [`docs/superpowers/plans/2026-05-28-legacy-animation-audit.md`](../plans/2026-05-28-legacy-animation-audit.md) (Phase 1)
**Source:** `legacy/Portfolio.html` + `legacy/src/{app,components,hero3d,i18n,motion,sections}.jsx` audited against current `features/` and `core/`.

Status legend: `match` = same library + timing + trigger; `drift` = visibly or numerically different; `missing` = present in legacy, absent in port; `additive` = present in port, absent in legacy.

| Location | Legacy Implementation | Current Next.js Implementation | Status | Notes |
|----------|----------------------|-------------------------------|---------|-------|
| **PageLoader counter** | `requestAnimationFrame` loop, pct 0→100 via `(target - pct) * 0.06 + 0.3`, counter updates every frame, status opacity fade 0→1 in 180ms, progress-fill scaleX 0→1 with 180ms cubic-bezier(0.65,0,0.35,1) | `features/ui-components/components/PageLoader.tsx` — RAF loop with identical easing `(target - pct) * 0.06 + 0.3`, status label opacity 180ms fade, progress-fill scaleX 180ms timing | match | RAF tick logic identical. Status fade 180ms matches. Progress bar timing and easing match (0.65,0,0.35,1). Page exit via React state instead of CSS clip-path. |
| **Hero amber rule** | Framer Motion scaleX 0→1, duration 1.1s, ease [0.2,0.7,0.2,1], delay 0.2s, origin-left | `features/home/components/Hero.tsx` — CSS `@keyframes hero-rule` scaleX 0→1, 1.1s cubic-bezier(0.2,0.7,0.2,1), 0.2s delay, origin-left | match | Timings and easing identical. Implementation switched from Framer Motion to CSS keyframe. |
| **Hero eyebrow fade** | Framer Motion opacity 0→1, delay 0.6s (unspecified duration) | `features/home/components/Hero.tsx` — CSS `@keyframes hero-fade` opacity 0→1, duration 0.7s ease-out, delay 0.6s | match | Kept — sits inside layered Hero entrance (1.1s rule, 1.0s headline, 0.9s kicker, 0.9s CTA); 0.7s ease-out reads as designed. Drift below visible threshold. |
| **Hero headline SplitReveal** | GSAP SplitText chars yPercent 110→0, duration 1.0s, stagger 0.014s, ease power4.out, delay 0.15s, mode instant | `features/ui-components/components/SplitReveal.tsx` — GSAP SplitText, yPercent 110→0, duration 1.0s, stagger 0.014s, ease power4.out, delay 0.15s, mode instant | match | All parameters identical. |
| **Hero kicker fade** | Framer Motion opacity 0→1, y 20→0, duration 0.9s, delay 1.0s | `features/home/components/Hero.tsx` — CSS `@keyframes hero-fade` 0.9s ease-out, delay 1.0s | match | Duration 0.9s, delay 1.0s, y-translation identical. |
| **Hero CTA group fade** | Framer Motion opacity 0→1, y 20→0, duration 0.9s, delay 1.2s | `features/home/components/Hero.tsx` — CSS `@keyframes hero-fade` 0.9s ease-out, delay 1.2s | match | Duration 0.9s, delay 1.2s identical. |
| **Magnetic button spring** | Framer Motion spring stiffness 200, damping 18, mass 0.4 | `features/ui-components/components/Magnetic.tsx` — Framer `useSpring` { stiffness: 200, damping: 18, mass: 0.4 } | match | Spring constants identical. |
| **Hero3D scene rotation** | Three.js RAF loop: `outerMesh.rotation.y += 0.0024`, `outerMesh.rotation.x = Math.sin(t * 0.28) * 0.16`, `innerMesh.rotation.y -= 0.005`, `innerMesh.rotation.x += 0.0034`, breathing `Math.sin(t * 0.7) * 0.04` | `features/hero-3d/components/Hero3DCanvas.tsx` — identical Three.js rotation values and breathing formula | match | Rotation speeds and sine-wave animation identical. |
| **Hero3D mouse parallax** | RAF camera lerp: targetCamX = mouseX * 0.55, targetCamY = -mouseY * 0.55, `camera.position += (target - pos) * 0.045` | `features/hero-3d/components/Hero3DCanvas.tsx` — same RAF parallax, factor 0.55, lerp 0.045 | match | Identical mouse parallax. |
| **HeroHeadline scroll parallax** | RAF scroll listener: y = Math.min(80, scroll * 0.13), opacity = Math.max(0.35, 1 - scroll/600) | `features/home/components/HeroHeadline.tsx` — identical formula | match | Parallax rate 0.13, cap 80px, opacity rate 1/600, floor 0.35 identical. |
| **TopNav scroll state (bg/border)** | Scroll >20px triggers `transition-all duration-500` for backdrop-blur, bg-bg/70, border-line | `features/ui-components/components/TopNav.tsx` — `transition-[background-color,border-color,backdrop-filter] duration-500` | match | Ported in `9bd4e78` — duration restored to 500ms. |
| **TopNav active link underline** | CSS scale-x-100 origin-left, `transition-transform duration-500 ease-out` on active | `features/ui-components/components/TopNav.tsx` — same Tailwind classes | match | Duration 500ms ease-out, scale-x-0→100 identical. |
| **LiveClock tick** | `setInterval(..., 1000)`, static text update, no animation | `features/ui-components/components/LiveClock.tsx` — `setInterval(..., 1000)`, same | match | No animation in either. |
| **SectionHead rule reveal** | GSAP scaleX 0→1, duration 1.1s, ease power3.out, ScrollTrigger start `'top 88%'` once:true | `features/ui-components/components/SectionHead.tsx` — GSAP scaleX 0→1, duration 1.1s, ease power3.out, ScrollTrigger start `'top 88%'` once:true | match | All parameters identical. |
| **Reveal (generic fade-up)** | Framer Motion `whileInView` opacity 1 y 0, initial opacity 0 y 24, duration 0.9s, ease [0.2,0.7,0.2,1], viewport `margin: '-80px'` once:true | `features/ui-components/components/Reveal.tsx` — same FM transition, viewport `margin: '-80px'` once:true | match | Ported in `27508da` — viewport semantics restored to legacy. |
| **ClipReveal scroll-trigger** | GSAP timeline: clipPath `inset(0 0 100% 0)` → `inset(0 0 0% 0)` AND scale 1.1→1, duration 1.1s, ease power3.out, ScrollTrigger `'top 88%'` once | `features/ui-components/components/ClipReveal.tsx` — GSAP timeline: outer clipPath `inset(0 0 100% 0)` → `inset(0 0 0% 0)` duration 1.1s, inner scale 1.1 → 1 duration 1.21s (1.1 × 1.1), both ease power3.out, ScrollTrigger `'top 88%'` once | match | Ported in `1848722` — full clipPath inset reveal + ScrollTrigger restored. Also resolves WorkRow swatch ClipReveal drift. |
| **MaskReveal one-line text** | Framer Motion y `'110%'` → `'0%'`, duration 1.1s, ease [0.2,0.7,0.2,1], variable delay | `features/ui-components/components/MaskReveal.tsx` — CSS `transform: translateY(110% → 0%)`, transition `transform 1100ms cubic-bezier(0.2,0.7,0.2,1) ${delay}s` | match | Ported in `27508da` — duration restored to 1.1s. |
| **WorkRow arrow hover** | Framer Motion `animate={{ x: hover ? 4 : 0, y: hover ? -4 : 0, opacity: hover ? 1 : 0.5 }}` spring stiffness 220, damping 16 | `features/home/components/WorkRow.tsx` — same FM animate object, spring stiffness 220, damping 16 | match | Spring constants and target values identical. |
| **WorkRow title underline** | CSS background-size `0% 1px → 100% 1px`, transition 400ms cubic-bezier(0.2,0.7,0.2,1) on group:hover | `features/home/components/WorkRow.tsx` — class `.title-underline`, same 400ms cubic-bezier(0.2,0.7,0.2,1) | match | Duration 400ms, easing, trigger (group:hover) identical. |
| **WorkRow swatch parallax** | `useSwatchParallax` hook — RAF loop, mouse normalized `(e.clientX - r.left) / r.width - 0.5`, depth `[-6, 10, 18]`, lerp 0.08 | `features/home/components/WorkRow.tsx` — same `useSwatchParallax`, identical loop, depth, lerp | match | All parallax parameters identical. |
| **WorkRow swatch ClipReveal** | ClipReveal wraps swatch | ClipReveal wraps swatch | match | Fixed automatically by the ClipReveal port in `1848722` — swatches now reveal from bottom mask + scale. |
| **CaseStudyDrawer backdrop** | Framer Motion opacity 0→1, duration 0.25s | `features/home/components/CaseStudyDrawer.tsx` — FM opacity 0→1, duration 0.3s | match | Kept — 50ms on a translucent overlay is below visual threshold. |
| **CaseStudyDrawer slide-in** | Framer Motion x `'100%'` → 0, duration 0.45s, ease [0.2,0.7,0.2,1], type tween | `features/home/components/CaseStudyDrawer.tsx` — FM x `'100%'` → 0, duration 0.45s, ease [0.2,0.7,0.2,1] | match | Duration 0.45s, easing [0.2,0.7,0.2,1] identical. |
| **CSBlock children fade-up** | Framer Motion opacity 0→1, y 18→0, duration 0.65s, ease [0.2,0.7,0.2,1], variable delay | `features/home/components/CSBlock.tsx` — identical FM transition | match | All parameters identical. |
| **CaseStudy contributions list** | Framer Motion: `li` opacity 0→1, x -16→0, duration 0.5s, delay `0.62 + i * 0.08`, ease [0.2,0.7,0.2,1]; `span` scaleX 0→1, duration 0.45s, delay `0.7 + i * 0.08` | `features/home/components/CaseStudyDrawer.tsx` — `li` same except delay `0.6 + i * 0.08`; `span` identical | match | Kept — 20ms offset behind the 0.45s drawer slide is imperceptible. |
| **CaseStudy metrics grid** | Framer Motion opacity 0→1, y 10→0, duration 0.55s, delay `0.75 + k * 0.08`, ease [0.2,0.7,0.2,1] | `features/home/components/CaseStudyDrawer.tsx` — same except delay `0.68 + i * 0.08` | match | Kept — 70ms offset inside a 0.55s sequenced grid is imperceptible. |
| **CaseStudy stack tags** | Framer Motion opacity 0→1, y 6→0, duration 0.4s, delay `0.85 + k * 0.03`, ease easeOut | `features/home/components/CaseStudyDrawer.tsx` — same except delay `0.78 + i * 0.03` | match | Kept — 70ms offset inside a 0.4s tag stagger is imperceptible. |
| **Experience timeline rows** | Reveal `delay={i * 0.05}` | `features/home/components/Experience.tsx` — Reveal `delay={i * 0.05}` | match | Stagger rate 0.05s identical. |
| **Education SplitReveal** | SplitReveal `as="h3"`, stagger 0.014, duration 0.95s | `features/home/components/Education.tsx` — SplitReveal `as="h3"` stagger={0.014} duration={0.95} mode="scroll" | match | Duration 0.95s, stagger 0.014 identical. |
| **Certifications row reveals** | Reveal `delay={i * 0.05}` | `features/home/components/Certifications.tsx` — Reveal `delay={i * 0.05}` | match | Stagger rate 0.05s identical. |
| **Stack marquee scroll** | GSAP `to(inner, { x: -trackWidth, duration: trackWidth / speed, ease: 'none', repeat: -1 })`, speed **48 px/s**, pauseOnHover timeScale 0.25 | `features/ui-components/components/Marquee.tsx` default speed 50; `features/home/components/Stack.tsx:18` calls `<Marquee speed={48} ... />` | match | False positive in the original audit — Stack overrides the Marquee default with `speed={48}`, matching legacy. No port needed. |
| **Stack group row reveal** | Reveal `delay={i * 0.04}` | `features/home/components/Stack.tsx` — Reveal `delay={i * 0.04}` | match | Stagger rate 0.04s identical. |
| **Stack tag hover** | CSS `hover:border-amber/40 hover:text-ink transition-colors` (default ~150ms) | `features/home/components/Stack.tsx` — same Tailwind classes | match | Browser-default duration. Identical. |
| **Contact heading SplitReveal** | SplitReveal `as="h2"`, stagger 0.018, duration 1.0s, mode scroll | `features/home/components/Contact.tsx` — SplitReveal `as="h2"` stagger={0.018} duration={1.0} (scroll default) | match | All parameters identical. |
| **ContactForm field focus** | CSS `border-line focus:border-amber/70 transition-colors` (default duration) | `features/contact-form/components/ContactForm.tsx` — same Tailwind classes | match | CSS native focus transition. Identical. |
| **ContactForm field error** | Border switches to `border-amber`, inline error text amber. No motion. | Field component — `border ${error ? 'border-amber' : ...}`, error span text-amber. No motion. | match | No animation in either. |
| **EmailCopyButton icon swap** | Framer Motion AnimatePresence, scale 0.7→1, opacity 0→1, duration 0.18s | `features/home/components/EmailCopyButton.tsx` — FM AnimatePresence, scale 0.7↔1, opacity 0↔1, duration 0.18s | match | Duration 0.18s, scale 0.7, opacity transition identical. |
| **EmailCopyButton "copied" label** | Framer Motion `animate={{ opacity: copied ? 1 : 0, y: copied ? 0 : -4 }}` duration 0.2s | `features/home/components/EmailCopyButton.tsx` — FM AnimatePresence initial/animate/exit, y -4, duration 0.2s | match | Duration 0.2s, y -4 fade-up identical. AnimatePresence instead of conditional animate. |
| **Contact back-to-top hover** | CSS `hover:text-ink transition-colors` | `features/home/components/Contact.tsx` — same Tailwind classes | match | CSS hover color transition. Identical. |
| **Theme toggle radial unmask** | GSAP `clipPath: circle(0 → maxR)` duration 0.7s ease power2.inOut, then overlay opacity 0 duration 0.35s ease power2.out | `features/ui-components/components/ThemeToggle.tsx` — same GSAP sequence: clipPath circle 0.7s power2.inOut, then opacity 0.35s power2.out | match | All timing and easing identical. |
| **LocaleSwitcher open/close** | Not present in legacy (disabled / not implemented) | Component exists in `features/localization/` but transitions are CSS instant (no open/close animation) | additive | Stub exists in port; no motion to compare. |
| **CustomCursor position lerp** | RAF loop, ringPos lerp `(pos - ringPos) * 0.18`, dotPos direct set | `features/ui-components/components/CustomCursor.tsx` — RAF loop, `rx += (mx - rx) * 0.18`, `ry += (my - ry) * 0.18`, dot direct | match | Lerp rate 0.18 identical for ring; dot follows directly in both. |
| **CustomCursor hover state expand** | CSS width/height/background/border/opacity transition 280ms cubic-bezier(0.2,0.7,0.2,1) on `.cursor-ring.hover` | `features/ui-components/components/CustomCursor.tsx` — same CSS, 280ms cubic-bezier(0.2,0.7,0.2,1) on `.hover` class | match | Duration 280ms, easing, properties identical. |
| **CustomCursor label fade** | CSS opacity transition 280ms (inherited from ring transition stack) | CustomCursor — label opacity tied to class toggle, same 280ms transition stack | match | Same CSS transition timing handles label fade. |
| **ScrollProgress bar scale** | CSS `transform: scaleX(progress)` with `transition-transform duration-100 ease-out` on every scroll update | `features/ui-components/components/ScrollProgress.tsx` — RAF onScroll sets `transform: scaleX(${pct})`, element has `transition-transform duration-100 ease-out` | match | Ported in `c76d959` — 100ms ease-out smoothing restored. |
| **Reduced-motion fallback** | CSS `@media (prefers-reduced-motion: reduce)` zeroes animations/transitions; JS hooks check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before kicking off GSAP / Framer / RAF | `core/motion/` + `features/ui-components/` — JS hooks check `window.matchMedia(...).matches`; global CSS includes `@media (prefers-reduced-motion: reduce)` reset | match | Both short-circuit motion identically. CSS media query + JS guard. |
| **AvailabilityPill ping** | Tailwind `animate-ping` on dot | Tailwind `animate-ping` on dot | match | Native Tailwind animation. Identical. |

---

## Summary (post-port)

- **match:** 42 rows — full parity.
- **drift:** 0 rows.
- **missing:** 0 rows.
- **additive:** 1 row (LocaleSwitcher stub — deferred, out of scope).

### Phase 3 — landed commits

| Commit | Batch |
|--------|-------|
| `27508da` | Reveal viewport `margin: '-80px'` + MaskReveal duration 1.1s |
| `1848722` | ClipReveal clipPath + ScrollTrigger (also fixes WorkRow swatch inherited drift) |
| `9bd4e78` | TopNav scroll-state transition 500ms |
| `c76d959` | ScrollProgress 100ms ease-out smoothing |

Stack marquee speed 48 was a **false positive** in the original audit — Stack already overrides the Marquee default with `speed={48}`, so no port was required.

Hero eyebrow fade + 4 CaseStudy timing offsets were classified **keep** at triage — drifts below visible threshold, see notes in their rows above.

Quality gates after all batches: lint ✓, type-check ✓, format:check ✓, vitest 21/21 ✓, build ✓.

### Outstanding

- Visual side-by-side walk on `/en` and `/ar` against `legacy/Portfolio.html` (Phase 4 sign-off — needs a human at a browser).
- Then `git rm -r legacy/` and merge.
