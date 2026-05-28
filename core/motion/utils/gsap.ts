import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  if (ScrollTrigger) {
    try {
      gsap.registerPlugin(ScrollTrigger);
    } catch (err) {
      console.warn('[gsap] ScrollTrigger registration failed', err);
    }
  }
  if (SplitText) {
    try {
      gsap.registerPlugin(SplitText);
    } catch (err) {
      console.warn('[gsap] SplitText registration failed', err);
    }
  }
}

export function registerGsapPlugins() {
  // Kept for backwards compatibility — registration now happens at module load.
}

export { gsap, ScrollTrigger, SplitText };
