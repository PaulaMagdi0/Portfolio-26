'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef, type MouseEvent, type ReactNode } from 'react';

type MagneticTag = 'button' | 'a' | 'span' | 'div';

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: MagneticTag;
}

const SPRING = { stiffness: 200, damping: 18, mass: 0.4 };

const TAG_MAP = {
  button: motion.button,
  a: motion.a,
  span: motion.span,
  div: motion.div,
} as const;

export function Magnetic({
  children,
  className = '',
  strength = 0.25,
  as = 'button',
}: MagneticProps) {
  const ref = useRef<HTMLElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, SPRING);
  const sy = useSpring(my, SPRING);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    my.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const MotionComp = TAG_MAP[as];

  return (
    <MotionComp
      ref={ref as never}
      data-magnetic
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </MotionComp>
  );
}
