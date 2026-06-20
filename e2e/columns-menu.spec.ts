/* Copyright (c) 2024-present Venky Corp. */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

async function signIn(page: import('@playwright/test').Page) {
  await page.goto(BASE_URL);
  await page.getByTestId('email-input').fill('admin');
  await page.getByTestId('password-input').fill('VENKY123!');
  await page.getByTestId('sign-in-button').click();
}

/**
 * Verifies that the Column views popover count and column state persist after Apply.
 * Requires dev server running: pnpm dev
 */
test('Column views: count persists after Apply and reopen', async ({ page }) => {
  await signIn(page);
  await page.getByTestId('/admin/config/users').click();
  await expect(page).toHaveTitle(/Users/);

  const columnsTrigger = page.getByTestId('columns-menu-trigger');
  await expect(columnsTrigger).toBeVisible();

  await columnsTrigger.click();

  const popover = page.getByTestId('column-views-popover');
  await expect(popover).toBeVisible({ timeout: 10000 });

  const popoverContent = page.getByTestId('columns-menu-content');
  await expect(popoverContent.getByTestId('columns-menu-option-locationName')).toBeVisible({ timeout: 10000 });

  await popoverContent.getByTestId('column-views-remove-locationName').click({ force: true });

  await page.getByTestId('column-views-apply').click();
  await expect(popover).not.toBeVisible();

  await expect(columnsTrigger).toContainText(/Columns \(\d\/6\)/);
  const textAfterApply = await columnsTrigger.textContent();
  const matchAfterApply = textAfterApply?.match(/Columns \((\d)\/6\)/);
  const visibleCountAfterApply = matchAfterApply ? Number.parseInt(matchAfterApply[1], 10) : 0;
  expect(visibleCountAfterApply).toBeGreaterThanOrEqual(2);

  await columnsTrigger.click();
  await expect(popover).toBeVisible({ timeout: 5000 });
  await expect(popoverContent.getByTestId('columns-menu-option-locationName')).not.toBeVisible({ timeout: 5000 });

  const textAfterReopen = await columnsTrigger.textContent();
  const matchAfterReopen = textAfterReopen?.match(/Columns \((\d)\/6\)/);
  const visibleCountAfterReopen = matchAfterReopen ? Number.parseInt(matchAfterReopen[1], 10) : 0;
  expect(visibleCountAfterReopen).toBe(visibleCountAfterApply);
});
