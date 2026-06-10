# Paula Magdy — Portfolio

Personal portfolio site for Paula Magdy, Software Engineer (Cairo, Egypt).
Built with Next.js 16 App Router, statically rendered for both `en` and `ar` locales, with full SEO
and a first-class surface for AI agents (llms.txt, Markdown content negotiation, WebMCP tools).

## Stack

- **Next.js 16** (App Router; webpack dev pinned via `--webpack` until the Turbopack Map-leak in 16.2.x is patched)
- **React 19**, **TypeScript** (strict)
- **Tailwind CSS 4** (with `@theme` tokens)
- **next-intl** — EN / AR with RTL
- **Custom theme provider** (`core/theme`) — light / dark with OS detection, flash-free init script, radial-unmask theme switch
- **framer-motion**, **GSAP** (ScrollTrigger, SplitText), **Lenis** — scroll-driven animations
- **Three.js** — hero 3D scene (lazy-loaded)
- **react-hook-form + Zod** — contact form (POSTs to Web3Forms; visitor stays on the page)
- **@vercel/analytics + @vercel/speed-insights** — first-party metrics (report only on Vercel deployments)
- **Vitest + jest-axe** — unit and a11y tests
- **Playwright** — E2E tests against a production build

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
pnpm test:ci          # Vitest (single run — what CI uses)
pnpm test:coverage    # Coverage report
pnpm test:e2e         # Playwright (builds + serves the prod app automatically)
pnpm analyze          # Bundle analyzer (ANALYZE=true next build)
```

## Folder layout

```
app/                     # Next.js App Router
  [locale]/              # Locale-scoped routes (en, ar): layout, page, 404, providers
  auth.md/route.ts       # Agent-auth doc: no protected APIs — points agents at the real surfaces
  fonts.ts               # next/font/google declarations
  globals.css            # Tailwind v4 @theme tokens + presentation primitives
  sitemap.ts robots.ts manifest.ts apple-icon.tsx
core/                    # Cross-feature utilities (no feature-specific code)
  motion/                # Lenis + GSAP + useReducedMotion + MotionProvider
  seo/                   # Metadata builder + Person/WebSite/ProfilePage JSON-LD + site config
  security/              # CSP + security headers (wired into next.config.ts)
  accessibility/         # SkipLink
  theme/                 # Custom ThemeProvider + flash-free theme init script
features/                # Vertical slices
  home/                  # All home sections + typed content config
    utils/               # buildHomeMarkdown() — Markdown rendering of the page for agents
  hero-3d/               # Three.js scene (lazy via next/dynamic)
  ui-components/         # Nav, cursor, scroll progress, page loader, WebMCP tools, etc.
  contact-form/          # rhf + zod form → Web3Forms POST
    services/            # submitContact() — the Web3Forms client
  localization/          # Locale switcher
i18n/                    # next-intl config, routing, request loader
lib/
  utils.ts               # cn()
  digits.ts              # locale-aware digit conversion
  env/env.schema.ts      # Zod-validated environment variables
middleware.ts            # next-intl locale routing + Accept: text/markdown negotiation
public/                  # resume.pdf, OG images (og-en-v2.png, og-ar-v2.png), llms.txt
  .well-known/           # security.txt (RFC 9116)
  icons/                 # Vendored stack/cert logos (no external image CDN)
  work/                  # Optimized .webp screenshots for the work-section cards
