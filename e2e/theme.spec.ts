import { test, expect } from '@playwright/test';

test('theme toggle persists across reload', async ({ page }) => {
  await page.goto('/en');
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  // The toggle button's aria-label changes between "Switch to light theme" and "Switch to dark theme"
  await page.getByRole('button', { name: /switch to (light|dark) theme/i }).click();
  // Allow next-themes to flip the attribute
  await expect
    .poll(async () => html.getAttribute('data-theme'), { timeout: 2000 })
    .not.toBe(before);
  const after = await html.getAttribute('data-theme');

  await page.reload();
  await expect.poll(async () => html.getAttribute('data-theme')).toBe(after);
});
