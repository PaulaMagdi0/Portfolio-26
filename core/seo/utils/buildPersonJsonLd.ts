import { type Locale } from '@/i18n/config';
import { PERSON_JSON_LD } from '../config/person.config';
import { LAST_UPDATED, SITE_NAME, SITE_URL } from '../config/site.config';

/**
 * Build the per-locale home-page JSON-LD: a schema.org @graph pairing a
 * ProfilePage (Google's recommended type for a page about one person) with the
 * Person node. The ProfilePage is locale-scoped — its `url`, `@id`, and
 * `inLanguage` reflect the locale actually being served — while the Person is a
 * single locale-independent entity (`#person`) that both locales point at, so AI
 * answer engines resolve one canonical person. `dateModified` is a truthful
 * freshness signal.
 *
 * The output is HTML-escaped (`<` → `<`) before it lands in
 * dangerouslySetInnerHTML, so a future field containing `</script>` can never
 * break out of the tag or open an injection path. The escape stays valid JSON.
 */
export function buildPersonJsonLd(locale: Locale): string {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${SITE_URL}/${locale}/#profilepage`,
        url: `${SITE_URL}/${locale}`,
        name: `${SITE_NAME} — Full-Stack Software Engineer`,
        inLanguage: locale,
        dateModified: LAST_UPDATED,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: { '@id': `${SITE_URL}/#person` },
      },
      {
        // Site-level entity: anchors the domain as a thing and names the Person
        // as its publisher, strengthening how answer engines model the site.
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: locale,
        publisher: { '@id': `${SITE_URL}/#person` },
      },
      PERSON_JSON_LD,
    ],
  };
  return JSON.stringify(graph).replace(/</g, '\\u003c');
}
