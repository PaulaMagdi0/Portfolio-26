# Legacy Parity Sweep v3 — Visual Issues from 2026-05-27 Screenshot Review

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) or superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve every visual issue the user flagged in the 2026-05-27 screenshot review of the legacy-parity v2 sweep, then close the parity work by deleting `legacy/`.

**Architecture:** One task per issue, ordered by visual impact. Each task is self-contained — touches a small set of files, ends with one commit. Match `legacy/Portfolio.html` and `legacy/src/*.jsx` line-by-line.

**Tech Stack:** Next.js 16, React 19, TS strict, Tailwind v4, GSAP, Framer Motion, next-intl, next/font.

**Prereqs:** v2 sweep (`docs/superpowers/plans/2026-05-27-legacy-parity-v2.md`) and original parity (`docs/superpowers/plans/2026-05-27-legacy-parity.md`) are merged. Latest commit at v3 start: `7ad5919`.

**Side-by-side dev:**
```bash
pnpm dev                                          # localhost:3000
cd legacy && python3 -m http.server 8001          # localhost:8001/Portfolio.html
```
Compare at 1440 / 1024 / 768 / 375.

---

## Task 1: Cursor centering bug

**Files:** `features/ui-components/components/CustomCursor.tsx`

**Drift (Images 1 vs 2):** The CSS `.cursor-ring` / `.cursor-dot` rules set `transform: translate(-50%, -50%)` to center the element on the pointer. The JS at lines 22-23 then overwrites that with `transform: translate(rx, ry)` — losing the centering, so the ring/dot is offset by half its size.

- [ ] **Step 1:** Combine both transforms in the tick loop:
```ts
if (ringRef.current) {
  ringRef.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
}
if (dotRef.current) {
  dotRef.current.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
}
```

- [ ] **Step 2:** Verify visually at idle, on `:hover` (56px ring), and on `data-cursor-label` (labeled state). Ring and dot must stay centered on the pointer.

- [ ] **Step 3:** Commit `fix(cursor): keep -50% centering when applying translate`

---

## Task 2: ThemeToggle sun/moon icons

**Files:** `features/ui-components/components/ThemeToggle.tsx`

**Drift (Images 3 vs 4):** Legacy renders an `<Icon.Sun />` or `<Icon.Moon />` inside the knob span (legacy `components.jsx:521-525`). Current renders empty `<span className="knob" />`. The `.ico` CSS rule (`app/globals.css:380-384`: `color: var(--color-bg); width: 10px; height: 10px;`) is in place — we just need the SVG.

- [ ] **Step 1:** Replace `<span className="knob" />` with an icon-bearing span. In dark mode, knob shows Moon; in light mode, knob shows Sun (legacy behavior).

```tsx
<span className="knob">
  {isLight ? (
    <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ) : (
    <svg className="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )}
</span>
```

- [ ] **Step 2:** Verify the icon flips when toggling. Verify the SSR fallback branch (line 19) — when not yet mounted, render an empty knob to avoid hydration mismatch.

- [ ] **Step 3:** Commit `feat(theme): sun/moon glyph inside toggle knob`

---

## Task 3: Hero eyebrow row + headline width

**Files:** `features/home/components/Hero.tsx`

**Drift (Images 5/6 + 7/8):**
- Amber rule and "PORTFOLIO / 2026" sit too far apart due to the eyebrow row taking full width.
- "Software Engineer" wraps to two lines at lg+ because the headline container collides with the 3D scene space.

Legacy reference: `legacy/src/sections.jsx:79-100` (eyebrow), `:106` (headline).

- [ ] **Step 1:** In the eyebrow row, use `flex-wrap items-center gap-x-4 gap-y-3` so the AvailabilityPill wraps cleanly on narrow screens but rule + label stay tight on desktop:
```tsx
<Reveal as="div" className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-3">
```

- [ ] **Step 2:** Wrap headline + paragraph + CTAs in a container constrained to `lg:max-w-[58%]` (legacy uses this). The 3D scene already lives outside this container as an absolute element.
```tsx
<div className="relative z-10 flex flex-1 flex-col justify-center lg:max-w-[58%]">
  <div className="mt-8 md:mt-12">
    <HeroHeadline> ... </HeroHeadline>
  </div>
  <div className="mt-10 md:mt-14 max-w-[560px] ..."> /* paragraph */ </div>
  <div className="mt-8 ..."> /* CTAs */ </div>
</div>
```

- [ ] **Step 3:** Test at 1440/1280/1024 — "Software Engineer" must render on ONE line at lg+. If it still wraps at 1280, either drop `lg:text-[120px]` slightly or widen the container to `lg:max-w-[62%]`.

- [ ] **Step 4:** Commit `fix(hero): tighten eyebrow gap, single-line headline at lg+`

---

## Task 4: Project title underline-on-hover only

