# Paula Magdy — Portfolio

Personal portfolio site for Paula Magdy, Software Engineer (Cairo, Egypt).
Single-page React app served from a static `Portfolio.html`, with JSX modules compiled in the browser via Babel Standalone.

## Tech Stack

- **React 18** (UMD build from unpkg)
- **Babel Standalone** — in-browser JSX compilation
- **Tailwind CSS** (Play CDN) with the typography plugin
- **Framer Motion** — UI animations
- **GSAP** + ScrollTrigger + SplitText — scroll-driven animations
- **Lenis** — smooth scrolling
- **Three.js** — hero 3D element
- Fonts: Instrument Serif, Inter, JetBrains Mono (Google Fonts)

No build step, no bundler, no `node_modules` — everything loads from CDN at runtime.

## Project Structure

```
Portfolio/
├── Portfolio.html      # Entry point — markup, CDN scripts, theme/i18n bootstrap
└── src/
    ├── app.jsx         # App shell, theme + loader + Lenis init, section composition
    ├── i18n.jsx        # Locale provider, useT() hook, translation strings
    ├── components.jsx  # Shared UI primitives (nav, cursor, scroll progress, etc.)
    ├── sections.jsx    # Page sections: Hero, Work, Experience, Education, Stack, Contact
    ├── hero3d.jsx      # Three.js hero scene
    └── motion.jsx      # Framer Motion + GSAP animation helpers
```

Each JSX file is loaded as a `<script type="text/babel">` tag and exposes its components on `window` so the next file can reference them. Order matters — see the script tags at the bottom of [Portfolio.html](Portfolio.html).

## Running Locally

Because the JSX files are fetched via `<script src="…">`, opening `Portfolio.html` directly with `file://` will be blocked by CORS. Serve the folder over HTTP instead:

```sh
# Python 3
python3 -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000/Portfolio.html>.

## Features

- Light / dark theme with OS-preference detection and manual toggle
- English / Arabic i18n with RTL support
- Custom cursor, scroll progress bar, scroll-velocity skew effects
- Animated page loader (counter, staged status text, progress fill)
- Three.js hero element
- Responsive across mobile, tablet, and desktop

## Deployment

Drop the folder onto any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3 + CloudFront). Rename `Portfolio.html` to `index.html` (or configure your host's default document) so the site loads at the root URL.

## License

All rights reserved © Paula Magdy.
