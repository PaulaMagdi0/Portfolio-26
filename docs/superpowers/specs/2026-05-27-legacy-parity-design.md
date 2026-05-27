# Legacy Parity Design

**Date:** 2026-05-27
**Branch:** `feature/nextjs-conversion`
**Status:** Awaiting user approval before implementation plan

## Goal

Close every visible and behavioral gap between `legacy/Portfolio.html` + `legacy/src/*.jsx` and the current Next.js port at `/Users/apple/Desktop/Portfolio`. Strict feature-for-feature parity: sections, components, decorative elements, animations, micro-interactions, cursors, badges, dividers, copy, a11y. Net-new additions in the port that are not in legacy are removed unless explicitly preserved.

Once verified, `legacy/` is deleted.

## Non-goals

- No new visual design beyond what legacy already shows.
- No backend, no auth, no analytics.
- Arabic translation polish is out of scope — current AI-drafted AR strings stay.
- Lighthouse SEO score lift (requires prod env var) is out of scope.

## What stays / what changes

### Already in parity (do not touch)

- Global token system (`@theme` + theme variables), focus ring, selection color, skip link, grain overlay, vignette, smooth scroll setup, scrollbar utilities.
- `MotionProvider` + `useLenis` + `useScrollVelocitySkew` + `useReducedMotion`.
- Lenis ↔ GSAP ticker integration, ScrollTrigger registration, SplitText registration.
- `MaskReveal`, `ClipReveal`, `Reveal`, `Magnetic`, `Marquee`, `SectionHead`, `AnimatedMetric`, `CSBlock` components.
- `Hero3D` / `Hero3DCanvas` (Three.js setup, theme-aware materials, IntersectionObserver pause).
- `CustomCursor` (ring + dot + lerp + hover/labeled states + coarse-pointer guard).
- `ScrollProgress`, `PageLoader` (drive loop, stage cycling, font-ready gating, exit clip-path).
- `Experience` section, `Education` section.
- `Reveal` usage everywhere, prefers-reduced-motion guards.
- `i18n/routing.ts` + next-intl + RTL handling (current is ahead of legacy here).
- `ThemeProvider` (custom replacement for next-themes), `ThemeInitScript` (FOUC prevention).
- `ContactForm` validation logic (Zod schema, react-hook-form, mailto build). The form *styling* changes but the underlying logic stays.

### Major rebuilds

#### 1. Contact section (`features/home/components/Contact.tsx`)

Rebuild to match legacy structure:

1. **SectionHead** `06 — Contact` (unchanged).
2. **Headline** — single huge serif headline `Let's build something.` with the period in amber. Responsive font-serif `text-[14vw] sm:[12vw] md:[9.5vw] lg:[120px] xl:[140px] 2xl:[160px]`, `leading-[0.95]`, `tracking-[-0.02em]`. Wrapped in `<SplitReveal as="h2" stagger={0.018} duration={1.0}>`.
3. **12-col grid** below the headline:
   - **Pitch column** `md:col-span-4`: mono 11px 0.18em uppercase eyebrow `Send a message`, serif 22-26px heading `Tell me what you're building.`, paragraph (14px inkdim, max 300px) with the pitch copy.
   - **Form column** `md:col-span-8`: rebuild form with **underline-only** inputs (`border-b border-line focus:border-amber/70`), font-serif 20-24px ink, placeholder font-serif inkmute, `bg-transparent`. Three fields: name, email, message (textarea 4 rows, non-resizable). Each `Field` shows mono 10px uppercase label with inline amber error to the right. Submit is `<Magnetic as="button">` `btn-base btn-primary` with `ArrowUpRight` icon and `data-cursor-label="send"`. Helper text `Opens in your mail client` to the right of the button (mono 12px inkmute).
