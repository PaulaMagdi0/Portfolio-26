import {
  Cairo,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
  Noto_Naskh_Arabic,
} from 'next/font/google';

export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  // Only the LCP headline serif is preloaded — it renders the hero <h1>, the
  // largest contentful paint. Body/label/Arabic fonts stay preload:false to
  // avoid "preloaded but not used" warnings.
  preload: true,
  variable: '--font-instrument-serif',
});

export const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
  // Only the LCP serif headline font is preloaded; body/label fonts load via
  // @font-face with `display: swap`, avoiding "preloaded but not used" warnings.
  preload: false,
  variable: '--font-inter',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  variable: '--font-jetbrains-mono',
});

export const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  display: 'swap',
  preload: false,
  variable: '--font-arabic-sans',
});

export const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-arabic-serif',
});
