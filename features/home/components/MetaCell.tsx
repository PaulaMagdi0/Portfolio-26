import type { ReactNode } from 'react';

interface MetaCellProps {
  label: string;
  value: ReactNode;
}

export function MetaCell({ label, value }: MetaCellProps) {
  return (
    <div className="border-line border-t pt-3">
      <span className="section-num mb-1 block">{label}</span>
      <span className="text-ink font-serif text-lg">{value}</span>
    </div>
  );
}
