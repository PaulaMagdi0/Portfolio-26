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

- [x] `pnpm lint && pnpm type-check && pnpm test -- --run`
- [x] `pnpm dev` and walk `/en` + `/ar` at 1440/1024/768/375
- [x] Compare side-by-side with `legacy/Portfolio.html`
- [x] Commit (`b12225f feat(parity): legacy-parity v2 sweep + MetaCell strip`)

---

# Part B — Visual sweep from 2026-05-27 screenshot review

After completing Tasks 1–9 above, the user reviewed the running site against legacy and flagged 14 remaining issues. Below is the actionable plan for each.

## Task 10: Cursor centering bug

**Files:** `features/ui-components/components/CustomCursor.tsx`

**Drift:** Line 22-23 sets `transform: translate(rx,ry)` which clobbers the CSS `.cursor-ring { transform: translate(-50%,-50%) }` centering rule — the dot/ring is offset by half its size.

**Fix:** Combine both transforms:
```ts
ringRef.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
dotRef.current.style.transform  = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
```

Verify: cursor ring/dot stays centered on the pointer at idle, hover, and labeled states.

- [ ] Commit: `fix(cursor): keep -50% centering when applying translate`

---

## Task 11: ThemeToggle sun/moon icons

**Files:** `features/ui-components/components/ThemeToggle.tsx`

**Drift:** Empty `<span className="knob" />`. Legacy renders `<Icon.Sun|Moon className="ico" />` inside the knob. `.ico` CSS (`globals.css:380-384`) sets color/size — no CSS change needed.

**Fix:** Render an inline SVG inside `.knob`:
```tsx
<span className="knob">
  {isLight ? (
    <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="5" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ) : (
    <svg className="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )}
</span>
```

- [ ] Commit: `feat(theme): sun/moon glyph inside toggle knob`

---

## Task 12: Hero eyebrow row + headline width

**Files:** `features/home/components/Hero.tsx`

**Drift:**
- The amber rule and "PORTFOLIO / 2026" sit too far apart due to `gap-4` and the Reveal wrapper occupying full width.
- At lg+, "Software Engineer" wraps to two lines because the `max-w-[1100px]` collides with the 3D scene zone.

**Fix:** Tighten eyebrow `gap-x-4` and constrain the headline container differently so lg gives it a single line. Match legacy `sections.jsx:79-100` & `sections.jsx:106`:
```tsx
<Reveal as="div" className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-3">
  ...
</Reveal>

<div className="relative z-10 mt-8 md:mt-12 max-w-[58%] lg:max-w-[58%]">
  <SplitReveal ...>
```

Test at 1440/1280/1024 viewport widths — headline should not wrap until below lg.

- [ ] Commit: `fix(hero): tighten eyebrow gap, allow headline to lay out on one line at lg`

---

## Task 13: Project title underline-on-hover only

**Files:** `features/home/components/WorkRow.tsx`

**Drift:** Title appears underlined without hover (Image 9). The CSS class `.title-underline` uses `.group:hover` so the parent must have `group` class and no other CSS draws a fixed underline.

**Investigation steps:**
1. Verify `<li className="work-row group">` is the parent — yes (line 110).
2. Check if any Tailwind utility on the `<h3>` is forcing `underline` or `text-decoration`. Line 137 has `title-underline inline font-serif text-[28px] leading-tight md:text-[36px]` — no Tailwind underline class.
3. Possible cause: parallax `transform: translate3d()` on swatch layers creates a stacking context where the title gradient bg renders differently. OR the `.title-underline` background-size starts at 100% instead of 0%.

**Fix:** Inspect `.title-underline` in `globals.css:188-197`. If `background-size: 100% 1px` somewhere else overrides, restore `background-size: 0% 1px` baseline. Then ensure no inline style adds an underline.

Run in browser devtools: select the title, check Computed → `background-size`. It should be `0% 1px` at rest.

- [ ] Commit: `fix(work-row): title underline grows only on group hover`

---

## Task 14: Certifications layout rework

**Files:** `features/home/components/Certifications.tsx`, `features/home/translations/{en,ar}/pages.json`

