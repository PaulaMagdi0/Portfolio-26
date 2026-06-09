import type { gsap as GsapNamespace } from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';
import type { SplitText as SplitTextType } from 'gsap/SplitText';

// Type-only re-exports so callers can keep annotating with the gsap types
// without pulling the runtime bundle into First Load.
export type Gsap = typeof GsapNamespace;
export type ScrollTrigger = typeof ScrollTriggerType;
export type SplitText = typeof SplitTextType;

export interface GsapBundle {
  gsap: typeof GsapNamespace;
  ScrollTrigger: typeof ScrollTriggerType;
  SplitText: typeof SplitTextType;
}

let bundlePromise: Promise<GsapBundle> | null = null;

/**
 * Lazily load GSAP + ScrollTrigger + SplitText via dynamic import and register
 * the plugins exactly once. Kept off the synchronous module graph so the ~160KB
 * motion stack never lands in the home route's First Load JS — callers await
 * this inside an effect (after hydration / idle / first scroll). The import is
 * memoised, so concurrent callers share a single network/parse cost.
 */
export function loadGsap(): Promise<GsapBundle> {
  if (typeof window === 'undefined') {
    // SSR guard — animations are client-only; never resolve on the server.
    return new Promise<GsapBundle>(() => {});
  }
  if (!bundlePromise) {
    bundlePromise = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('gsap/SplitText'),
    ]).then(([gsapMod, stMod, splitMod]) => {
      const gsap = gsapMod.gsap ?? gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;
      const SplitText = splitMod.SplitText ?? splitMod.default;
      try {
        gsap.registerPlugin(ScrollTrigger, SplitText);
      } catch (err) {
        console.warn('[gsap] plugin registration failed', err);
      }
      return { gsap, ScrollTrigger, SplitText };
    });
  }
  return bundlePromise;
}

/**
 * Run `cb` on the next idle slot (or shortly after, where requestIdleCallback
 * is unavailable). Returns a cancel function. Used to defer non-critical motion
 * work off the hydration/LCP path without dropping it entirely.
 */
export function onIdle(cb: () => void, timeout = 2000): () => void {
  if (typeof window === 'undefined') return () => {};
  const ric = (
    window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    }
  ).requestIdleCallback;
  if (typeof ric === 'function') {
    const id = ric(cb, { timeout });
    return () => {
      (
        window as typeof window & { cancelIdleCallback?: (id: number) => void }
      ).cancelIdleCallback?.(id);
    };
  }
  const t = window.setTimeout(cb, 200);
  return () => window.clearTimeout(t);
}