**Files:** `features/home/components/WorkRow.tsx`, possibly `app/globals.css`

**Drift (Images 9 vs 10):** Image 9 shows the title underlined at rest. The `.title-underline` CSS (`globals.css:188-197`) is supposed to grow `background-size: 0% → 100%` on `.group:hover`. The parent `<li className="work-row group">` (line 110) IS marked `group`, so this should work — needs root-cause investigation.

- [ ] **Step 1:** In browser devtools at idle (no hover), inspect the `<h3 class="title-underline">`. Computed `background-size` should be `0% 1px`. If it shows `100% 1px`, something else is forcing it.

- [ ] **Step 2:** Likely causes:
  - A Tailwind utility on the `<h3>` adding `text-decoration: underline`.
  - The `.title-underline` base rule shadowed by another `.title-underline { background-size: ... }` rule.
  - Devtools' "Force :hover" enabled.

- [ ] **Step 3:** If the rule is being shadowed or specificity needs lifting:
```css
.title-underline { background-size: 0% 1px; }
.group:hover .title-underline { background-size: 100% 1px; }
```

- [ ] **Step 4:** Verify hover: hovering the article grows the underline left-to-right over 400ms cubic-bezier(.2,.7,.2,1).

- [ ] **Step 5:** Commit `fix(work-row): title underline only grows on group hover`

---

## Task 5: Certifications layout rework

**Files:** `features/home/components/Certifications.tsx`

**Drift (Images 12 vs 13):**
- Legacy puts "Credentials & training." in a LEFT RAIL (md:col-span-4); cert rows fill the remaining 8 cols.
- Date format is `May 2026 → May 2029` — no "ISSUED" / "EXPIRES" words.
- Cert logo vertically centered with the date directly below.

Legacy reference: `legacy/src/sections.jsx:822-880`.

- [ ] **Step 1:** Rebuild the section structure:
```tsx
<section id="certifications" className="relative px-6 py-16 md:px-10 md:py-24">
  <div className="mx-auto max-w-[1200px]">
    <SectionHead num="04" label={sec('label')} />
    <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
      <div className="md:col-span-4">
        <Reveal>
          <SplitReveal as="h2" stagger={0.018} duration={0.95}
            className="text-ink font-serif text-[34px] leading-[1.05] md:text-[44px]">
            {sec('heading1')}<br />
            <em className="text-inkdim font-light italic">{sec('heading2')}</em>
          </SplitReveal>
        </Reveal>
      </div>
      <ul className="md:col-span-8">
        {CERTIFICATIONS.map((c, i) => (
          /* row: rail-style logo + dates on left subcell, content on right subcell */
        ))}
      </ul>
    </div>
  </div>
</section>
```

- [ ] **Step 2:** Inside each cert row, replace the verbose date paragraph with just `{c.issued} → {c.expires}`:
```tsx
<p className="text-amber font-mono text-[11px] tracking-[0.1em]">
  {c.issued}{c.expires ? <> → {c.expires}</> : null}
</p>
```
Drop `sec('issued')` / `sec('expires')` translation calls (and remove those keys from `pages.json` in both locales if unused elsewhere).

- [ ] **Step 3:** Center the logo + date stack vertically within its subcell using `flex flex-col items-start justify-center gap-3`.

- [ ] **Step 4:** Visual diff against legacy at 1440 + 1024. Confirm spacing matches.

- [ ] **Step 5:** Commit `refactor(certs): left-rail heading + concise date format`

---

## Task 6: Stack section micro-tweaks

**Files:** `features/home/components/Stack.tsx`

**Drift (Images 14 vs 15):** Layout is close but row spacing, intro paragraph size, and group title leading differ slightly from legacy `sections.jsx:963-1010`.

- [ ] **Step 1:** Side-by-side at 1440. Identify each diff:
  - Intro `<p>`: legacy `text-[28px] md:text-[40px] max-w-[820px] mb-14` — verify current matches.
  - Group row `<li>`: legacy `py-6 md:py-8`; current is `py-8 md:py-10` — change to legacy values.
  - Group title `<h3>`: verify `font-serif text-[24px] md:text-[28px] leading-none`.

- [ ] **Step 2:** Apply the diffs.

- [ ] **Step 3:** Commit `polish(stack): row spacing + group title leading parity`

---

## Task 7: Contact "something" italic + spacing

**Files:** `features/home/components/Contact.tsx`

**Drift (Images 16 vs 17):** Line 47 has `<em className="text-inkdim font-light not-italic">` — `not-italic` strips the italic. Word spacing between "Let's build" and "something" looks too wide.

- [ ] **Step 1:** Remove `not-italic`, add `italic`:
```tsx
{sec('heading1')}{' '}
<em className="text-inkdim font-light italic">{sec('heading2')}</em>
<span className="text-amber">.</span>
```

