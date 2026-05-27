import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/features/ui-components';
import { MetaCell } from './MetaCell';

export async function HeroMetaStrip() {
  const t = await getTranslations('home.metaStrip');

  return (
    <section aria-label={t('label')} className="border-line border-y px-6 py-8 md:px-10 md:py-10">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-x-10">
            <li>
              <MetaCell label={t('locationLabel')} value={t('locationValue')} />
            </li>
            <li>
              <MetaCell label={t('yearsLabel')} value={t('yearsValue')} />
            </li>
            <li>
              <MetaCell label={t('currentlyLabel')} value={t('currentlyValue')} />
            </li>
            <li>
              <MetaCell label={t('focusLabel')} value={t('focusValue')} />
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
