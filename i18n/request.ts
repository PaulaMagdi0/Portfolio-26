import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const [home, ui, contact, locales] = await Promise.all([
    import(`../features/home/translations/${locale}/pages.json`),
    import(`../features/ui-components/translations/${locale}/ui.json`),
    import(`../features/contact-form/translations/${locale}/contact.json`),
    import(`../features/localization/translations/${locale}/locale.json`),
  ]);

  return {
    locale,
    messages: {
      home: home.default,
      ui: ui.default,
      contact: contact.default,
      locale: locales.default,
    },
  };
});
