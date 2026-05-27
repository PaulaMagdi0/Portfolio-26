const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Convert ASCII digits (0-9) in a string to locale-appropriate digits.
 * - `en` (or any other locale): returns the string unchanged.
 * - `ar`: maps 0-9 → ٠-٩ (Arabic-Indic).
 *
 * Non-digit characters (punctuation, units, letters) pass through untouched.
 */
export function toLocaleDigits(value: string | number, locale: string): string {
  const str = String(value);
  if (locale !== 'ar') return str;
  return str.replace(/[0-9]/g, (d) => ARABIC_INDIC_DIGITS[Number(d)] ?? d);
}