**Drift (Image 12 vs 13):** Heading should be in a left rail (col-span-4) with cert rows in 8 cols. Date format should be `May 2026 → May 2029` not `ISSUED MAY 2026 → EXPIRES MAY 2029`.

**Fix:** Rebuild the JSX layout:
```tsx
<section ...>
  <SectionHead num="04" label={sec('label')} />
  <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
    <div className="md:col-span-4">
      <Reveal>
        <SplitReveal as="h2" className="...">
          {sec('heading1')} <em>{sec('heading2')}</em>
        </SplitReveal>
      </Reveal>
    </div>
    <ul className="md:col-span-8">
      {CERTIFICATIONS.map((c, i) => ( /* row */ ))}
    </ul>
  </div>
</section>
```

For the date format inside each row, drop the verbose labels: render `{c.issued} → {c.expires}` only. Remove `sec('issued')` / `sec('expires')` from the JSX (keep the keys for fallback or delete).

- [ ] Commit: `refactor(certs): left-rail heading + concise date format`

---

## Task 15: Stack section micro-tweaks

**Files:** `features/home/components/Stack.tsx`

**Drift:** Compare row spacing + intro paragraph to legacy `sections.jsx:963-1010`. Items to verify:
- Intro paragraph `text-[28px] md:text-[40px] max-w-[820px] mb-14` — current is close
- Each group row `py-8` / `py-10` vs legacy `py-6 md:py-8`
- Group title leading + amber index alignment

Side-by-side at 1440 — diff and patch any class drift.

- [ ] Commit: `polish(stack): row spacing + intro paragraph parity`

---

## Task 16: Contact "something" italic

**Files:** `features/home/components/Contact.tsx`

**Drift:** Line 47 `<em className="text-inkdim font-light not-italic">{sec('heading2')}</em>` — the `not-italic` kills the legacy italic styling. Also visually the gap between "Let's build" and "something" looks too wide.

**Fix:**
```tsx
{sec('heading1')}{' '}
<em className="text-inkdim font-light italic">{sec('heading2')}</em>
<span className="text-amber">.</span>
```

Verify the space rendering — if it's still too wide, swap `{' '}` for a hard `&nbsp;` or remove the space and rely on em-margin.

- [ ] Commit: `fix(contact): italic 'something', tighten word gap`

---

## Task 17: Back-to-top cursor label fix

**Files:** `features/home/components/Contact.tsx`

**Drift:** Line 147 has `data-cursor-label="open"` on the back-to-top link, which is wrong semantically — clicking goes back to `#top`, not opening an external link.

**Fix:** Change to `data-cursor-label="top"` or remove the attribute entirely.

- [ ] Commit: `fix(contact): back-to-top cursor label`

---

## Task 18: MetaCell content recommendation

**Files:** `features/home/translations/{en,ar}/pages.json` (`home.metaStrip.*`)

**Decision required:** Ask user to confirm new content before changing. Recommended:
- Cell 1: Based in / Cairo, EG (keep)
- Cell 2: Years coding / 6+ (keep)
- Cell 3: Open to / Senior full-stack & consulting (was "Currently / Challenge Group")
- Cell 4: Reply within / 24 hours (was "Focus / Full-stack · AWS · CI/CD")

- [ ] Confirm with user, then update translations + commit: `feat(meta-strip): stronger labels per user feedback`

---

## Task 19: Theme-swap animation direction match

**Files:** `features/ui-components/components/ThemeToggle.tsx`

**Drift:** Current animates clip-path FROM `circle(maxR)` TO `circle(0)` (overlay shrinks away). Legacy does the OPPOSITE — starts at `circle(0)` and grows to `circle(maxR)`, then fades the overlay. The legacy approach hides the swap behind the growing mask.

**Fix:** Rewrite `onClick`:
1. Compute `cx/cy` from button rect.
2. Probe NEXT theme's `--bg` via synchronous data-theme attribute swap + getComputedStyle + restore.
3. Create overlay with `clip-path: circle(0 at cx cy)` and the probed bg color.
4. GSAP animate `clipPath: circle(maxR at cx cy)` over 0.7s `power2.inOut`.
5. `onComplete` → `setTheme(next)`, then `requestAnimationFrame` → GSAP fade overlay opacity 0 over 0.35s `power2.out`.

