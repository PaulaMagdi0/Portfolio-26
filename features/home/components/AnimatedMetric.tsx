'use client';

import { useEffect, useRef, useState } from 'react';

interface ParsedMetric {
  prefix: string;
  number: number | null;
  suffix: string;
}

function parseMetric(v: string): ParsedMetric {
  const match = v.match(/^([^\d−\-+]*)([−\-+]?\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { prefix: v, number: null, suffix: '' };
  const numStr = match[2]!.replace('−', '-');
  const num = Number.parseFloat(numStr);
  return {
    prefix: match[1]!,
    number: Number.isFinite(num) ? num : null,
    suffix: match[3]!,
  };
}

function formatMetric(p: ParsedMetric, current: number): string {
  if (p.number === null) return p.prefix;
  const isNegative = p.number < 0;
  const decimals = Math.abs(p.number) % 1 !== 0 ? 1 : 0;
  const displayed = Math.abs(current).toFixed(decimals);
  return `${p.prefix}${isNegative ? '−' : ''}${displayed}${p.suffix}`;
}

interface AnimatedMetricProps {
  value: string;
  durationMs?: number;
}

export function AnimatedMetric({ value, durationMs = 1600 }: AnimatedMetricProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const parsed = parseMetric(value);
  const [text, setText] = useState(parsed.number === null ? value : formatMetric(parsed, 0));

  useEffect(() => {
    if (parsed.number === null) {
      requestAnimationFrame(() => setText(value));
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      requestAnimationFrame(() => setText(formatMetric(parsed, parsed.number!)));
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
          setText(formatMetric(parsed, current));
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

  return <span ref={ref}>{text}</span>;
}
