'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

type SupportedTag = 'div' | 'li' | 'section' | 'article' | 'span';

interface RevealProps {
  children: ReactNode;
  /** Seconds before the transition starts once the element is in view. */
  delay?: number;
  /** Starting vertical offset in px. */
  y?: number;
  className?: string;
  as?: SupportedTag;
}

// One shared IntersectionObserver for every Reveal on the page. This replaces the
// former framer-motion `whileInView` wrapper: ~40 of these hydrate on first paint,
// and a CSS transition toggled by a data attribute costs no JS at all after mount.
// The hidden state lives in globals.css under `html.js .reveal:not([data-revealed])`,
// so content is never blank without JavaScript.
const callbacks = new Map<Element, () => void>();
let observer: IntersectionObserver | null = null;

function observe(el: Element, cb: () => void): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    cb();
    return () => {};
  }
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const fn = callbacks.get(entry.target);
        if (!fn) continue;
        callbacks.delete(entry.target);
        observer?.unobserve(entry.target);
        fn();
      }
      if (callbacks.size === 0) {
        observer?.disconnect();
        observer = null;
      }
    },
    // Matches the previous framer `viewport: { margin: '-80px' }` trigger line.
    { rootMargin: '-80px 0px' },
  );
  callbacks.set(el, cb);
  observer.observe(el);
  return () => {
    callbacks.delete(el);
    observer?.unobserve(el);
  };
}

export function Reveal({ children, delay = 0, y = 24, className = '', as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reveal = () => el.setAttribute('data-revealed', '');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveal();
      return;
    }
    // Anything already on screen at mount reveals immediately. The observer's
    // negative root margin would otherwise leave content hugging the top edge of
    // the first viewport (e.g. the hero's top bar) waiting for a scroll that never
    // brings it "into" the shrunken root.
    const rect = el.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      reveal();
      return;
    }
    return observe(el, reveal);
  }, []);

  const Tag = as;
  const style = { '--reveal-y': `${y}px`, '--reveal-delay': `${delay}s` } as CSSProperties;
  return (
    <Tag ref={ref as never} className={`reveal ${className}`.trim()} style={style}>
      {children}
    </Tag>
  );
}
