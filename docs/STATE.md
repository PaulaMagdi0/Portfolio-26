# Project State / Handoff

**Last updated:** 2026-05-27
**Branch:** `feature/nextjs-conversion`
**Latest commit:** `d562d4e fix: silence three deprecation, next-intl timeZone, and next 16 console noise`
**Total commits on branch:** 46
**Working tree:** clean

---

## Status at a glance

The Next.js 16 portfolio is **feature-complete and functional**. All 7 home sections render in both `en` and `ar` locales. SEO is wired (sitemap, robots, OG images, Person JSON-LD, hreflang). 21/21 unit tests pass, 11/11 chromium E2E tests pass, lint + format + type-check + build all green.

The plan that produced this work is in `docs/superpowers/plans/2026-05-27-nextjs-conversion.md`. It defined 35 tasks; **34 are done**. The one remaining is Task 35 (delete `legacy/`), which is intentionally gated on a manual visual-parity check by the user.

---

## What's left (prioritized)

### 1. Visual parity check + delete legacy (blocks shipping)

The original static-React portfolio lives at `legacy/Portfolio.html` + `legacy/src/`. The plan's Task 35 says to:

1. Start `pnpm dev` and the legacy build (`cd legacy && python3 -m http.server 8001`)
2. Compare `/en` and `/ar` against `http://localhost:8001/Portfolio.html` side-by-side
3. If parity holds, `git rm -r legacy/` and commit
4. If anything diverges, fix the Next.js port first

User has eyeballed the page once but has not yet given the explicit "delete it" go-ahead. Do not delete without that.

### 2. Restore the char-by-char SplitReveal animation (nice-to-have)

In commit `5349f44` SplitReveal was simplified from GSAP SplitText (per-char stagger) to plain CSS transition (whole-line slide-up). The original animation looked nicer but was unreliable — the new version always renders the heading. If the user wants the char-stagger back, the path is:

- Restore the GSAP+SplitText implementation in `features/ui-components/components/SplitReveal.tsx`
- Replace `ScrollTrigger` with `IntersectionObserver` (still — the issue with ScrollTrigger was the Lenis sync)
- Add a fallback timeout (~1.5s) that forces `yPercent: 0` if the observer doesn't fire — keeps the heading from staying hidden
- Verify by running `pnpm test:e2e -- --project=chromium e2e/verify.spec.ts` and looking at `test-results/verify/02-en-full.png`

### 3. Arabic OG image with proper script rendering

`app/[locale]/opengraph-image.tsx` currently emits Latin text for both locales. Satori (the engine behind `ImageResponse`) can't render certain Arabic GSUB substitutions without a bundled font. The fix:

1. Add a Noto Naskh Arabic font file to `public/fonts/` (or load from a CDN at build time)
2. Pass it to `ImageResponse` via the `fonts` option
3. Branch the rendered text on `safeLocale === 'ar'` to use the Arabic title/subtitle (the branch variable is already in place)

### 4. Arabic translation polish

Arabic translations in `features/*/translations/ar/*.json` were AI-drafted during the port. They're plausible but should be reviewed by a native Arabic speaker before shipping. Tone target: editorial, professional, parallel to the English copy.

### 5. Color-contrast a11y findings (low priority)

Lighthouse flagged two intentional low-opacity decorative elements:
- Inactive locale pill button (`#5c5c5c` on `#111111`)
- `.section-num` muted labels

Both are design choices. If you want to satisfy axe strictly, bump the muted-color tokens by ~10% lightness in `app/globals.css` under the `@theme` block.

### 6. JSON-LD script warning during client-side locale switch

React 19 logs `Encountered a script tag while rendering React component` when the locale switcher does a soft navigation. The JSON-LD still ships in HTML and SEO is unaffected, but the warning is noisy. Options:

- Emit JSON-LD via the Next.js Metadata API (`metadata.other`) so React never sees it as a render-tree element
- Move it into a separate route segment that doesn't re-render on locale change
- Suppress the warning — there is no clean React-level way

### 7. Lighthouse SEO 92 → 100 (production env only)

Lighthouse SEO is 92 on localhost because the `canonical` audit fails when `NEXT_PUBLIC_SITE_URL` defaults to `http://localhost:3000`. Setting that env var to the real production URL on the deploy target lifts it to 100 automatically. No code change required.

### 8. Firefox/WebKit Playwright browsers (only if CI needs cross-browser)

`pnpm test:e2e` only runs Chromium locally — Firefox/WebKit binaries aren't installed. If CI needs cross-browser coverage, run `npx playwright install` in the CI image.

---

## Known caveats (won't-fix or external)

### Next.js `middleware` → `proxy` deprecation

Next.js 16 emits `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.` on every dev start. We can't migrate yet — `next-intl@4.12` only exports `next-intl/middleware`, no `proxy`. Track upstream at https://github.com/amannn/next-intl until they ship proxy support. The rules file `.claude/rules/next-config.md` already documents this.

### `THREE.Clock` deprecation

Already fixed in `d562d4e` — switched the hero-3d animation loop to `performance.now()`.

### `node_modules/three` patch warnings

Three.js will continue emitting `THREE.Clock is deprecated` if any OTHER part of the codebase reintroduces Clock. None does today.

---

## How to verify the current state

```bash
# Branch + commits
git log --oneline feature/nextjs-conversion | head -10

# Quality gates
pnpm lint        # expect: clean, 0 errors
pnpm type-check  # expect: clean
pnpm test -- --run             # expect: 21 passed
pnpm test:e2e -- --project=chromium  # expect: 11 passed (Firefox/WebKit will fail if not installed — ignore)

# Run dev server
pnpm dev         # localhost:3000 → /en

# Full verification spec with screenshots + console capture
pnpm test:e2e -- --project=chromium e2e/verify.spec.ts
# Outputs to test-results/verify/{01..11}.png and report.json
```

---

## Key files to read first when resuming

1. `docs/superpowers/plans/2026-05-27-nextjs-conversion.md` — the original plan, every task documented
2. `.claude/CLAUDE.md` — project conventions, architecture, scripts
3. `.claude/rules/*.md` — per-area rules (components, i18n, testing, etc.)
4. `e2e/verify.spec.ts` — exercises every flow, useful for regression checking
5. `legacy/Portfolio.html` and `legacy/src/*.jsx` — the original visual reference (read-only, will be deleted in Task 35)
6. `docs/STATE.md` — **this file**

---

## Open questions to surface to the user when resuming

- "Have you visually compared `/en` and `/ar` against `legacy/Portfolio.html`? Should I delete `legacy/`?"
- "Want the char-by-char SplitReveal animation restored?"
- "Do you have Arabic translations from a translator, or should I draft another pass?"
- "What's the production domain? I'll set up the `NEXT_PUBLIC_SITE_URL` deploy config."

---

## Branch / merge state

Branch `feature/nextjs-conversion` is **ready for review and merge to `main`** once Task 35 is resolved. The branch has not been pushed to any remote yet — `git remote -v` shows no upstream configured. To push:

```bash
git remote add origin <your-repo-url>
git push -u origin feature/nextjs-conversion
```

Or merge locally:

```bash
git checkout main
git merge --no-ff feature/nextjs-conversion
```

The default `main` is at `8fb96fd Add .gitignore and README.md; remove .DS_Store and .thumbnail` — i.e., before any of this work. Merging will be a fast-forward with 46 new commits.
