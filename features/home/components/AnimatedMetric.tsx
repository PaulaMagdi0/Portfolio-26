'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { toLocaleDigits } from '@/lib/digits';

interface ParsedMetric {
  prefix: string;
  number: number | null;
  suffix: string;
  /** The source value used thousands separators ("5,000+"), so the counter keeps them. */
  grouped: boolean;
}

const STATIC: Omit<ParsedMetric, 'prefix'> = { number: null, suffix: '', grouped: false };

function parseMetric(v: string): ParsedMetric {
  // Comparator values ("<5 min", ">99%") must not count up from zero: every
  // intermediate frame ("<0 min", "<3 min") would be a false claim. Render static.
  if (/^\s*[<>~≈]/.test(v)) return { prefix: v, ...STATIC };
  const match = v.match(/^([^\d−\-+]*)([−\-+]?\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return { prefix: v, ...STATIC };
  const raw = match[2]!;
  const num = Number.parseFloat(raw.replace('−', '-').replace(/,/g, ''));
  return {
    prefix: match[1]!,
    number: Number.isFinite(num) ? num : null,
    suffix: match[3]!,
    grouped: raw.includes(','),
  };
}

function formatMetric(p: ParsedMetric, current: number): string {
  if (p.number === null) return p.prefix;
  const isNegative = p.number < 0;
  const abs = Math.abs(current);
  let displayed: string;
  if (p.grouped) {
    displayed = Math.round(abs).toLocaleString('en-US');
  } else {
    const decimals = Math.abs(p.number) % 1 !== 0 ? 1 : 0;
    displayed = abs.toFixed(decimals);
  }
  return `${p.prefix}${isNegative ? '−' : ''}${displayed}${p.suffix}`;
}

interface AnimatedMetricProps {
  value: string;
  durationMs?: number;
}

export function AnimatedMetric({ value, durationMs = 1600 }: AnimatedMetricProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const locale = useLocale();
  const parsed = parseMetric(value);
  const [text, setText] = useState(parsed.number === null ? value : formatMetric(parsed, 0));

  useEffect(() => {
    if (parsed.number === null) {
      requestAnimationFrame(() => setText(toLocaleDigits(value, locale)));
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      requestAnimationFrame(() =>
        setText(toLocaleDigits(formatMetric(parsed, parsed.number!), locale)),
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        let rafId = 0;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - t, 3);
          const current = parsed.number! * eased;
          setText(toLocaleDigits(formatMetric(parsed, current), locale));
          if (t < 1) rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
      },
      { threshold: 0.5 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [durationMs, parsed.number, value]); // eslint-disable-line react-hooks/exhaustive-deps

  // dir="ltr": in the RTL locale a leading "<" is a mirrored character and would
  // render as ">" (inverting "<5 min" into "more than 5 min"). Isolate the value.
  return (
    <span ref={ref} dir="ltr">
      {text}
    </span>
  );
}