- [ ] **Step 2:** If word gap still reads too wide visually, replace `{' '}` with `&#8239;` (narrow no-break space) or drop the space and rely on em's margin.

- [ ] **Step 3:** Commit `fix(contact): italic 'something' + tighten word gap`

---

## Task 8: Back-to-top cursor label

**Files:** `features/home/components/Contact.tsx`

**Drift (Images 18 vs 19):** Line 147 has `data-cursor-label="open"` on the back-to-top anchor — clicking goes to `#top`, not an external open.

- [ ] **Step 1:** Change to `data-cursor-label="top"` (keeps cursor labeled state but with correct wording).

- [ ] **Step 2:** Commit `fix(contact): back-to-top cursor label`

---

## Task 9: MetaCell content recommendation

**Files:** `features/home/translations/en/pages.json`, `features/home/translations/ar/pages.json`

**Drift (Image 20):** User asked for stronger label/value suggestions vs current "Based in / Years coding / Currently / Focus".

**Recommended (confirm with user before applying):**
- Cell 1: `Based in` / `Cairo, EG` *(keep)*
- Cell 2: `Years coding` / `6+` *(keep)*
- Cell 3: `Open to` / `Senior full-stack & consulting` *(was "Currently / Challenge Group")*
- Cell 4: `Reply within` / `24 hours` *(was "Focus / Full-stack · AWS · CI/CD")*

- [ ] **Step 1:** Ask user: confirm or override. If overriding, gather their preferred labels.

- [ ] **Step 2:** Update `home.metaStrip.{currentlyLabel,currentlyValue,focusLabel,focusValue}` in en + ar.

- [ ] **Step 3:** Commit `feat(meta-strip): stronger labels per user feedback`

---

## Task 10: Theme-swap animation direction

**Files:** `features/ui-components/components/ThemeToggle.tsx`

**Drift (issue 11):** Current animates clip-path FROM `circle(maxR)` TO `circle(0)` — overlay shrinks AFTER `setTheme(next)`, so the new theme is visible at start. Legacy does the OPPOSITE: overlay starts at `circle(0)` (invisible), GROWS to `circle(maxR)` (covering the screen), THEN swaps theme behind it, THEN fades the overlay.

Legacy reference: `legacy/src/components.jsx:476-510`.

- [ ] **Step 1:** Rewrite `onClick` to match the legacy order:
```ts
const onClick = () => {
  const next = isLight ? 'dark' : 'light';
  const btn = buttonRef.current;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !btn) { setTheme(next); return; }

  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const maxR = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));

  // Probe NEXT theme's --color-bg via synchronous data-theme swap
  const root = document.documentElement;
  const prevAttr = root.getAttribute('data-theme') || 'dark';
  root.setAttribute('data-theme', next);
  const bgRaw = getComputedStyle(root).getPropertyValue('--color-bg').trim();
  root.setAttribute('data-theme', prevAttr);

  const overlay = document.createElement('div');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 100;
    background: ${bgRaw};
    clip-path: circle(0px at ${cx}px ${cy}px);
    pointer-events: none;
    will-change: clip-path, opacity;
  `;
  document.body.appendChild(overlay);

  gsap.to(overlay, {
    clipPath: `circle(${maxR}px at ${cx}px ${cy}px)`,
    duration: 0.7,
    ease: 'power2.inOut',
    onComplete: () => {
      setTheme(next);
      requestAnimationFrame(() => {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.out',
          onComplete: () => overlay.remove(),
        });
      });
    },
  });
};
```

- [ ] **Step 2:** Test light→dark, dark→light, and prefers-reduced-motion (overlay should skip, theme swaps instantly).

- [ ] **Step 3:** Commit `fix(theme): radial unmask grows from click point (matches legacy)`

---

## Task 11: Arabic font joining + RTL polish

**Files:** font config (likely `app/fonts.ts` or `app/[locale]/layout.tsx`), `app/globals.css`

**Drift (Image 21):** AR text renders as disconnected letters. Inter and Instrument Serif do not have Arabic glyphs — fallback fonts do not shape Arabic properly.

User has delegated full AR design discretion: *"the all arabic lang is missy also know that this feature not in the legacy so i need you to take the fully control of it here"*.

- [ ] **Step 1:** Audit current font setup. Find where `next/font/google` is configured. List the loaded variables.

- [ ] **Step 2:** Add two Arabic families:
```ts
import { Cairo, Noto_Naskh_Arabic } from 'next/font/google';

export const cairo = Cairo({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-arabic-sans',
});

