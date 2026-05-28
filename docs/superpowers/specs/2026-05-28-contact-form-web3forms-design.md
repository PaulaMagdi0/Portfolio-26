# Contact Form: Web3Forms Submission

**Status:** Draft for review
**Date:** 2026-05-28
**Owner:** Paula Magdy

## Problem

The portfolio contact form currently builds a `mailto:` URL and sets `window.location.href`, redirecting the visitor to their mail app. Many visitors don't have a configured desktop mail client, mobile mail apps require an additional confirmation, and the visitor never lands back on the portfolio after sending. The form is effectively a dead end for a portion of traffic.

We need a delivery path that:

1. Keeps the visitor on the page.
2. Costs nothing to operate at portfolio-scale traffic.
3. Requires no self-hosted backend (the portfolio is a static-rendered Next.js site with no API surface today).

## Solution

Submit form values via `fetch` POST to [Web3Forms](https://web3forms.com/) (`https://api.web3forms.com/submit`). Web3Forms is a free, unlimited form-relay service: a client POST with an access key results in an email delivered to the inbox tied to that key. No server-side code required.

The contact form gains four submission states (`idle | sending | sent | error`), an inline banner above the form for success and error feedback, a hidden honeypot field for spam protection, and a field reset on success so a follow-up message takes one click.

## Architecture

### Submission flow

```
ContactForm (client component)
    │
    │  onSubmit(values)                       [react-hook-form + Zod still validates locally]
    ▼
submitContact(values)                         [features/contact-form/services/submitContact.ts]
    │
    │  POST https://api.web3forms.com/submit
    │  body: { access_key, subject, from_name, replyto, name, email, message, botcheck }
    ▼
Web3Forms relay  ───►  p.magdy@challengegroup.org
```

The service throws on non-2xx responses or `{ success: false }` bodies. The component catches and transitions to the `error` state.

### Files

```
features/contact-form/
├── components/
│   └── ContactForm.tsx              # MODIFY
├── services/                         # NEW directory
│   └── submitContact.ts              # NEW
├── utils/
│   └── buildMailto.ts                # DELETE
├── translations/
│   ├── en/contact.json               # MODIFY
│   └── ar/contact.json               # MODIFY
├── __tests__/
│   ├── ContactForm.test.tsx          # MODIFY
│   └── submitContact.test.ts         # NEW
└── index.ts                          # no change (ContactForm export unchanged)

.env.example                          # MODIFY — add NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY placeholder
.env.local                            # NEW (gitignored) — real key for local dev
.claude/rules/forms.md                # MODIFY — document Web3Forms as the live path
```

A `services/` directory is new for this feature. `.claude/rules/forms.md` and `.claude/rules/features.md` both anticipate this: a `services/` directory is added when a real need arises, which this is.

`utils/buildMailto.ts` is deleted (not kept as a fallback). YAGNI; the rule file is updated to match.

## Components

### `services/submitContact.ts`

Single exported function. No React, no i18n — pure I/O.

```ts
type ContactPayload = {
  name: string;
  email: string;
  message: string;
  botcheck?: string;
};

export async function submitContact(values: ContactPayload): Promise<void> {
  const key = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY');
  }

  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      access_key: key,
      subject: `Portfolio contact from ${values.name}`,
      from_name: values.name,
      replyto: values.email,
      name: values.name,
      email: values.email,
      message: values.message,
      botcheck: values.botcheck ?? '',
    }),
  });

  if (!res.ok) {
    throw new Error(`Web3Forms request failed: ${res.status}`);
  }
  const json: { success: boolean; message?: string } = await res.json();
  if (!json.success) {
    throw new Error(json.message ?? 'Web3Forms submission failed');
  }
}
```

Notes:

- No retry logic — visitor sees an error banner and can resubmit manually.
- `replyto: values.email` makes "Reply" in the receiving inbox reply to the visitor, not to Web3Forms.
- `botcheck` is always sent (empty for humans, populated for bots). Web3Forms drops submissions where it's non-empty.

### `components/ContactForm.tsx`

Changes from the current implementation:

1. Import `submitContact` from `../services/submitContact`. Delete the `buildMailto` import.
2. Register the honeypot field: `<input type="text" {...register('botcheck')} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />`. Schema adds `botcheck: z.string().optional()`.
3. Extend the status union: `type Status = 'idle' | 'sending' | 'sent' | 'error';`.
4. Replace the `onSubmit` body:
   ```ts
   const onSubmit = async (values: ContactFormValues) => {
     setStatus('sending');
     try {
       await submitContact(values);
       reset();
       setStatus('sent');
     } catch {
       setStatus('error');
     }
   };
   ```
   Pull `reset` from `useForm`. On `error`, the button re-enables so the visitor can retry; status stays `error` until the next submit attempt sets it back to `sending`.
5. Render a banner above the form:
   ```tsx
   {
     status === 'sent' && (
       <div role="status" className="banner-success">
         {t('formSuccess')}
       </div>
     );
   }
   {
     status === 'error' && (
       <div role="alert" className="banner-error">
         {t('formError')}
       </div>
     );
   }
   ```
   `role="status"` uses an `aria-live="polite"` announcement; `role="alert"` uses `assertive`. Exact Tailwind class names use existing tokens — see Styling below.
6. Button label mapping:
   - `idle` → `t('formSend')`
   - `sending` → `t('formSending')` (copy updated, see Translations)
   - `sent` → `t('formSend')` (button re-enabled after reset; banner carries the success message)
   - `error` → `t('formSend')` (button re-enabled for retry)
7. Disable the button only while `status === 'sending'`.

### Styling

Banners use existing design tokens — no new colors. Tailwind classes:

- Success: `rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300`
- Error: `rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300`
- Container spacing: `mb-6` so the banner sits above the first field.

If the project's design system prefers token-based colors (`text-ink`, `bg-bg`) over Tailwind's palette, the implementation step swaps to those after a quick grep of existing usage.

## Data flow

1. User types in fields. `react-hook-form` + `zodResolver` validate on submit using the existing schema in `types/contact.schema.ts` (with `botcheck` added as `z.string().optional()`).
2. If valid, `onSubmit` runs. Status → `sending`. Button disables.
3. `submitContact(values)` POSTs to Web3Forms with the access key from `process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`.
4. On 2xx + `{ success: true }`: form fields reset via `reset()`, status → `sent`, success banner renders, button re-enables.
5. On any failure (network, 4xx/5xx, `{ success: false }`): status → `error`, error banner renders, button re-enables, fields preserved so user can retry without re-typing.

## Translations

`features/contact-form/translations/en/contact.json` updates:

```json
{
  "formSending": "Sending…",
  "formSent": "Send message",
  "formHelper": "I read every message and reply within a few days.",
  "formSuccess": "Thanks — your message is on its way. I'll reply soon.",
  "formError": "Something went wrong. Please try again or email me directly at p.magdy@challengegroup.org."
}
```

`features/contact-form/translations/ar/contact.json` gets parallel Arabic translations matching the existing tone in that file. Existing keys (`formName`, `formEmail`, `errors.*`, etc.) are unchanged.

Note: `formSent` reverts to the same label as `formSend` because after the banner appears and the form resets, the button is ready for the next message — there's no need for a separate "Sent" label on the button itself.

## Error handling

| Failure                              | UX                                                            | Recovery                                                                  |
| ------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Network offline / fetch rejects      | Error banner + button re-enabled                              | User clicks Send again                                                    |
| Web3Forms 4xx/5xx                    | Error banner + button re-enabled                              | User clicks Send again, or emails directly (banner mentions email)        |
| `{ success: false }` in 2xx response | Error banner + button re-enabled                              | Same as above                                                             |
| Missing access key in env            | Service throws on first submit attempt → error banner appears | Deploy fix: set `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` and redeploy           |
| Bot fills honeypot                   | Web3Forms silently drops; we still show success banner        | Intentional — bot sees what looks like success, doesn't probe for failure |

No retry-with-backoff. A single failed POST shows the banner; the user retries manually.

## Testing

### `__tests__/submitContact.test.ts` (new)

Mock `global.fetch` via `vi.stubGlobal('fetch', vi.fn())`. Cases:

1. POSTs to `https://api.web3forms.com/submit` with `Content-Type: application/json`.
2. Body includes `access_key`, `subject`, `from_name`, `replyto`, `name`, `email`, `message`, `botcheck`.
3. Resolves on `{ ok: true, json: () => ({ success: true }) }`.
4. Throws on `{ ok: false, status: 500 }`.
5. Throws on `{ ok: true, json: () => ({ success: false, message: 'bad key' }) }`.
6. Throws when `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` is unset (`vi.stubEnv`).

### `__tests__/ContactForm.test.tsx` (modify)

Existing tests around validation and mailto URL construction either adapt or get replaced:

- Drop any tests asserting `window.location.href` was set or that a mailto URL was built. The `buildMailto.test.ts` file (if it exists) is deleted alongside `buildMailto.ts`.
- Mock `submitContact` via `vi.mock('../services/submitContact', () => ({ submitContact: vi.fn() }))`.
- Cases:
  1. Validation still blocks submit when fields are invalid (existing test, no change).
  2. On valid submit, `submitContact` is called once with `{ name, email, message, botcheck: '' }`.
  3. On successful submission, the success banner appears (`role="status"`) and form fields are reset (assert input values are empty strings).
  4. On `submitContact` rejection, the error banner appears (`role="alert"`) and form values are preserved (assert input values still equal what was typed).
  5. The honeypot input exists in the DOM, is `aria-hidden`, has `tabIndex={-1}`, and is visually hidden (the `hidden` Tailwind class collapses it).

### Accessibility

`__tests__/ContactForm.accessibility.test.tsx` (if it exists) — extend to cover both banner states by rendering with `status='sent'` and `status='error'` and running `axe` against each. If no a11y test file exists today, add one.

## Configuration

`.env.example`:

```
# Web3Forms access key. Generate one for free at https://web3forms.com/ by
# entering the inbox that should receive form submissions.
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=__YOUR_KEY_HERE__
```

`.env.local` (gitignored — implementation step writes this):

```
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=8542507a-e40f-4cc2-b9a8-e012d69baf5c
```

### Why `NEXT_PUBLIC_*`?

The fetch happens in a client component, so the key must be exposed to the browser. This is a deliberate Web3Forms design choice and is safe because:

- The key is scoped to a single inbox — it can only cause email delivery to `p.magdy@challengegroup.org`.
- It can be regenerated from the Web3Forms dashboard at any time.
- Web3Forms rate-limits and detects abuse on their side.

This is not a credential leak — it's a public form ID, similar to a Stripe publishable key.

No Zod env-schema validation is added in this iteration because the schema would only validate one optional string; the service-level guard (`if (!key) throw`) gives equivalent safety with less ceremony. If a second env var is added later, that's when `lib/env/env.schema.ts` becomes worth introducing.

## Documentation updates

`.claude/rules/forms.md` is updated in this change:

- "On submit, build a `mailto:` URL…" → "On submit, POST to Web3Forms via the `submitContact` service."
- The "If a server-side submission is ever added…" paragraph is replaced with a description of the current flow and a reference to the `services/` directory.

## Out of scope

- Domain-verified custom "from" address (Web3Forms' default sender is fine).
- hCaptcha or reCAPTCHA (honeypot alone is sufficient for portfolio-scale traffic).
- Rate limiting on our side (Web3Forms handles it upstream).
- Retry-with-backoff on transient errors (manual retry is fine).
- A Zod-validated `lib/env/env.schema.ts` (deferred until a second env var exists).
- Preserving the `mailto:` path as a fallback.
- Server-side rendering of the form (it's already a client component — no change).
- Migrating off Web3Forms in the future. If quota becomes an issue or the service shuts down, the `services/submitContact.ts` boundary makes swapping to Resend + an API route a localized change.

## Success criteria

1. Submitting a valid form on the live site results in an email arriving at `p.magdy@challengegroup.org` within ~30 seconds, and the visitor sees the success banner without leaving the page.
2. Submitting with the honeypot field populated (simulated in tests) is accepted by the UI but dropped by Web3Forms.
3. Submitting with a missing env var, or while offline, shows the error banner and re-enables the button.
4. All existing Vitest + jest-axe tests pass; new tests for `submitContact` and updated tests for `ContactForm` pass.
5. Lighthouse SEO + a11y scores on `/en` and `/ar` are unchanged from current baseline.
6. Both EN and AR locales render banner copy correctly (RTL layout verified manually).
