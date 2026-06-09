import { describe, it, expect } from 'vitest';
import { buildHomeMarkdown } from '@/features/home/utils/buildHomeMarkdown';

describe('buildHomeMarkdown', () => {
  const en = buildHomeMarkdown('en');

  it('opens with the identity heading and role', () => {
    expect(en.startsWith('# Paula Magdy')).toBe(true);
    expect(en).toContain('Full-Stack Software Engineer');
    expect(en).toContain('Cairo, EG');
    expect(en).toContain('/en');
  });

  it('renders work projects with case study, metrics, and stack', () => {
    expect(en).toContain('## SELECTED WORK');
    expect(en).toContain('### Make it in the Emirates — Awards Platform');
    expect(en).toContain('https://awards.miite.ae/en');
    expect(en).toContain('2,000+ concurrent users');
    expect(en).toContain('NestJS');
  });

  it('renders experience, education, and certifications with credential IDs', () => {
    expect(en).toContain('## EXPERIENCE');
    expect(en).toContain('October 6 University');
    expect(en).toContain('## CERTIFICATIONS');
    expect(en).toContain('HWENDCTEDA542672');
  });

  it('renders the full FAQ Q&A and contact links', () => {
    expect(en).toContain('Who is Paula Magdy?');
    expect(en).toContain('full-stack software engineer based in Cairo');
    expect(en).toContain('paulamagdy665@gmail.com');
    expect(en).toContain('https://github.com/PaulaMagdi0');
  });

  it('resolves every translation key (no leftover keys or undefined values)', () => {
    expect(en).not.toContain('undefined');
    expect(en).not.toMatch(/home\.[a-z]/);
  });

  it('is locale-aware', () => {
    const ar = buildHomeMarkdown('ar');
    expect(ar).toContain('بولا مجدي');
    expect(ar).not.toBe(en);
    expect(ar).toContain('/ar');
  });
});
