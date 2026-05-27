import { ImageResponse } from 'next/og';
import type { Locale } from '@/i18n/config';
import { SUPPORTED_LOCALES, isLocale } from '@/i18n/config';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export const alt = 'Paula Magdy — Software Engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface ImageProps {
  params: Promise<{ locale: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : 'en';

  const isArabic = safeLocale === 'ar';
  const title = isArabic ? 'Paula Magdy' : 'Paula Magdy';
  const subtitle = isArabic ? 'Software Engineer · Cairo' : 'Software Engineer · Cairo';
  const label = 'Portfolio · 2026';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0a0a0a',
        color: '#ededed',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '80px',
        fontFamily: 'serif',
        backgroundImage:
          'radial-gradient(120% 80% at 50% -10%, rgba(212, 165, 116, 0.15), transparent 60%)',
      }}
    >
      <div
        style={{
          fontSize: 32,
          color: '#d4a574',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          marginBottom: 24,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 128,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          display: 'flex',
          alignItems: 'baseline',
        }}
      >
        <span>{title}</span>
        <span style={{ color: '#d4a574' }}>.</span>
      </div>
      <div
        style={{
          marginTop: 24,
          fontSize: 36,
          color: '#a3a3a3',
          fontStyle: 'italic',
        }}
      >
        {subtitle}
      </div>
    </div>,
    size,
  );
}
