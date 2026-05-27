'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface MaskRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * One-line text reveal: clips the inner span and slides it up from 110% to 0%
 * on mount. Uses plain CSS transitions to avoid framer-motion's hydration
 * edge cases where `animate` doesn't kick off the transition.
 */
export function MaskReveal({ children, delay = 0, className = '' }: MaskRevealProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <span className={`mask-line ${className}`}>
      <span
        className="mask-inner"
        style={{
          display: 'inline-block',
          transform: shown ? 'translateY(0%)' : 'translateY(110%)',
          transition: `transform 1100ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}s`,
          willChange: 'transform',
        }}
      >
        {children}
      </span>
    </span>
  );
}
