import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function NotFound() {
  const t = await getTranslations('ui.notFound');
  const tBrand = await getTranslations('ui.brand');

  return (
    <main className="vignette relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="grain" aria-hidden />

      <p className="text-amber relative z-10 font-mono text-[11px] tracking-[0.2em] uppercase">
        {t('eyebrow')}
      </p>

      <h1 className="text-ink relative z-10 mt-6 font-serif text-[28vw] leading-none md:text-[18vw] lg:text-[14vw]">
        404
      </h1>

      <p className="text-inkdim relative z-10 mt-6 max-w-[480px] text-[15px] leading-[1.55]">
        {t('description')}
      </p>

      <Link
        href="/"
        className="btn-base btn-primary relative z-10 mt-8 inline-flex items-center gap-2"
      >
        {t('cta')}
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>

      <p
        aria-hidden
        className="text-ink pointer-events-none absolute right-0 -bottom-20 left-0 text-center font-serif text-[28vw] leading-none tracking-tighter opacity-[0.04] select-none"
      >
        {tBrand('watermark')}
      </p>
    </main>
  );
}
