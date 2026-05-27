'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { useLenis } from '../hooks/useLenis';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useScrollVelocitySkew } from '../hooks/useScrollVelocitySkew';

interface MotionProviderProps {
  children: ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  const reduced = useReducedMotion();
  useLenis(!reduced);
  useScrollVelocitySkew(!reduced);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
