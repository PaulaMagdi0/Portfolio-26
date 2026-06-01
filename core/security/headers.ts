// core/security/headers.ts
// Single source of truth for response security headers, including the CSP.
// Wired into next.config.ts via headers(). Keep directives in sync with the
// runtime: inline <script> blocks (ThemeInitScript, Person JSON-LD) and
// Tailwind's runtime style injection require 'unsafe-inline'. Web3Forms is the
// only external endpoint the app talks to (contact form POST).

const isProd = process.env.NODE_ENV === 'production';

const CSP_DIRECTIVES: Record<string, readonly string[]> = {
  'default-src': ["'self'"],
  'script-src': isProd
    ? ["'self'", "'unsafe-inline'"]
    : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", 'https://api.web3forms.com'],
  'worker-src': ["'self'", 'blob:'],
  'frame-ancestors': ["'self'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'", 'https://api.web3forms.com'],
  'object-src': ["'none'"],
  'upgrade-insecure-requests': [],
};

// Module-private — SECURITY_HEADERS is the only public surface.
function buildContentSecurityPolicy(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([k, v]) => (v.length ? `${k} ${v.join(' ')}` : k))
    .join('; ');
}

export const SECURITY_HEADERS: ReadonlyArray<{ key: string; value: string }> = [
  { key: 'Content-Security-Policy', value: buildContentSecurityPolicy() },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // HSTS (security review #S1). Two years + preload. Only meaningful over HTTPS;
  // harmless on localhost (browsers ignore it on http). Vercel also sets this at
  // the edge, but emitting it here keeps the policy self-documented.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];