4. **Direct-contact strip** — `border-t border-line pt-10 md:pt-12 grid-cols-12 gap-8 md:gap-6 mb-12`:
   - **Email cell** `md:col-span-5`: mono 10px 0.18em label `Email`, then a `<button onClick={copy}>` showing the email in font-serif 20-24px with a `Copy`↔`Check` icon that cross-fades on success. Below: amber confirmation `copied to clipboard` that slides+fades in for 2s after copy. Use `navigator.clipboard.writeText` with a `document.execCommand` fallback. `data-cursor-label="copy"`.
   - **Phone cell** `md:col-span-3`: label `Phone` and value `+20 127 776 7028` in font-serif 20-24px.
   - **Socials cell** `md:col-span-4`: label `Elsewhere` and a 2-col grid of GitHub / LinkedIn / LeetCode / HackerRank links. Each link: brand icon (`lucide-react`), mono 12px name, framer-motion `whileHover={{ x: 2, y: -2 }}` `ArrowUpRight`. Hover to amber, `data-cursor-label="open"`.
5. **Bottom strip** — `border-t border-line pt-8`:
   - Left: mono 11px inkmute `Designed and built by Paula Magdy · Cairo, 2026`.
   - Right: emerald pulse dot + `<LiveClock />` + `Back to top` anchor → `#top` with chevron-up SVG, hover to ink.
6. **Watermark** — absolute `-bottom-20`, font-serif `text-[28vw]`, opacity 0.04, content `Paula`, `pointer-events-none select-none tracking-tighter`.

Form schema, mailto builder, and translation infrastructure are reused as-is.

#### 2. Stack section (`features/home/components/Stack.tsx`)

Reorder + restyle:

1. **SectionHead** `05 — Stack` (unchanged).
2. **Full-bleed marquee FIRST** — wrap with `-mx-6 md:-mx-10 mb-14 md:mb-20 border-y border-line py-6 md:py-8`. Use existing `<Marquee>` with `speed={48} pauseOnHover draggable`. Verify `MARQUEE_TOOLS` config matches the legacy 26-logo list (React, Next.js, TypeScript, JavaScript, Tailwind CSS, Vitest, Playwright, Node.js, NestJS, Express, Django, Flask, Laravel, Jest, Redis, PostgreSQL, MySQL, MongoDB, Prisma, AWS, Azure, Docker, Kubernetes, Python, PHP, C++). Add any missing.
3. **Intro paragraph** — SplitReveal `<p>` font-serif 28-40px max-width 820px: `Tools I reach for daily, grouped by where they live in the stack —` + italic inkdim ` chosen for shipping, not for the résumé.` Stagger 0.008, duration 0.9.
4. **5 group rows** — each row is `grid-cols-12 gap-6 py-6 border-t border-line` wrapped in `<Reveal delay={i*0.04}>`:
   - Left rail `md:col-span-3`: index `01–05` (mono 10px amber) + group title (font-serif 24-28px).
   - Right `md:col-span-9`: flex-wrap of mono 12px tag chips (`px-2.5 py-1.5 border border-line rounded-md bg-bg2/40 hover:border-amber/40 hover:text-ink transition-colors`).

#### 3. Certifications section (`features/home/components/Certifications.tsx`)

Replace card grid with vertical list:

1. **SectionHead** `04 — Certifications` (unchanged).
2. **Heading rail** — `<SplitReveal as="h2">` `Credentials` + italic inkdim `& training.` (font-serif 34-44px, stagger 0.018, duration 0.95).
3. **List** — for each cert, `grid-cols-12 gap-6 py-8 md:py-10 border-t border-line first:border-t-0`:
   - **Left rail** `md:col-span-3`: `<Magnetic strength={0.35}>` wrapping the logo `<img class="marquee-logo">` (h-8 normalized, lazy, draggable=false). Below: amber issued→expires range in mono 11px 0.1em tracking.
   - **Right** `md:col-span-9`: name (font-serif 24-28px), issuer + optional `division` (mono 13px), description (14px inkdim, max 600px), Credential ID row (mono 11px inkmute label + ink ID, `break-all`), skill chip row (mono 11px inkdim chips with `bg-bg2/40 border-line`).

### Hero rework (`features/home/components/Hero.tsx`)

