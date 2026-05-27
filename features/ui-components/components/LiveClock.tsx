'use client';

import { useEffect, useState } from 'react';

function formatCairoTime(): string {
  const t = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
  return `${t} CAI`;
}

export function LiveClock() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => setTime(formatCairoTime());
    const id = setInterval(update, 1000);
    const raf = requestAnimationFrame(update);
    return () => {
      clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <span suppressHydrationWarning>{time}</span>;
}
