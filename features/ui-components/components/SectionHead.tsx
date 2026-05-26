import type { ReactNode } from 'react';

interface SectionHeadProps {
  num: string;
  label: string;
  kicker?: ReactNode;
  children?: ReactNode;
}

export function SectionHead({ num, label, kicker, children }: SectionHeadProps) {
  return (
    <header className="mb-10 md:mb-14">
      <div className="mb-3 flex items-center gap-4">
        <span className="section-num">{num}</span>
        <span className="h-rule" />
        <span className="section-num">{label}</span>
      </div>
      {kicker ? <div className="mt-2">{kicker}</div> : null}
      {children}
    </header>
  );
}