1. **Section** — `id="top"` (legacy uses `#top` not `#hero`), `min-h-screen flex flex-col pt-28 md:pt-32 pb-12 md:pb-16 px-6 md:px-10 overflow-hidden`.
2. **3D scene** — absolutely positioned, lg-only (hidden below lg), anchored right with `right-[-40px] xl:right-[-60px] 2xl:right-[-80px]`, vertically centered, size cascade 420 → 520 → 640. Replace current col-7/col-5 grid with this overlay positioning.
3. **Eyebrow row** — animated amber rule (`h-px w-12 bg-amber`, framer-motion scaleX `0 → 1`, duration 1.1, delay 0.2, ease `[0.2,0.7,0.2,1]`) + label `Portfolio / 2026` (mono 11px 0.2em uppercase inkmute, fade-in delay 0.6) + `<AvailabilityPill>` on the right (delay 1.0, duration 0.7 opacity+x slide). Mount AvailabilityPill here.
4. **Headline** — `<SplitReveal mode="instant" delay={0.15} stagger={0.014} duration={1.0}>` over `<h1>` with `text-[14vw] sm:[12vw] md:[9.5vw] lg:[120px] xl:[140px] 2xl:[160px] leading-[0.95] tracking-[-0.02em]`. Content `Software Engineer` + amber `.`. Restore char-stagger animation with 1.5s safety timeout that forces `yPercent: 0`.
5. **Hero parallax** — `HeroHeadline` already handles `scrollY * 0.13` clamp 80 + opacity. Keep.
6. **Sub-kicker** — mono 11px 0.18em amber uppercase `Building systems that teams rely on.` followed by lead+emph paragraph (inkdim default, ink emphasis, `text-[15px] md:text-[17px]`, leading 1.55, max-width 560px). Framer Motion delay 1.0, duration 0.9.
7. **CTAs** — `btn-base btn-primary` `View Work` → `#work` with `ArrowDown` icon, `btn-base btn-ghost` `Resume` → `/Resume.pdf` with `Download` icon and `data-cursor-label="open"`. Both wrapped in `<Magnetic strength={0.25}>`. Framer Motion delay 1.2, duration 0.9.
8. **Remove** `MetaCell` row entirely.

### TopNav polish (`features/ui-components/components/TopNav.tsx`)

1. **Active-section logic** — scroll handler walks `['work','experience','certifications','stack','contact']` and picks the first whose `getBoundingClientRect()` straddles `innerHeight * 0.42`. Set `scrolled = scrollY > 20` (legacy uses 20, current uses 8).
2. **Desktop link list** — each link renders a mono 10px number prefix (`01–05`, amber when active else inkmute) + label (inkdim → ink hover, ink when active) + an `<span class="bg-amber origin-left">` underline that scales-x 0→1 over 500ms ease-out when section is active.
3. **Brand mark** — `Paula Magdy` (font-serif 20px) + `— Cairo, EG` (mono 12px, hidden under md).
4. **Mobile drawer** — full-screen overlay `bg-bg/95 backdrop-blur-md` with click-on-backdrop close. Inside: vertical link list with bottom borders, each link `font-serif text-[40px]` with mono 11px number prefix (amber on hover/active). Bottom row shows emerald pulse + `<LiveClock />` + `Cairo, EG`. Hamburger animates to X (two ink bars rotate ±45° and translate to center).
5. **Body scroll lock** while drawer open (keep).
6. **Escape closes drawer** (keep).

### Missing decorative chrome

#### Background spotlight

`features/ui-components/components/BgSpotlight.tsx` (new): rAF-throttled mousemove listener that sets `--mx` and `--my` CSS custom properties on `document.documentElement`. Only active when `matchMedia('(hover: hover) and (pointer: fine)').matches`. Mount in `ClientProviders` before children.

#### Theme-swap radial unmask

Update `core/theme/components/ThemeToggle.tsx` consumer (the toggle in `features/ui-components/components/ThemeToggle.tsx`) to animate the theme change:

1. Compute click center from the toggle's `getBoundingClientRect()`.
2. Compute farthest viewport corner distance from that center.
3. Read the target theme's `--bg` by temporarily swapping `data-theme`, sampling computed style, and restoring — no flicker because there's no paint between sync calls.
4. Apply a `.theme-overlay` fixed element with that bg color and a `clip-path: circle(0 at click-x click-y)`.
5. GSAP `gsap.to({ clipPath: 'circle(maxR at x y)' }, { duration: 0.7, ease: 'power2.inOut' })`.
6. At peak, flip `data-theme`.
7. Fade overlay 0.35s `power2.out` and remove.

