import type { ReactNode } from 'react';

interface MetaCellProps {
  label: string;
  value: ReactNode;
}

export function MetaCell({ label, value }: MetaCellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-inkmute font-mono text-[10px] tracking-[0.18em] uppercase">
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
