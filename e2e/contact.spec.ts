import { test, expect } from '@playwright/test';

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

test('contact form submits via Web3Forms and shows success banner', async ({ page }) => {
  await page.route(WEB3FORMS_URL, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Submission received' }),
    });
  });

  await page.goto('/en');
  await page.getByLabel(/your name/i).fill('Jane Doe');
  await page.getByLabel(/^email$/i).fill('jane@example.com');
  await page.getByLabel(/^message$/i).fill('Hello there, this is a test message.');
  await page.getByRole('button', { name: /send message/i }).click();

  await expect(page.getByRole('status')).toBeVisible({ timeout: 5000 });
});

test('contact form shows error banner when Web3Forms fails', async ({ page }) => {
  await page.route(WEB3FORMS_URL, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, message: 'Server error' }),
    });
  });

  await page.goto('/en');
  await page.getByLabel(/your name/i).fill('Jane Doe');
  await page.getByLabel(/^email$/i).fill('jane@example.com');
  await page.getByLabel(/^message$/i).fill('Hello there, this is a test message.');
  await page.getByRole('button', { name: /send message/i }).click();

  // Scope to the form's banner — Next.js injects a body-level
  // <div role="alert" id="__next-route-announcer__"> in production builds.
  await expect(page.locator('form').getByRole('alert')).toBeVisible({ timeout: 5000 });
});

test('contact form shows validation errors for invalid input', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('button', { name: /send message/i }).click();
  const alerts = await page.getByRole('alert').all();
  expect(alerts.length).toBeGreaterThanOrEqual(1);
});
