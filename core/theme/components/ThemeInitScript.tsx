import { themeInitScript } from '../utils/themeInitScript';

// Renders the FOUC-prevention script as raw HTML inside a wrapper element so React
// never sees a <script> JSX node (React 19 warns on inline scripts during client
// rendering). The browser still executes the script while parsing the SSR'd HTML,
// before any visible content paints.
export function ThemeInitScript() {
  return (
    <span
      hidden
      aria-hidden
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: `<script>${themeInitScript}</script>` }}
    />
  );
}
