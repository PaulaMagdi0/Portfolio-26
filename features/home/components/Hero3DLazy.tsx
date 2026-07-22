'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Hero3D = dynamic(() => import('@/features/hero-3d').then((m) => m.Hero3D), {
  ssr: false,
  loading: () => null,
});

/**
 * The 3D scene is only visible on lg+ screens (its wrapper is `hidden lg:block`).
 * Gate the mount on a matching media query so the Three.js bundle (~200KB) is
 * never downloaded on phones/tablets, where it would be dead weight behind
 * `display:none` and inflate the mobile LCP. The wrapper has fixed dimensions,
 * so mounting/unmounting causes no layout shift.
 */
export function Hero3DLazy() {
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setCanShow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (!canShow) return null;
  return <Hero3D />;
}
