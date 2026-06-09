import { loaderRevealScript } from './pageLoaderReveal';

// Renders the curtain-lift script as raw HTML (same pattern as ThemeInitScript)
// so React never sees a <script> JSX node. The browser executes it while
// parsing the SSR'd HTML, so `html.loaded` is set off the hydration path — the
// page-loader wipes away as soon as fonts resolve instead of waiting for the
// client bundle. See loaderRevealScript.ts for the full rationale.
export function LoaderRevealScript() {
  return (
    <span
      hidden
      aria-hidden
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: `<script>${loaderRevealScript}</script>` }}
    />
  );
}
