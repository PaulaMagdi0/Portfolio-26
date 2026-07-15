#!/usr/bin/env node
/**
 * Production canary: verifies the deployed site ships a well-formed Web3Forms
 * access key inlined in its client bundle, without sending any submissions.
 *
 * Guards against the 2026-07-15 incident class: a malformed value (e.g. the
 * site URL) pasted into NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY in the deployment
 * environment. Vercel env values on this project are sensitive-type and can
 * never be read back, so the deployed bundle is the only place to check.
 *
 * Prints only shape classifications, never the key value itself.
 *
 * Usage:
 *   node scripts/check-live-form-key.mjs               # checks https://paulamagdy.com
 *   SITE_URL=http://localhost:3000 node scripts/...    # checks another deployment
 *   node scripts/check-live-form-key.mjs --self-test   # runs fixture tests only
 */

const SITE_URL = (process.env.SITE_URL ?? 'https://paulamagdy.com').replace(/\/$/, '');
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// The property name appears more than once in the minified bundle — in the zod
// schema definition (`NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY:dy.string()…`) and in
// the parse call where Next.js inlined the env value
// (`NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY:"8542…"||void 0`). Only string-literal
// occurrences carry the deployed value; when the env var is unset at build
// time the parse call inlines `void 0` and no string literal exists.
const KEY_PROP_RE = /NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY["']?\s*:\s*(?:("|')([^"']*)\1|[^,}]+)/g;
const ATTEMPTS = 3;
const RETRY_DELAY_MS = 20_000;

export function extractKey(source) {
  const matches = [...source.matchAll(KEY_PROP_RE)];
  if (matches.length === 0) return { found: false, values: [] };
  // match[2] is the string literal body; undefined means a non-string
  // expression (schema definition, or `void 0` for an unset env var).
  const values = matches.map((m) => m[2]).filter((v) => v !== undefined);
  return { found: true, values };
}

export function classify(value) {
  if (value === null) return 'missing (non-string inlined)';
  if (value === '') return 'empty string';
  if (UUID_RE.test(value)) return 'UUID-shaped';
  if (/^https?:\/\//i.test(value)) return 'a URL';
  return `other (length ${value.length})`;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'portfolio-canary' } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.text();
}

async function collectBundleSources() {
  const html = await fetchText(`${SITE_URL}/en`);
  const seen = new Set(html.match(/\/_next\/static\/chunks\/[^"'\s]+\.js/g) ?? []);
  if (seen.size === 0) throw new Error('no JS chunks referenced by the page HTML');

  const sources = await Promise.all([...seen].map((path) => fetchText(`${SITE_URL}${path}`)));
  // One more level: lazy chunks referenced from inside the initial chunks.
  const nested = new Set(
    sources.flatMap((src) => src.match(/static\/chunks\/[A-Za-z0-9._/-]+\.js/g) ?? []),
  );
  for (const path of nested) {
    const absolute = `/_next/${path}`;
    if (seen.has(absolute)) continue;
    seen.add(absolute);
    sources.push(await fetchText(`${SITE_URL}${absolute}`).catch(() => ''));
  }
  return sources;
}

async function runCheck() {
  const sources = await collectBundleSources();

  if (!sources.some((src) => src.includes('api.web3forms.com'))) {
    throw new Error('contact form code (api.web3forms.com) not found in any bundle chunk');
  }

  const results = sources.map((src) => extractKey(src)).filter((result) => result.found);
  if (results.length === 0) {
    throw new Error('NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY not found in any bundle chunk');
  }

  const literals = results.flatMap((result) => result.values);
  if (literals.length === 0) {
    throw new Error('deployed access key is missing (env var unset at build time)');
  }
  if (!literals.some((value) => classify(value) === 'UUID-shaped')) {
    throw new Error(
      `deployed access key is ${classify(literals[0])} — the contact form will fail with 400s`,
    );
  }

  console.log(`PASS: ${SITE_URL} ships a UUID-shaped Web3Forms access key and the form code.`);
}

function selfTest() {
  // Fixtures mirror the real minified bundle: the schema definition (non-string)
  // coexists with the inlined literal, so extraction must survive both.
  const cases = [
    [
      'NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY:dy.string().min(1).optional()});NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY:"123e4567-e89b-42d3-a456-426614174000"||void 0',
      'UUID-shaped',
    ],
    ['NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY:"https://paulamagdy.com"||void 0', 'a URL'],
    ['NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY:""', 'empty string'],
    ['NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY:void 0,otherProp:1', 'no string literal'],
  ];
  for (const [fixture, expected] of cases) {
    const { found, values } = extractKey(fixture);
    const actual = !found
      ? 'not found'
      : values.length === 0
        ? 'no string literal'
        : classify(values.find((v) => classify(v) === 'UUID-shaped') ?? values[0]);
    if (actual !== expected) {
      console.error(`SELF-TEST FAIL: "${fixture}" -> ${actual}, expected ${expected}`);
      process.exit(1);
    }
  }
  if (extractKey('unrelated:"code"').found) {
    console.error('SELF-TEST FAIL: matched a fixture without the env property');
    process.exit(1);
  }
  console.log('SELF-TEST PASS: extraction and classification behave as expected.');
}

if (process.argv.includes('--self-test')) {
  selfTest();
} else {
  let lastError;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      await runCheck();
      process.exit(0);
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt}/${ATTEMPTS} failed: ${error.message}`);
      if (attempt < ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }
  console.error(`FAIL: ${lastError.message}`);
  process.exit(1);
}
