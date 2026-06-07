import type { MetadataRoute } from 'next';
import { SITE_NAME } from '@/core/seo';

// Static by default — keep it explicit to match the rest of the static site.
export const dynamic = 'force-static';

/**
 * Web App Manifest — Next.js auto-serves this at /manifest.webmanifest and
 * injects <link rel="manifest"> into the document head. Colors mirror the dark
 * default theme (--color-bg / --color-ink in app/globals.css). Icons reuse the
 * app/ icon convention files (icon.svg / icon.png).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Full-Stack Software Engineer`,
    short_name: SITE_NAME,
    description:
      'Full-stack software engineer in Cairo, Egypt — building and scaling production web platforms across multiple modern tech stacks.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon.png', sizes: '96x96', type: 'image/png' },
    ],
  };
}
