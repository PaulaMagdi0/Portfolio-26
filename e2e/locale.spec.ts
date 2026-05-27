import { test, expect } from '@playwright/test';

test('locale switcher rewrites the URL', async ({ page }) => {
  await page.goto('/en');
  // The locale switcher renders both EN and AR; clicking AR routes to /ar.
  await page.getByRole('button', { name: 'AR', exact: true }).click();
  await expect(page).toHaveURL(/\/ar\/?$/);
});
