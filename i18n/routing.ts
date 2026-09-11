import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from './config';

export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
  // generateMetadata already emits canonical + hreflang <link> tags with x-default → /en.
  // next-intl's default Link header pointed x-default at '/', contradicting them.
  alternateLinks: false,
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