Match legacy `components.jsx:476-510` line-by-line.

- [ ] Commit: `fix(theme): radial unmask animation order matches legacy`

---

## Task 20: Arabic font joining + RTL polish

**Files:** `app/fonts.ts` (or where Inter/Instrument Serif are loaded), `app/globals.css`, possibly `app/[locale]/layout.tsx`

**Drift (Image 21):** Arabic text renders as disconnected letters because Inter / Instrument Serif lack Arabic glyphs. User has delegated full AR design discretion.

**Fix:**
1. Add `next/font/google` Noto Naskh Arabic (for serif headings) and Cairo or IBM Plex Arabic (for body) as CSS variables `--font-arabic-serif` / `--font-arabic-sans`.
2. In `app/globals.css`, scope by `html[lang="ar"]`:
   ```css
   html[lang="ar"] body { font-family: var(--font-arabic-sans), system-ui, sans-serif; }
   html[lang="ar"] .font-serif,
   html[lang="ar"] h1, html[lang="ar"] h2, html[lang="ar"] h3 { font-family: var(--font-arabic-serif), serif; }
   ```
3. Verify joining on all AR strings — especially `hero.headline` ("مهندسة برمجيات") and the headline in Contact.
4. Re-test font-size scale at the same viewport — Arabic glyphs often render visually larger than Latin at the same px size, so the responsive vw scale may need a `html[lang="ar"]` override.

- [ ] Commit: `feat(i18n): add Arabic font families with proper joining`

---

## Task 21: 404 page redesign

**Files:** `app/[locale]/not-found.tsx`, possibly `app/not-found.tsx`

**Drift (Image 22):** Current is plain "404 / Not found" centered.

**Fix:** Rebuild to match site chrome:
```tsx
export default function NotFound() {
  const t = useTranslations('ui.notFound');
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />
      <p className="text-amber font-mono text-[11px] tracking-[0.2em] uppercase">{t('eyebrow')}</p>
      <h1 className="text-ink mt-6 font-serif text-[28vw] leading-none md:text-[18vw] lg:text-[14vw]">404</h1>
      <p className="text-inkdim mt-6 max-w-[480px] text-center text-[15px]">{t('description')}</p>
      <Link href="/" className="btn-base btn-primary mt-8">{t('cta')} <ArrowRight /></Link>
      <p className="text-ink absolute -bottom-20 left-0 right-0 select-none pointer-events-none text-center font-serif text-[28vw] opacity-[0.04]">Paula</p>
    </main>
  );
}
```

Add `ui.notFound.{eyebrow, description, cta}` translation keys in en + ar.

- [ ] Commit: `feat(404): redesign not-found page to match site chrome`

---

## Task 22: Next.js preload warnings

**Files:** `app/fonts.ts` (or wherever next/font is configured), possibly the root layout

**Drift (Image 23):** Console shows `The resource <font-url> was preloaded using link preload but not used within a few seconds`. This is Next.js preloading font variants that aren't immediately rendered.

**Fix:**
1. Open `app/fonts.ts`. List the configured weights/styles.
2. For each font, set `display: 'swap'` and trim `weight` array to ONLY what we render. (Audit by grepping for `font-` class usage.)
3. If `preload: false` is needed for the Arabic fonts loaded conditionally per Task 20, set that.
4. Re-test in browser — console should be clean.

- [ ] Commit: `perf(fonts): trim variants to remove preload warnings`

---

## Task 23: Quality gates (final)

- [ ] `pnpm lint && pnpm type-check && pnpm test -- --run && pnpm test:e2e --project=chromium`
- [ ] `pnpm dev` and walk both locales at 1440/1024/768/375.
- [ ] Compare side-by-side with `legacy/Portfolio.html` one final time.
- [ ] If all green and user signs off — proceed to v1 Task 18 (`git rm -r legacy/` + commit).
