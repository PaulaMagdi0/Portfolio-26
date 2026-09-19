import { existsSync } from 'node:fs';
import { join as joinPath } from 'node:path';
import { describe, it, expect } from 'vitest';
import { WORK } from '@/features/home/config/work.config';
import en from '@/features/home/translations/en/pages.json';
import ar from '@/features/home/translations/ar/pages.json';

// The Work section describes client work for government and enterprise customers.
// Product names, screenshots, and live links are published deliberately (restored
// 2026-09-19), but the copy must still present Paula as a member of the engineering
// team and cite only numbers the Experience section corroborates. next-intl
// serialises the whole message dictionary into the prerendered HTML, so these checks
// run over the translation files themselves, not just the rendered components.

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

// Phrases that claim sole ownership of team work.
const EN_FORBIDDEN =
  /end[- ]to[- ]end|\bowned\b|\bownership\b|\bsole\b|\bI led\b|\bled the\b|single-handed/i;
const AR_FORBIDDEN = /الألف إلى الياء|ملكية|قيادة|قائد|قدتُ|بالكامل/;

// Public URLs live in the config's `url` field; prose never carries a raw link.
const RAW_URL = /https?:\/\//;

// Delivered independently (per the résumé): the cards allowed to omit team framing.
const SOLO_PROJECTS = new Set(['altanfeethi', 'whatsapp-bot']);

// Metrics that were deliberately dropped because nothing on the current site
// corroborates them. Only ~35% and the ~20 min → <5 deploy figure are sanctioned.
const DROPPED_METRICS = /\b(25|30|40|50|60|80)\s?%|(٢٥|٣٠|٤٠|٥٠|٦٠|٨٠)\s?٪/;

// Top-level `home.work.*` entries that are not project cards.
const SHARED_KEYS = new Set([
  'label',
  'intro1',
  'introEmph',
  'ariaCaseStudy',
  'visit',
  'screenshotAlt',
  'caseStudy',
  'highlight',
  'kind',
]);
const SHARED_STRING_KEYS = [
  'home.work.label',
  'home.work.intro1',
  'home.work.introEmph',
  'home.work.ariaCaseStudy',
  'home.work.visit',
  'home.work.screenshotAlt',
  'home.work.kind.live',
  'home.work.kind.private',
];

describe('WORK config policy', () => {
  it('has at least one project, each with a unique neutral slug', () => {
    expect(WORK.length).toBeGreaterThan(0);
    const ids = WORK.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
  });

  it('links out only from live products, over https, and never from prose fields', () => {
    for (const project of WORK) {
      if (project.kind === 'live') {
        expect(project.url, project.id).toMatch(/^https:\/\/[^\s]+$/);
      } else {
        expect(project.url, project.id).toBeUndefined();
      }
      for (const value of [
        project.id,
        ...project.stack,
        ...project.highlights.map((h) => h.value),
      ]) {
        expect(value).not.toMatch(RAW_URL);
      }
    }
  });

  it('points every card at a WebP screenshot that exists under public/', () => {
    for (const project of WORK) {
      expect(project.image, project.id).toMatch(/^\/work\/[a-z0-9-]+\.webp$/);
      expect(existsSync(joinPath(process.cwd(), 'public', project.image)), project.image).toBe(
        true,
      );
    }
  });

  it('resolves every translation key in both locales', () => {
    for (const [locale, messages] of Object.entries(LOCALES)) {
      for (const key of SHARED_STRING_KEYS) {
        expect(resolve(messages, key), `${locale}: ${key}`).toBeTruthy();
      }
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
    for (const [locale, messages] of Object.entries(LOCALES)) {
      for (const key of Object.keys(messages.work)) {
        if (SHARED_KEYS.has(key)) continue;
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
  it('English work copy contains no ownership claims, raw links, or dropped metrics', () => {
    for (const text of flatten(en.work)) {
      expect(text, text).not.toMatch(EN_FORBIDDEN);
      expect(text, text).not.toMatch(RAW_URL);
      expect(text, text).not.toMatch(DROPPED_METRICS);
    }
  });

  it('Arabic work copy contains no ownership claims, raw links, or dropped metrics', () => {
    for (const text of flatten(ar.work)) {
      expect(text, text).not.toMatch(AR_FORBIDDEN);
      expect(text, text).not.toMatch(RAW_URL);
      expect(text, text).not.toMatch(DROPPED_METRICS);
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

  it('keeps the {name} placeholder in the screenshot alt template', () => {
    for (const [locale, messages] of Object.entries(LOCALES)) {
      expect(messages.work.screenshotAlt, locale).toContain('{name}');
    }
  });
});
