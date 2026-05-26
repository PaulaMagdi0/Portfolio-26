'use client';

import { useRef, type ElementType, type MouseEvent, type ReactNode } from 'react';

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: ElementType;
}

export function Magnetic({
  children,
  className = '',
  strength = 0.25,
  as: Component = 'button',
}: MagneticProps) {
  const ref = useRef<HTMLElement | null>(null);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const y = (e.clientY - (rect.top + rect.height / 2)) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = '';
  };

  return (
    <Component
      ref={ref as never}
      data-magnetic
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
    >
      {children}
    </Component>
  );
}
