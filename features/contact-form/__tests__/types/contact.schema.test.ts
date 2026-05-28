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

  it('rejects name containing CRLF (header injection guard)', () => {
    const result = schema.safeParse({
      name: 'Jane\nBcc: attacker@x.com',
      email: 'a@b.co',
      message: 'aaaaaaaaaa',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name containing carriage return', () => {
    const result = schema.safeParse({
      name: 'Jane\rDoe',
      email: 'a@b.co',
      message: 'aaaaaaaaaa',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional botcheck honeypot when filled', () => {
    const result = schema.safeParse({
      name: 'Jane',
      email: 'a@b.co',
      message: 'aaaaaaaaaa',
      botcheck: 'bot filled this',
    });
    expect(result.success).toBe(true);
  });

  it('accepts name at exactly 80 characters', () => {
    const result = schema.safeParse({
      name: 'a'.repeat(80),
      email: 'a@b.co',
      message: 'aaaaaaaaaa',
    });
    expect(result.success).toBe(true);
  });

  it('rejects name longer than 80 characters', () => {
    const result = schema.safeParse({
      name: 'a'.repeat(81),
      email: 'a@b.co',
      message: 'aaaaaaaaaa',
    });
    expect(result.success).toBe(false);
  });

  it('accepts message at exactly 10 characters', () => {
    const result = schema.safeParse({
      name: 'Jane',
      email: 'a@b.co',
      message: 'a'.repeat(10),
    });
    expect(result.success).toBe(true);
  });

  it('accepts message at exactly 2000 characters', () => {
    const result = schema.safeParse({
      name: 'Jane',
      email: 'a@b.co',
      message: 'a'.repeat(2000),
    });
    expect(result.success).toBe(true);
  });

  it('rejects message longer than 2000 characters', () => {
    const result = schema.safeParse({
      name: 'Jane',
      email: 'a@b.co',
      message: 'a'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});
