/* Copyright (c) 2024-present Venky Corp. */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

async function signIn(page: import('@playwright/test').Page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.getByTestId('email-input').fill('admin');
  await page.getByTestId('password-input').fill('VENKY123!');
  await page.getByTestId('sign-in-button').click();
}

// Workflow with Fork/Join and runs (set WORKFLOW_ID env to override)
const DEFAULT_WORKFLOW_ID = '019c0897-9c12-76a8-b379-2a244085f89a';

test.describe('workflow parallel count', () => {
  test('selecting a run shows parallel count on fork-branch action nodes', async ({ page }) => {
    await signIn(page);

    const workflowId = process.env.WORKFLOW_ID ?? DEFAULT_WORKFLOW_ID;
    await page.goto(`${BASE_URL}/workflows/${workflowId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });
    await page.waitForLoadState('networkidle');

    await page.getByTestId('workflow-runs-tab').click();

    const firstRunCard = page.locator('[data-testid^="workflow-run-"]').first();
    await firstRunCard.waitFor({ state: 'visible', timeout: 15000 });
    await firstRunCard.click();

    await expect(page.getByText(/Parallel × \d+/).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
