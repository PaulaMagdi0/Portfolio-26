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

  it('renders generic work projects with role, contribution bullets, highlights, and stack', () => {
    expect(en).toContain('## SELECTED WORK');
    expect(en).toContain('### Submission & Evaluation Platform');
    expect(en).toContain('### Legal Services Marketplace Platform');
    expect(en).toContain('- **MY ROLE:**');
    expect(en).toContain('- **MY CONTRIBUTION:**');
    expect(en).toContain('5,000+ concurrent users');
    expect(en).toContain('NestJS');
  });

  it('keeps the work section free of live links and ownership claims', () => {
    const work = en.slice(en.indexOf('## SELECTED WORK'), en.indexOf('## EXPERIENCE'));
    expect(work).not.toMatch(/https?:\/\//);
    expect(work).not.toMatch(/end-to-end|\bowned\b|\bled\b/i);
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