Reduced-motion path: skip the animation, flip the theme instantly.

#### Cursor labels

Audit every interactive element and add `data-cursor-label="..."`:
- Hero `Resume` → `"open"`.
- WorkRow live → hostname; case-study → `"case study"`.
- Case study drawer close → `"close"`.
- Email copy button → `"copy"`.
- Contact send → `"send"`.
- Social links → `"open"`.

### Work section polish

- WorkRow: change wrapper from `<button>` to `<article role="button" tabIndex={0}>` with Enter/Space `keyDown` handlers, focus-visible `ring-1 ring-amber/60 rounded-sm`. Keeps semantics aligned with legacy.
- Verify: title underline grows on `.group:hover`. Adjacent amber `ArrowUpRight` icon Framer Motion `animate={{ x: hover ? 4 : 0, y: hover ? -4 : 0, opacity: hover ? 1 : 0.5 }}` with spring stiffness 220 / damping 16.
- Verify: 4:3 swatch with three parallax layers (bg gradient, diagonal SVG stripes at 0.07 opacity, monogram char), `data-skew` scroll-velocity wrapper, `<ClipReveal>` wrapper.
- Verify corner badges: top-left lowercase id (mono 9px), top-right LIVE pill (emerald with pulse dot) or PRIVATE pill (amber outline), bottom-left `kind` lowercase, bottom-right `01/5` index/total.
- Verify tech chip cap at 6 + `+N` overflow.

### CaseStudyDrawer parity

- `fixed inset-x-0 top-16 bottom-0 z-40` (legacy positions below the nav, not full-page). Verify current matches — if not, adjust.
- Sticky header with badge label `Case Study · <BADGE>` (mono 10px amber + inkmute) and close button.
- Verify CSBlock delays match legacy: 0.28 (role), 0.36 (problem), 0.44 (architecture), 0.52 (contributions list head), 0.6 (outcomes), 0.7 (stack).
- Contributions: list items with 12px amber rule prefix that scale-x from 0.
- Stack: chips fade-in stagger.

### SplitReveal safety fallback

Update `features/ui-components/components/SplitReveal.tsx`:
- Already has a 1.8s safety timeout per inventory. Verify the fallback explicitly forces `yPercent: 0` and `opacity: 1` if the observer never fires (e.g., element offscreen at mount).
- Verify `mode="instant"` path plays without scroll trigger and applies the fallback equally.

### Translation updates

Add missing keys in `features/home/translations/{en,ar}/pages.json`:
- `hero.kicker` — "Building systems that teams rely on." (en) + AR equivalent.
- `contact.phone`, `contact.formHelper`, `contact.copied`, `contact.footerBuilt`, `contact.backToTop` if missing.
- `work.caseStudy.role`, `.problem`, `.architecture`, `.contributions`, `.outcomes`, `.stack` — verify present.
- Remove any translation keys that referenced MetaCell (`hero.meta.*`).

## Animation timings reference (must match legacy)

