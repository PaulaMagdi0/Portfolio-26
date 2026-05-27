import { describe, it, expect } from 'vitest';
import { buildMailto } from '@/features/contact-form';

describe('buildMailto', () => {
  it('builds a mailto URL with URL-encoded subject and body', () => {
    const url = buildMailto({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Hello & world',
    });
    expect(url).toMatch(/^mailto:[^?]+\?/);
    expect(url).toContain(`subject=${encodeURIComponent('Portfolio inquiry from Jane Doe')}`);
    expect(url).toContain(encodeURIComponent('Hello & world'));
    expect(url).toContain(encodeURIComponent('jane@example.com'));
  });
});
