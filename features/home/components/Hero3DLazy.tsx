'use client';

import dynamic from 'next/dynamic';

const Hero3D = dynamic(() => import('@/features/hero-3d').then((m) => m.Hero3D), {
  ssr: false,
  loading: () => null,
});

export function Hero3DLazy() {
  return <Hero3D />;
}
