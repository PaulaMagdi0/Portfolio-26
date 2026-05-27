import type { ReactNode } from 'react';

interface MetaCellProps {
  label: string;
  value: ReactNode;
}

export function MetaCell({ label, value }: MetaCellProps) {
  return (
    <div className="border-t border-line pt-3">
      <span className="section-num mb-1 block">{label}</span>
      <span className="font-serif text-lg text-ink">{value}</span>
    </div>
  );
}
