import { test, expect } from '@playwright/test';

test.describe('home page', () => {
  test('redirects from / to default locale', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test('English page renders the hero headline', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Arabic page renders with dir=rtl', async ({ page }) => {
    await page.goto('/ar');
    await expect(page.locator('[dir="rtl"]').first()).toBeVisible();
  });

  test('sitemap, robots, and og-image respond', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    const og = await request.get('/en/opengraph-image');
    expect(og.status()).toBe(200);
  });
});
