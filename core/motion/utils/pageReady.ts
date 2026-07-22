/**
 * Entrance-animation readiness gate.
 *
 * The full-screen PageLoader curtain sits above the page (z-index 200) until its
 * clip-path wipe finishes. Scroll- and idle-triggered reveals fire on
 * IntersectionObserver / idle, which happens *behind* the curtain — so on a
 * reload that lands you on a section, that section's entrance animation plays
 * hidden and you never see it. Reveal primitives await `whenPageReady()` before
 * playing; `PageLoader` calls `markPageReady()` once the curtain has lifted.
 */

let ready = false;
const waiters = new Set<() => void>();

/** Called by PageLoader once the curtain wipe has finished. Idempotent. */
export function markPageReady(): void {
  if (ready) return;
  ready = true;
  for (const resolve of waiters) resolve();
  waiters.clear();
}

/**
 * Resolves once the page is ready for entrance animations. Resolves immediately
 * when the loader has already finished (the common case for below-the-fold
 * sections revealed while scrolling), so it only actually defers the section you
 * land on at load/reload time. A backstop timeout guarantees content is never
 * stuck hidden on pages without a loader (e.g. not-found) or if it never fires.
 */
export function whenPageReady(): Promise<void> {
  if (typeof window === 'undefined' || ready) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => {
      waiters.delete(done);
      resolve();
    };
    waiters.add(done);
    // The loader normally resolves this in ~2s; 4s is comfortably past that.
    window.setTimeout(done, 4000);
  });
}
