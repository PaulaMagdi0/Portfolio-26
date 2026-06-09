import '@testing-library/jest-dom/vitest';
import { vi, afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from 'jest-axe/extend-expect';

expect.extend(matchers as never);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as never;
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as never;
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    // Legacy MediaQueryList API (kept for environments that still call addListener)
    addListener: vi.fn(),
    removeListener: vi.fn(),
    // Modern API
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('next-intl', async () => {
  const actual = await vi.importActual<typeof import('next-intl')>('next-intl');
  return {
    ...actual,
    useTranslations: (namespace?: string) => (key: string) =>
      namespace ? `${namespace}.${key}` : key,
    useLocale: () => 'en',
  };
});

vi.mock('next-intl/server', () => ({
  getTranslations: (namespace?: string) =>
    Promise.resolve((key: string) => (namespace ? `${namespace}.${key}` : key)),
  getLocale: () => Promise.resolve('en'),
  getMessages: () => Promise.resolve({}),
}));

vi.mock('gsap', () => {
  type GsapVars = { onComplete?: () => void; onStart?: () => void };
  const run = (_target: unknown, vars?: GsapVars) => {
    vars?.onStart?.();
    vars?.onComplete?.();
    return { kill: vi.fn(), pause: vi.fn(), play: vi.fn() };
  };
  const api = {
    to: run,
    from: run,
    fromTo: run,
    set: run,
    registerPlugin: vi.fn(),
    timeline: () => ({
      to: run,
      from: run,
      fromTo: run,
      set: run,
      kill: vi.fn(),
    }),
  };
  return {
    gsap: api,
    default: api,
    ScrollTrigger: {
      create: vi.fn(),
      refresh: vi.fn(),
      kill: vi.fn(),
      getAll: () => [],
    },
  };
});

// The motion stack is now loaded via dynamic import() of the gsap subpaths
// (see core/motion/utils/gsap.ts → loadGsap). Mock those subpaths so tests use
// pass-through stubs instead of parsing the real ESM under jsdom.
const scrollTriggerStub = {
  create: vi.fn(),
  refresh: vi.fn(),
  update: vi.fn(),
  kill: vi.fn(),
  getAll: () => [] as Array<{ trigger: unknown; kill: () => void }>,
};

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: scrollTriggerStub,
  default: scrollTriggerStub,
}));

vi.mock('gsap/SplitText', () => {
  class SplitText {
    chars: HTMLElement[] = [];
    words: HTMLElement[] = [];
    lines: HTMLElement[] = [];
    revert = vi.fn();
  }
  return { SplitText, default: SplitText };
});

vi.mock('lenis', () => {
  class Lenis {
    raf = vi.fn();
    on = vi.fn();
    off = vi.fn();
    destroy = vi.fn();
  }
  return { default: Lenis };
});

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; href?: string }) => {
    const a = document.createElement('a');
    if (props.href) a.setAttribute('href', props.href);
    a.textContent = children?.toString() ?? '';
    return a;
  },
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  redirect: vi.fn(),
  getPathname: () => '/',
}));