e2e/                     # Playwright specs (home, locale, theme, contact, verify)
__tests__/lib/           # Shared lib tests (cn)
types/                   # Ambient type declarations (jest-axe)
docs/                    # Design specs and implementation plans
```

## Local dev

```bash
pnpm install
cp .env.example .env.local      # then fill in NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
pnpm dev
# Open http://localhost:3000 — redirects to your preferred locale (/en by default)
```

## Environment variables

| Variable                           | Required                      | Purpose                                                                                                                                                                                                                             |
| ---------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`             | Recommended (prod)            | Canonical site URL used by SEO metadata, sitemap, and absolute OG image URLs. Falls back to `https://paulamagdy.com` if unset — deliberately the real domain, so a missing var can never point canonical/OG tags at the wrong host. |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | Required for the contact form | Web3Forms access key. Generate one free at [web3forms.com](https://web3forms.com/) by entering the inbox that should receive submissions. Without this key the contact form shows an error banner on submit.                        |

Both vars are optional at build time — validated by a Zod schema in `lib/env/env.schema.ts`; the build never fails on a missing one.

## SEO

- Per-locale `generateMetadata`: title, description, canonical, hreflang (`en` / `ar` / `x-default`), Open Graph (per-locale image), Twitter card.
- JSON-LD `@graph` in `<head>`: `Person` + `WebSite` + per-locale `ProfilePage` (built in `core/seo/`).
- `sitemap.xml` with hreflang alternates; standards-only `robots.txt` with sitemap pointer.
- Freshness via a manually bumped `LAST_UPDATED` date in `core/seo/config/site.config.ts` (sitemap `lastModified`, ProfilePage `dateModified`) — never a per-build timestamp.

## AI / agent readiness

The site is readable by AI agents through several dedicated surfaces:

- **Markdown content negotiation** — `GET /en` or `/ar` with `Accept: text/markdown` returns the full page as Markdown (built by `features/home/utils/buildHomeMarkdown.ts` from the same config + translations the React page uses, so it can't drift). Includes an `x-markdown-tokens` size-estimate header and `Vary: Accept`.
- **`/llms.txt`** — machine-readable summary with site links and contact info.
- **`/auth.md`** — honest agent-auth doc: no protected APIs, no registration; points agents at the surfaces above.
- **WebMCP tools** — `WebMcpTools.tsx` registers five tools on the experimental `navigator.modelContext` API (`get_portfolio`, `view_projects`, `download_resume`, `contact_me`, `navigate_to_section`); feature-detected, a no-op in browsers without it.
- **`Content-Signal: search=yes, ai-input=yes, ai-train=no`** — sent as an HTTP header on every response (kept out of robots.txt so it stays standards-valid).
- **`/.well-known/security.txt`** — RFC 9116 contact info.

## Testing

```bash
pnpm test:ci                        # All unit + a11y tests (Vitest + jest-axe, jsdom)
pnpm test:e2e -- --project=chromium # E2E in Chromium (also: firefox, webkit)
```

Unit tests are colocated in `features/<name>/__tests__/` (shared lib utilities in `__tests__/lib/`);
every top-level section has a jest-axe `*.accessibility.test.tsx`.
Playwright builds and serves the production app
(`pnpm build && pnpm start`), so prerendered routes and the real security headers are exercised.

## CI & quality gates

- **CI** (`.github/workflows/ci.yml`) — lint → format:check → type-check → test → build on every push/PR to `main`.
- **Lighthouse CI** (`.github/workflows/lighthouse.yml`) — builds, serves, and audits `/en` and `/ar` against `lighthouserc.json`: **SEO = 100** and **a11y ≥ 0.95** are hard gates; performance, LCP, CLS, TBT, and script weight assert as warnings.
- **Pre-commit** — husky + lint-staged run `eslint --fix` + `prettier --write` on staged files (hook reinstalled by the `prepare` script on `pnpm install`).

## Deployment

Deploy to Vercel (zero config). For other hosts, run `pnpm build` and serve `next start` against the produced output. Redirect `/Portfolio.html` → `/` is wired in `next.config.ts` for backlink safety. Security headers (CSP, HSTS, etc.) come from `core/security/` via `next.config.ts`, so they apply on any host.

## Architecture notes

See `.claude/CLAUDE.md` for the full architecture guide and per-area rules under `.claude/rules/`.

## License

All rights reserved © Paula Magdy.