| Animation | Source | Target |
|---|---|---|
| Hero eyebrow amber rule | framer scaleX 0→1 | dur 1.1s, delay 0.2, ease [0.2,0.7,0.2,1] |
| Hero headline SplitReveal | mode instant | delay 0.15, stagger 0.014, dur 1.0 |
| Hero sub-kicker block | framer fade+y | delay 1.0, dur 0.9 |
| Hero CTAs | framer fade+y | delay 1.2, dur 0.9 |
| AvailabilityPill | framer fade+x | delay 1.0, dur 0.7 |
| Work intro SplitReveal | scroll-trigger | stagger 0.008, dur 0.9 |
| Experience heading | SplitReveal | stagger 0.018, dur 0.95 |
| Education heading | SplitReveal | stagger 0.014, dur 0.95 |
| Cert heading | SplitReveal | stagger 0.018, dur 0.95 |
| Stack intro | SplitReveal | stagger 0.008, dur 0.9 |
| Contact heading | SplitReveal | stagger 0.018, dur 1.0 |
| WorkRow ClipReveal | scroll-trigger | dur 1.1s, ease power3.out, inner scale 1.1→1 over dur*1.1 |
| SectionHead rule | GSAP scaleX | dur 1.1, start top 88%, once |
| AnimatedMetric | scroll-trigger | dur 1.6, ease power2.out, start top 92% |
| Title underline (hover) | CSS | 400ms cubic-bezier(.2,.7,.2,1) |
| Theme swap | GSAP clip-path | dur 0.7 power2.inOut + 0.35s fade |
| Page loader exit | CSS | 1.1s cubic-bezier(0.65,0,0.35,1) + 600ms opacity |
| Loader pulse | CSS keyframes | 1.2s ease-in-out infinite |
| Lenis | duration 1.15 | easing t→1-2^-10t |
| Cursor ring lerp factor | rAF | 0.18 |
| Scroll skew lerp | ticker | 0.18 toward target, 0.85 idle decay |
| Hero3D camera lerp | rAF | 0.045 |

## Files affected

```
features/home/components/Hero.tsx              # rewrite — section structure + animations + sub-kicker + AvailabilityPill mount
features/home/components/Contact.tsx           # rewrite — headline + grid + direct strip + bottom strip + watermark
features/home/components/Stack.tsx             # rewrite — marquee first + serif group titles + chip rows
features/home/components/Certifications.tsx    # rewrite — list layout + magnetic logos
features/home/components/WorkRow.tsx           # tweak — <article role="button">, ArrowUpRight hover anim, verify corner badges + parallax
features/home/components/CaseStudyDrawer.tsx   # verify timings + sticky header
features/home/components/MetaCell.tsx          # DELETE
features/home/components/HeroHeadline.tsx     # keep (parallax)

features/ui-components/components/TopNav.tsx          # rewrite — active section detection, number prefixes, mobile drawer styling
features/ui-components/components/BgSpotlight.tsx     # NEW — mouse → CSS vars
features/ui-components/components/ThemeToggle.tsx     # add radial-unmask animation
features/ui-components/components/SplitReveal.tsx     # verify 1.5s safety fallback forces yPercent:0

features/contact-form/components/ContactForm.tsx      # rewrite — underline-only inputs, restyled labels/errors, magnetic submit
features/contact-form/components/Field.tsx            # rewrite — underline-only variant
features/contact-form/components/EmailCopyButton.tsx  # NEW — clipboard + check-icon crossfade

features/home/translations/en/pages.json              # add hero.kicker, remove meta.*, verify contact keys
features/home/translations/ar/pages.json              # mirror

app/globals.css                                       # verify .pl-pulse keyframe, .title-underline, .work-row, .skip-link match
app/[locale]/page.tsx                                 # mount BgSpotlight; change hero anchor from "hero" to "top"
features/home/config/socials.config.ts                # ensure GitHub/LinkedIn/LeetCode/HackerRank present
```

## Verification plan

Per section, after implementation:
1. `pnpm dev` and side-by-side with `cd legacy && python3 -m http.server 8001`.
2. Compare at 4 viewport widths: 1440, 1024, 768, 375.
3. Toggle theme — verify radial unmask plays.
4. Switch locale — verify RTL layout still holds.
5. Tab through — verify focus ring lands and skip-link works.
6. Run `pnpm lint && pnpm type-check && pnpm test -- --run && pnpm test:e2e -- --project=chromium`.
7. After all sections complete: run `pnpm test:e2e -- --project=chromium e2e/verify.spec.ts` and review screenshots in `test-results/verify/`.
8. Only then `git rm -r legacy/` and commit the closing of Task 35.

## Open questions for the user

- Cursor budget cap for this work (prior session hit $67).
- Should `legacy/` be deleted in the same branch as the parity work, or in a follow-up commit after user inspection?

## Out of scope / explicit YAGNI

- No new sections.
- No layout redesign beyond restoring legacy.
- No motion library swaps. Keep GSAP + Framer Motion + Lenis.
- No new dependencies unless required by a specific gap (none identified).
