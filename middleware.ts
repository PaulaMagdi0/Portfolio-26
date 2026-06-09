import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { isLocale } from './i18n/config';
// Direct import (not the feature barrel) keeps the middleware bundle free of
// React components — the barrel re-exports them and would bloat the edge runtime.
import { buildHomeMarkdown } from './features/home/utils/buildHomeMarkdown';

const intlMiddleware = createMiddleware(routing);

/** True when the client explicitly asks for Markdown (an AI agent), not just HTML. */
function wantsMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  return accept.split(',').some((range) => range.trim().toLowerCase().startsWith('text/markdown'));
}

export default function middleware(request: NextRequest) {
  // Markdown for Agents: serve a Markdown rendering of a locale home page when the
  // request asks for `text/markdown`. Browsers and crawlers send `text/html`, so
  // HTML stays the default and SEO is unaffected. `Vary: Accept` keeps caches correct.
  const segment = request.nextUrl.pathname.replace(/^\/+|\/+$/g, '');
  if (isLocale(segment) && wantsMarkdown(request.headers.get('accept'))) {
    const markdown = buildHomeMarkdown(segment);
    return new NextResponse(markdown, {
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': String(Math.ceil(markdown.length / 4)),
        vary: 'Accept',
        'cache-control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|icon|apple-icon|.*\\..*).*)'],
};
