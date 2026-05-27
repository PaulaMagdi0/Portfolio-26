import { RECIPIENT_EMAIL } from '@/features/home/config';
import type { ContactFormValues } from '../types/contact.schema';

export function buildMailto({ name, email, message }: ContactFormValues): string {
  const subject = `Portfolio inquiry from ${name}`;
  const body = `${message}\n\n— ${name}\n${email}`;
  return `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
