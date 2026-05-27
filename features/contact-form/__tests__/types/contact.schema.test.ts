import { describe, it, expect } from 'vitest';
import { buildContactSchema } from '@/features/contact-form';

const t = (key: string) => key;

describe('contact schema', () => {
  const schema = buildContactSchema(t);

  it('accepts valid input', () => {
    const result = schema.safeParse({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello this is at least ten characters long.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = schema.safeParse({ name: '', email: 'a@b.co', message: 'aaaaaaaaaa' });
    expect(result.success).toBe(false);
  });

  it('rejects bad email', () => {
    const result = schema.safeParse({ name: 'Jane', email: 'not-an-email', message: 'aaaaaaaaaa' });
    expect(result.success).toBe(false);
  });

  it('rejects short message', () => {
    const result = schema.safeParse({ name: 'Jane', email: 'a@b.co', message: 'short' });
    expect(result.success).toBe(false);
  });
});
