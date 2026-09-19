import { describe, it, expect } from 'vitest';
import { CERTIFICATIONS } from '@/features/home/config/certifications.config';
import { PERSON_JSON_LD } from '@/core/seo/config/person.config';
import en from '@/features/home/translations/en/pages.json';
import ar from '@/features/home/translations/ar/pages.json';

type Messages = typeof en;

function resolve(messages: Messages, key: string): string | undefined {
  const segments = key.replace(/^home\./, '').split('.');
  let current: unknown = messages;
  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

const LOCALES: Record<string, Messages> = { en, ar: ar as Messages };

describe('CERTIFICATIONS config', () => {
  it('gives every certification a unique public https verification link', () => {
    const urls = CERTIFICATIONS.map((c) => c.verifyUrl);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\/(www\.credly\.com|drive\.google\.com)\/[^\s]+$/);
    }
  });

  it('resolves every translation key in both locales', () => {
    for (const [locale, messages] of Object.entries(LOCALES)) {
      expect(resolve(messages, 'home.certs.verify'), `${locale}: verify`).toBeTruthy();
      for (const cert of CERTIFICATIONS) {
        for (const key of [
          cert.nameKey,
          cert.issuerKey,
          cert.descKey,
          `home.certs.${cert.id}.issued`,
          `home.certs.${cert.id}.expires`,
        ]) {
          expect(resolve(messages, key), `${locale}: ${key}`).toBeTruthy();
        }
      }
    }
  });

  it('keeps the JSON-LD credentials in sync with the page (name and verification URL)', () => {
    const jsonLd = new Map<string, string>(
      PERSON_JSON_LD.hasCredential.map((c) => [c.url, c.name]),
    );
    expect(jsonLd.size).toBe(CERTIFICATIONS.length);
    for (const cert of CERTIFICATIONS) {
      const name = resolve(en, cert.nameKey);
      expect(jsonLd.get(cert.verifyUrl), cert.id).toBe(name);
    }
  });
});