export const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-arabic-serif',
});
```

- [ ] **Step 3:** Add both font variables to the root `<html>` class.

- [ ] **Step 4:** In `app/globals.css`, scope font-family by `html[lang="ar"]`:
```css
html[lang="ar"] body {
  font-family: var(--font-arabic-sans), system-ui, sans-serif;
}
html[lang="ar"] .font-serif,
html[lang="ar"] h1,
html[lang="ar"] h2,
html[lang="ar"] h3 {
  font-family: var(--font-arabic-serif), serif;
}
```

- [ ] **Step 5:** Audit AR strings for awkward phrasing — especially `home.hero.headline`, `home.contact.heading1/heading2`, and `home.metaStrip.*`. Polish to natural editorial Arabic.

- [ ] **Step 6:** Test `/ar` at 1440. If Arabic glyphs render visually larger than Latin, add an override:
```css
html[lang="ar"] h1.font-serif { font-size: clamp(56px, 9vw, 130px); }
```

- [ ] **Step 7:** Commit `feat(i18n): Arabic font families with proper joining`

---

## Task 12: 404 page redesign

**Files:** `app/[locale]/not-found.tsx`, possibly `app/not-found.tsx`, `features/ui-components/translations/{en,ar}/ui.json`

**Drift (Image 22):** Current is plain centered "404 / Not found". Needs site-chrome treatment.

- [ ] **Step 1:** Add `ui.notFound.{eyebrow,description,cta}` translation keys:
  - en: `eyebrow: "ERROR 404"`, `description: "The page you're looking for has moved or doesn't exist."`, `cta: "Back home"`
  - ar: Arabic equivalents.

- [ ] **Step 2:** Rebuild the not-found component:
```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function NotFound() {
  const t = await getTranslations('ui.notFound');
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />
      <p className="text-amber font-mono text-[11px] tracking-[0.2em] uppercase">{t('eyebrow')}</p>
      <h1 className="text-ink mt-6 font-serif leading-none text-[28vw] md:text-[18vw] lg:text-[14vw]">404</h1>
      <p className="text-inkdim mt-6 max-w-[480px] text-[15px]">{t('description')}</p>
      <Link href="/" className="btn-base btn-primary mt-8 inline-flex items-center gap-2">
        {t('cta')}
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
      <p aria-hidden className="pointer-events-none absolute -bottom-20 left-0 right-0 select-none text-center font-serif text-[28vw] leading-none tracking-tighter text-ink opacity-[0.04]">
        Paula
      </p>
    </main>
  );
}
```

- [ ] **Step 3:** Verify both `/en/non-existent` and `/ar/non-existent`.

- [ ] **Step 4:** Commit `feat(404): redesign not-found page to match site chrome`

---

## Task 13: Next.js preload warnings

**Files:** font config (likely `app/fonts.ts` or root layout)

**Drift (Image 23):** Console shows multiple `The resource <font-url> was preloaded using link preload but not used within a few seconds`. Next.js is preloading font variants we don't render.

- [ ] **Step 1:** Open the font config. List each font's `weight` and `style` arrays.

- [ ] **Step 2:** Grep for `font-` Tailwind utilities and `font-family` references. Identify which weights are USED (likely Inter 400+600, Instrument Serif 400, JetBrains Mono 400+500).

- [ ] **Step 3:** Trim each font's `weight` array to the used values. Ensure `display: 'swap'` is set.

- [ ] **Step 4:** If Arabic fonts (Task 11) are loaded, set `preload: false` on them so they load only on the AR route.

- [ ] **Step 5:** Hard refresh `/en` and `/ar`. Console must be clean of preload warnings.

- [ ] **Step 6:** Commit `perf(fonts): trim variants to remove preload warnings`

---

## Task 14: Final quality gates + legacy deletion

- [ ] **Step 1:** Run the full gate:
```bash
pnpm lint && pnpm type-check && pnpm format:check && pnpm test -- --run && pnpm test:e2e --project=chromium && pnpm build
```
All must pass.

- [ ] **Step 2:** Boot `pnpm dev` and walk both locales at 1440 / 1024 / 768 / 375. Compare with `legacy/Portfolio.html`. Confirm every screenshot issue is resolved.

- [ ] **Step 3:** Ask user for sign-off.

- [ ] **Step 4:** On sign-off, run `git rm -r legacy/ && git commit -m "chore: remove legacy/ — Next.js port at full parity"`.

- [ ] **Step 5:** Update `docs/STATE.md` to reflect parity complete + legacy removed + branch ready for merge.

---

## Self-review checklist (before claiming v3 done)

- [ ] All 14 tasks have a commit in `git log` since `7ad5919`.
- [ ] No console warnings on `/en` or `/ar` (preload, hydration, GSAP, etc.).
- [ ] Lighthouse audit on `/en` — SEO ≥ 90 (local), Performance ≥ 90, Accessibility ≥ 95.
- [ ] `pnpm test:e2e --project=chromium` passes.
- [ ] Side-by-side with legacy: no visible drift at any of the four viewport widths.
- [ ] STATE.md updated to reflect post-v3 state.
