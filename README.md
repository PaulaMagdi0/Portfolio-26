# Paula Magdy — Portfolio

Personal portfolio site for Paula Magdy, Software Engineer (Cairo, Egypt).
Built with Next.js 16 App Router, statically rendered for both `en` and `ar` locales, with full SEO.

## Stack

- **Next.js 16** (App Router; webpack dev pinned via `--webpack` until the Turbopack Map-leak in 16.2.x is patched)
- **React 19**, **TypeScript** (strict)
- **Tailwind CSS 4** (with `@theme` tokens)
- **next-intl** — EN / AR with RTL
- **next-themes** — light / dark with OS detection, radial-unmask theme switch
- **framer-motion**, **GSAP** (ScrollTrigger, SplitText), **Lenis** — scroll-driven animations
- **Three.js** — hero 3D scene (lazy-loaded)
- **react-hook-form + Zod** — contact form (POSTs to Web3Forms; visitor stays on the page)
- **Vitest + jest-axe** — unit and a11y tests
- **Playwright** — E2E smoke tests

## Scripts

```bash
pnpm dev              # Dev server on localhost:3000
pnpm build            # Production build (runs lint + format:check + type-check first)
pnpm start            # Production server (after build)
pnpm lint             # ESLint
pnpm lint:fix         # ESLint with auto-fix
pnpm type-check       # tsc --noEmit
pnpm format           # Prettier write
pnpm format:check     # Prettier check
pnpm test             # Vitest (watch)
pnpm test -- --run    # Vitest (single run)
pnpm test:coverage    # Coverage report
pnpm test:e2e         # Playwright (auto-starts dev server)
pnpm analyze          # Bundle analyzer (ANALYZE=true next build)
```

## Folder layout

```
app/                     # Next.js App Router
  [locale]/              # Locale-scoped routes (en, ar)
  fonts.ts               # next/font/google declarations
  globals.css            # Tailwind v4 @theme tokens + presentation primitives
  sitemap.ts robots.ts
core/                    # Cross-feature utilities (no feature-specific code)
  motion/                # Lenis + GSAP + useReducedMotion + MotionProvider
  seo/                   # Metadata builders + Person JSON-LD
  accessibility/         # SkipLink
  theme/                 # (next-themes wrapper)
features/                # Vertical slices
  home/                  # All home sections + typed content config
  hero-3d/               # Three.js scene (lazy via next/dynamic)
  ui-components/         # Nav, cursor, scroll progress, page loader, etc.
  contact-form/          # rhf + zod form → Web3Forms POST
    services/            # submitContact() — the Web3Forms client
  localization/          # Locale switcher
i18n/                    # next-intl config, routing, request loader
lib/
  utils.ts               # cn()
  digits.ts              # locale-aware digit conversion
  env/env.schema.ts      # Zod-validated environment variables
public/                  # resume.pdf, OG images (og-en.png, og-ar.png)
  work/                  # Optimized .webp screenshots for the work-section cards
e2e/                     # Playwright specs
```

## Local dev

```bash
pnpm install
cp .env.example .env.local      # then fill in NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
pnpm dev
# Open http://localhost:3000 — redirects to /en
```

## Environment variables

| Variable                           | Required                      | Purpose                                                                                                                                                                                                      |
| ---------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`             | Recommended (prod)            | Canonical site URL used by SEO metadata, sitemap, and absolute OG image URLs. Defaults to `http://localhost:3000` if unset.                                                                                  |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | Required for the contact form | Web3Forms access key. Generate one free at [web3forms.com](https://web3forms.com/) by entering the inbox that should receive submissions. Without this key the contact form shows an error banner on submit. |

All env vars are validated by a Zod schema in `lib/env/env.schema.ts` at module load.

## Testing

```bash
pnpm test -- --run                  # All unit + a11y tests
pnpm test:e2e -- --project=chromium # E2E in Chromium
```

## Deployment

Deploy to Vercel (zero config). For other hosts, run `pnpm build` and serve `next start` against the produced output. Redirect `/Portfolio.html` → `/` is wired in `next.config.ts` for backlink safety.

## Architecture notes

See `.claude/CLAUDE.md` for the full architecture guide and per-area rules under `.claude/rules/`.

## License

All rights reserved © Paula Magdy.
