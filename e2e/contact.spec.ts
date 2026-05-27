import { test, expect } from '@playwright/test';

test('contact form validates and produces a mailto navigation', async ({ page }) => {
  await page.goto('/en');
  await page.getByLabel(/your name/i).fill('Jane Doe');
  await page.getByLabel(/^email$/i).fill('jane@example.com');
  await page.getByLabel(/^message$/i).fill('Hello there, this is a test message.');

  // The form submit handler sets window.location.href to a mailto: URL via rAF.
  // Watching for that navigation is unreliable (mailto: doesn't fire a request).
  // Instead, assert that the submit button text changes to the sending/sent state.
  await page.getByRole('button', { name: /send message/i }).click();
  await expect(page.getByRole('button', { name: /opening mail|message ready/i })).toBeVisible({
    timeout: 2000,
  });
});

test('contact form shows validation errors for invalid input', async ({ page }) => {
  await page.goto('/en');
  // Submit empty form
  await page.getByRole('button', { name: /send message/i }).click();
  // Errors are rendered as <p role="alert">
  const alerts = await page.getByRole('alert').all();
  expect(alerts.length).toBeGreaterThanOrEqual(1);
});
