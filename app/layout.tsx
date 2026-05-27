import type { ReactNode } from 'react';
import './globals.css';

/**
 * Root layout — minimal shell required by Next.js App Router.
 * The locale-specific <html lang> and <body> are rendered by app/[locale]/layout.tsx.
 * This shell is only hit for non-locale routes (e.g. /robots.txt, /sitemap.xml,
 * the /_not-found fallback), which Next.js handles before reaching this file.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
