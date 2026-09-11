import { describe, it, expect } from 'vitest';
import { WORK } from '@/features/home/config/work.config';
import en from '@/features/home/translations/en/pages.json';
import ar from '@/features/home/translations/ar/pages.json';

// The Work section describes client work for government and enterprise customers.
// Client, ministry, programme, and internal product names must never ship, and the
// copy must present Paula as a member of the engineering team. next-intl serialises
// the whole message dictionary into the prerendered HTML, so these checks run over
// the translation files themselves, not just the rendered components.

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

function flatten(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(flatten);
  return [];
}

const LOCALES: Record<string, Messages> = { en, ar: ar as Messages };

// Phrases that claim sole ownership or leak identifying detail.
const EN_FORBIDDEN =
  /end[- ]to[- ]end|\bowned\b|\bownership\b|\bsole\b|\bI led\b|\bled the\b|single-handed|ministry|https?:\/\/|\.gov\b|\.ae\b|\.eg\b/i;
const AR_FORBIDDEN = /الألف إلى الياء|ملكية|قيادة|قائد|قدتُ|وزارة|بالكامل|https?:\/\//;

// Delivered independently (per the résumé): the one card allowed to omit team framing.
const SOLO_PROJECTS = new Set(['azure-delivery']);

// Metrics that were deliberately dropped because nothing on the current site
// corroborates them. Only ~35% and the ~20 min → <5 deploy figure are sanctioned.
const DROPPED_METRICS = /\b(25|30|40|50|60|80)\s?%|(٢٥|٣٠|٤٠|٥٠|٦٠|٨٠)\s?٪/;

// The names removed from the previously published copy, base64-encoded so this
// public repo's working tree does not carry them in plain text. Decoded at test time.
const decode = (b64: string) => Buffer.from(b64, 'base64').toString('utf8').toLowerCase();
const REMOVED_NAMES = [
  'bWlpdGU=',
  'bGF3bWF0ZQ==',
  'c2FiZWVs',
  'ZWx0YW5mZWV0aGk=',
  'bW9pYXQ=',
  'ZW1pcmF0ZXM=',
  'c2Nob29scyBsZWFndWU=',
  'bW9lLmdvdg==',
  '2KfYtdmG2Lkg2YHZiiDYp9mE2KXZhdin2LHYp9iq',
  '2KfZhNil2YXYp9ix2KfYqg==',
  '2KfZhNiq2YbZgdmK2KrZig==',
  '2KfZhNiv2YjYsdmKINin2YTZhdi12LHZig==',
].map(decode);

describe('WORK config policy', () => {
  it('lists only private case studies with no live links or screenshots', () => {
    expect(WORK.length).toBeGreaterThan(0);
    for (const project of WORK) {
      expect(project.kind).toBe('private');
      expect(project.url).toBeUndefined();
      expect(project.image).toBeUndefined();
    }
  });

  it('uses neutral ids (rendered on the card) with no client or product names', () => {
    for (const project of WORK) {
      expect(project.id).toMatch(/^[a-z-]+$/);
      for (const name of REMOVED_NAMES) expect(project.id).not.toContain(name);
    }
  });

  it('resolves every translation key in both locales', () => {
    for (const [locale, messages] of Object.entries(LOCALES)) {
      for (const project of WORK) {
        const keys = [
          project.nameKey,
          project.companyKey,
          project.periodKey,
          project.blurbKey,
          project.badgeKey,
          project.caseStudy.roleKey,
          project.caseStudy.overviewKey,
          project.caseStudy.systemKey,
          project.caseStudy.contributionsKey,
          ...project.highlights.map((h) => h.labelKey),
        ];
        for (const key of keys) {
          expect(resolve(messages, key), `${locale}: ${key}`).toBeTruthy();
        }
      }
    }
  });

  it('has no orphaned project or highlight entries in either locale', () => {
    const used = new Set(WORK.flatMap((p) => p.highlights.map((h) => h.labelKey)));
    const shared = new Set([
      'label',
      'intro1',
      'introEmph',
      'ariaVisit',
      'ariaCaseStudy',
      'caseStudy',
      'highlight',
    ]);
    for (const [locale, messages] of Object.entries(LOCALES)) {
      for (const key of Object.keys(messages.work)) {
        if (shared.has(key)) continue;
        const referenced = WORK.some((p) => p.nameKey === `home.work.${key}.name`);
        expect(referenced, `${locale}: orphaned home.work.${key}`).toBe(true);
      }
      for (const key of Object.keys(messages.work.highlight)) {
        expect(used.has(`home.work.highlight.${key}`), `${locale}: orphaned highlight ${key}`).toBe(
          true,
        );
      }
    }
  });
});

describe('Work copy policy', () => {
  it('English work copy contains no ownership claims, client identifiers, or links', () => {
    for (const text of flatten(en.work)) {
      expect(text, text).not.toMatch(EN_FORBIDDEN);
      expect(text, text).not.toMatch(DROPPED_METRICS);
      for (const name of REMOVED_NAMES) expect(text.toLowerCase(), text).not.toContain(name);
    }
  });

  it('Arabic work copy contains no ownership claims, client identifiers, or links', () => {
    for (const text of flatten(ar.work)) {
      expect(text, text).not.toMatch(AR_FORBIDDEN);
      expect(text, text).not.toMatch(DROPPED_METRICS);
      for (const name of REMOVED_NAMES) expect(text.toLowerCase(), text).not.toContain(name);
    }
  });

  it('frames every project as team work in both locales', () => {
    for (const project of WORK) {
      if (SOLO_PROJECTS.has(project.id)) continue;
      const enText = [
        project.blurbKey,
        project.caseStudy.roleKey,
        project.caseStudy.contributionsKey,
      ]
        .map((k) => resolve(en, k) ?? '')
        .join(' ');
      expect(enText, project.id).toMatch(/team/i);
      const arText = [
        project.blurbKey,
        project.caseStudy.roleKey,
        project.caseStudy.contributionsKey,
      ]
        .map((k) => resolve(ar as Messages, k) ?? '')
        .join(' ');
      expect(arText, project.id).toMatch(/فريق/);
    }
  });
});
