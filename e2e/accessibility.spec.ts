import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Runtime accessibility scan.
 *
 * The jsdom unit tests (`*.accessibility.test.tsx`) can't catch a11y issues that
 * only appear once GSAP runs — e.g. SplitText adds an `aria-label` to its host,
 * which is valid on a heading but prohibited on a <p>. GSAP doesn't run in jsdom,
 * so that class of bug reaches CI. This spec scans the real, animated page:
 * it walks the full height first so every scroll-triggered reveal has applied
 * its runtime aria attributes, then runs axe over the whole document.
 *
 * axe results don't vary meaningfully across rendering engines, so this runs on
 * Chromium only to keep the E2E matrix fast.
 */
test.describe('accessibility (axe-core)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'axe runs on Chromium only');

  for (const path of ['/en', '/ar'] as const) {
    test(`${path} has no serious or critical WCAG 2.1 A/AA violations`, async ({ page }) => {
      await page.goto(path);

      // Wait out the page-loader curtain so we scan the page, not the loader.
      await page
        .waitForSelector('#page-loader', { state: 'detached', timeout: 20_000 })
        .catch(() => {});
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Trigger every scroll-reveal so SplitText's runtime aria-* is applied.
      await page.evaluate(async () => {
        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
        const step = Math.round(window.innerHeight * 0.8);
        for (let y = 0; y <= document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await sleep(150);
        }
        window.scrollTo(0, 0);
        await sleep(250);
      });

      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const blocking = violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.map((n) => n.target).slice(0, 5),
        }));

      expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
    });
  }
});
