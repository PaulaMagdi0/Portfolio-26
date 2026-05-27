import { getTranslations } from 'next-intl/server';

export async function SkipLink() {
  const t = await getTranslations('ui.a11y');
  return (
    <a href="#main" className="skip-link">
      {t('skipToContent')}
    </a>
  );
}
