import { SITE_URL } from '@/core/seo/config/site.config';
import type { Locale } from '@/i18n/config';
import enPages from '../translations/en/pages.json';
import arPages from '../translations/ar/pages.json';
// import { WORK } from '../config/work.config'; // see the disabled work block below
import { EXPERIENCE } from '../config/experience.config';
import { CERTIFICATIONS } from '../config/certifications.config';
import { STACK } from '../config/stack.config';
import { FAQ_ITEMS } from '../config/faq.config';
import { SOCIALS, RECIPIENT_EMAIL } from '../config/socials.config';

// Faithful Markdown rendering of the home page, served via content negotiation
// (Accept: text/markdown) from `middleware.ts`. Content is resolved entirely from
// the same translations + config the React page uses, so it cannot drift from the
// rendered site. Edge-safe: imports only JSON + type-only config, never components.

type Messages = typeof enPages;

const MESSAGES: Record<Locale, Messages> = {
  en: enPages,
  ar: arPages as Messages,
};

/** Resolve a `home.*` translation key (as used by config files) against a locale's messages. */
function resolve(messages: Messages, key: string): string {
  const segments = key.replace(/^home\./, '').split('.');
  let current: unknown = messages;
  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return '';
    }
  }
  return typeof current === 'string' ? current : '';
}

// Used only by the disabled work block below.
// /** Split a "·"-separated contributions string into individual bullet lines. */
// function toBullets(text: string): string[] {
//   return text
//     .split(/\s*·\s*/)
//     .map((item) => item.trim())
//     .filter(Boolean);
// }

function join(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(' · ');
}

export function buildHomeMarkdown(locale: Locale): string {
  const m = MESSAGES[locale] ?? MESSAGES.en;
  const t = (key: string) => resolve(m, key);
  const blocks: string[] = [];

  // --- Identity ---
  blocks.push(
    [
      `# ${m.hero.headline}`,
      `> ${join(m.hero.kicker, m.metaStrip.locationValue)}`,
      '',
      `${m.hero.descriptionLead} ${m.hero.descriptionEmph}`,
      '',
      `- **Status:** ${m.hero.availability}`,
      `- **Based in:** ${m.metaStrip.locationValue}`,
      `- **Experience:** ${m.metaStrip.yearsValue} ${m.metaStrip.yearsLabel.toLowerCase()}`,
      `- **Open to:** ${m.metaStrip.currentlyValue}`,
      `- **Canonical:** ${SITE_URL}/${locale}`,
    ].join('\n'),
  );

  // --- Selected work (disabled) ---
  // The Work section is commented out of app/[locale]/page.tsx and the résumé no
  // longer lists named client projects, so this Markdown mirror omits it too —
  // otherwise agents would still be told Paula solely owned platforms the résumé
  // now frames as cross-functional team delivery. Restore alongside <Work />.
  /*
  const work = WORK.map((p) => {
    const lines = [
      `### ${t(p.nameKey)}`,
      join(t(p.companyKey), t(p.periodKey), t(p.badgeKey), p.url),
      '',
      `> ${t(p.blurbKey)}`,
      '',
      `- **${m.work.caseStudy.role}:** ${t(p.caseStudy.roleKey)}`,
      `- **${m.work.caseStudy.problem}:** ${t(p.caseStudy.problemKey)}`,
      `- **${m.work.caseStudy.architecture}:** ${t(p.caseStudy.architectureKey)}`,
    ];
    const contributions = toBullets(t(p.caseStudy.contributionsKey));
    if (contributions.length) {
      lines.push(`- **${m.work.caseStudy.contributions}:**`);
      lines.push(...contributions.map((c) => `  - ${c}`));
    }
    if (p.metrics.length) {
      const metrics = p.metrics
        .map((metric) => `${metric.value} ${t(metric.labelKey)}`)
        .join(' · ');
      lines.push(`- **Metrics:** ${metrics}`);
    }
    if (p.stack.length) {
      lines.push(`- **${m.work.caseStudy.stack}:** ${p.stack.join(', ')}`);
    }
    return lines.join('\n');
  }).join('\n\n');
  blocks.push(`## ${m.work.label}\n\n${work}`);
  */

  // --- Experience ---
  const experience = EXPERIENCE.map((role) => {
    const header = `### ${join(t(role.roleKey), t(role.companyKey))}`;
    const meta = join(t(role.periodKey), t(role.locationKey));
    const bullets = role.bulletKeys.map((key) => `- ${t(key)}`).join('\n');
    return [header, meta, '', bullets].join('\n');
  }).join('\n\n');
  blocks.push(`## ${m.experience.label}\n\n${experience}`);

  // --- Education ---
  blocks.push(
    [
      `## ${m.education.label}`,
      '',
      `### ${join(`${m.education.degree1} ${m.education.degree2}`, m.education.school)}`,
      join(m.education.period, m.education.location),
      '',
      `- **${m.education.courseworkLabel}:** ${m.education.coursework}`,
      `- **${m.education.gradLabel}:** ${m.education.gradProject} (${m.education.grade}) — ${m.education.gradStack}`,
    ].join('\n'),
  );

  // --- Certifications ---
  const certs = CERTIFICATIONS.map((cert) => {
    return [
      `### ${join(t(cert.nameKey), t(cert.issuerKey))}`,
      join(
        `Issued ${cert.issued}`,
        `Expires ${cert.expires}`,
        `${m.certs.credId}: ${cert.credentialId}`,
      ),
      '',
      t(cert.descKey),
      '',
      `Skills: ${cert.skills.join(', ')}`,
    ].join('\n');
  }).join('\n\n');
  blocks.push(`## ${m.certs.label}\n\n${certs}`);

  // --- Stack ---
  const stack = STACK.map((group) => `- **${t(group.titleKey)}:** ${group.items.join(', ')}`).join(
    '\n',
  );
  blocks.push(`## ${m.stack.label}\n\n${stack}`);

  // --- FAQ ---
  const faq = FAQ_ITEMS.map((item) => `**${t(item.questionKey)}**\n\n${t(item.answerKey)}`).join(
    '\n\n',
  );
  blocks.push(`## ${m.faq.label}\n\n${faq}`);

  // --- Contact ---
  const links = SOCIALS.map((social) => `- ${t(social.labelKey)}: ${social.url}`).join('\n');
  blocks.push(
    [
      `## ${m.contact.label}`,
      '',
      `- **${m.contact.email}:** ${RECIPIENT_EMAIL}`,
      `- **${m.contact.phone}:** ${m.contact.phoneValue}`,
      '',
      `### ${m.contact.elsewhere}`,
      links,
      '',
      `---`,
      m.contact.footerBuilt,
    ].join('\n'),
  );

  return `${blocks.join('\n\n')}\n`;
}
