import { env } from '@/lib/env/env.schema';
import type { ContactFormValues } from '../types/contact.schema';

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

// To restrict which origins can use this access key, enable domain whitelisting
// in the Web3Forms dashboard at https://web3forms.com/dashboard.
export async function submitContact(values: ContactFormValues): Promise<void> {
  const key = env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY');
  }

  const res = await fetch(WEB3FORMS_ENDPOINT, {
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

  const json: unknown = await res.json();
  if (
    typeof json !== 'object' ||
    json === null ||
    typeof (json as { success?: unknown }).success !== 'boolean'
  ) {
    throw new Error('Unexpected Web3Forms response shape');
  }
  const parsed = json as { success: boolean; message?: string };
  if (!parsed.success) {
    throw new Error(parsed.message ?? 'Web3Forms submission failed');
  }
}
