/**
 * Full-app verification spec — drives Chromium through every interaction
 * the portfolio supports, captures screenshots, and records console errors
 * and failed network requests. Run via:
 *
 *   pnpm test:e2e -- --project=chromium e2e/verify.spec.ts
 *
 * Outputs to test-results/verify/<step>.png and test-results/verify/report.json.
 */
import { test, expect, type ConsoleMessage, type Request } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'test-results/verify';
mkdirSync(OUT, { recursive: true });

interface Issue {
  step: string;
  kind: 'console' | 'pageerror' | 'requestfailed';
  message: string;
}

const issues: Issue[] = [];

function attachListeners(page: import('@playwright/test').Page, step: string) {
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      const text = msg.text();
      // Filter out known-benign noise.
      if (text.includes('Fast Refresh') || text.includes('webpack-hmr')) return;
      if (text.includes('next-intl')) return;
      issues.push({ step, kind: 'console', message: `[${msg.type()}] ${text}` });
    }
  });
  page.on('pageerror', (err) => {
    issues.push({ step, kind: 'pageerror', message: err.message });
  });
  page.on('requestfailed', (req: Request) => {
    const url = req.url();
    // Ignore favicons and analytics noise.
    if (url.includes('favicon')) return;
    issues.push({
      step,
      kind: 'requestfailed',
      message: `${req.method()} ${url} — ${req.failure()?.errorText ?? 'unknown'}`,
    });
  });
}

async function shot(page: import('@playwright/test').Page, name: string, fullPage = false) {
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage });
}

test.describe.serial('full app verification', () => {
  test('1. /en hero loads, screenshots above-the-fold', async ({ page }) => {
    attachListeners(page, 'en-hero');
    await page.goto('/en');
    // Page loader runs once on first visit; wait for it to clear.
    await page.waitForSelector('html.loaded', { timeout: 15_000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await shot(page, '01-en-hero');
  });

  test('2. /en full-page screenshot (all sections)', async ({ page }) => {
    attachListeners(page, 'en-full');
    await page.goto('/en');
    await page.waitForSelector('html.loaded', { timeout: 15_000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
    await shot(page, '02-en-full', true);
  });

  test('3. /en theme toggle flips data-theme and persists', async ({ page }) => {
    attachListeners(page, 'theme');
    await page.goto('/en');
    await page.waitForSelector('html.loaded', { timeout: 15_000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
    const html = page.locator('html');
    const before = await html.getAttribute('data-theme');
    await shot(page, '03-theme-before');
    const toggle = page.getByRole('button', { name: /switch to (light|dark) theme/i });
    await toggle.click();
    await expect
      .poll(async () => html.getAttribute('data-theme'), { timeout: 2000 })
      .not.toBe(before);
    await shot(page, '04-theme-after');
    const after = await html.getAttribute('data-theme');

    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect.poll(async () => html.getAttribute('data-theme')).toBe(after);
  });

  test('4. locale switcher routes /en → /ar with dir=rtl', async ({ page }) => {
    attachListeners(page, 'locale');
    await page.goto('/en');
    await page.waitForSelector('html.loaded', { timeout: 15_000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'AR', exact: true }).click();
    await expect(page).toHaveURL(/\/ar\/?$/);
    await expect(page.locator('[dir="rtl"]').first()).toBeVisible();
    await shot(page, '05-ar-hero');
  });

  test('5. /ar full-page screenshot', async ({ page }) => {
    attachListeners(page, 'ar-full');
    await page.goto('/ar');
    await page.waitForSelector('html.loaded', { timeout: 15_000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
    await shot(page, '06-ar-full', true);
  });

  test('6. Work section: case-study drawer opens on private project, Escape closes', async ({
    page,
  }) => {
    attachListeners(page, 'drawer');
    await page.goto('/en');
    await page.waitForSelector('html.loaded', { timeout: 15_000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
    // Scroll Work into view
    await page.locator('#work').scrollIntoViewIfNeeded();
    await shot(page, '07-work-section');
    // Find the "Sabeel" row (private). Buttons in Work rows; their accessible name
    // includes the project name translation key value. We try by the actual project name first.
    const sabeel = page
      .getByRole('button', { name: /Sabeel/i })
      .or(page.getByRole('button', { name: /Mobile Backend/i }));
    await sabeel.first().click();
    // Drawer is role=dialog
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 4000 });
    await shot(page, '08-drawer-open');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 2000 });
  });

  test('7. Contact form validates and shows error alerts', async ({ page }) => {
    attachListeners(page, 'contact-invalid');
    await page.goto('/en');
    await page.waitForSelector('html.loaded', { timeout: 15_000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await shot(page, '09-contact-section');
    await page.getByRole('button', { name: /send message/i }).click();
    // At least one alert role should appear
    const alerts = await page.getByRole('alert').count();
    expect(alerts).toBeGreaterThanOrEqual(1);
    await shot(page, '10-contact-errors');
  });

  test('8. Contact form happy path: state transitions to sending/sent', async ({ page }) => {
    attachListeners(page, 'contact-valid');
    await page.goto('/en');
    await page.waitForSelector('html.loaded', { timeout: 15_000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.getByLabel(/your name/i).fill('Jane Doe');
    await page.getByLabel(/^email$/i).fill('jane@example.com');
    await page.getByLabel(/^message$/i).fill('Hello there, this is a verification test message.');
    await shot(page, '11-contact-filled');
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByRole('button', { name: /opening mail|message ready/i })).toBeVisible({
      timeout: 3000,
    });
  });

  test('9. SEO assets respond and contain expected content', async ({ page, request }) => {
    attachListeners(page, 'seo');
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const sitemapBody = await sitemap.text();
    expect(sitemapBody).toContain('/en');
    expect(sitemapBody).toContain('/ar');

    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain('Sitemap:');

    const ogEn = await request.get('/en/opengraph-image');
    expect(ogEn.status()).toBe(200);
    expect(ogEn.headers()['content-type']).toContain('image/png');

    const ogAr = await request.get('/ar/opengraph-image');
    expect(ogAr.status()).toBe(200);

    // JSON-LD must be present on /en
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    const jsonLdCount = await page.locator('script[type="application/ld+json"]').count();
    expect(jsonLdCount).toBeGreaterThanOrEqual(1);
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toContain('Paula Magdy');
    expect(jsonLd).toContain('schema.org');

    // Hreflang alternates
    const alternateCount = await page.locator('link[rel="alternate"][hreflang]').count();
    expect(alternateCount).toBeGreaterThanOrEqual(2);
  });

  test('10. Skip-to-content link is present and focusable', async ({ page }) => {
    attachListeners(page, 'skiplink');
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    // The skip link is the first focusable element
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.textContent ?? '');
    expect(focused.toLowerCase()).toContain('skip');
  });

  test('11. Resume.pdf is downloadable', async ({ request }) => {
    const res = await request.get('/Resume.pdf');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('pdf');
  });
});

test.afterAll(async () => {
  writeFileSync(
    join(OUT, 'report.json'),
    JSON.stringify({ issues, totalIssues: issues.length }, null, 2),
  );
});
