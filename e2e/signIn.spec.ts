import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

async function signIn(page: Page) {
  await page.goto(BASE_URL);

  await page.getByTestId('email-input').fill('admin');
  await page.getByTestId('password-input').fill('VENKY123!');
  await page.getByTestId('sign-in-button').click();
}

test('has title', async ({ page }) => {
  await page.goto(BASE_URL);

  await expect(page).toHaveTitle(/VENKY/);
});

test('signIn', async ({ page }) => {
  await signIn(page);

  await expect(page).toHaveTitle(/Users/);
});

test('navigate to /admin/config/users', async ({ page }) => {
  await signIn(page);

  await expect(page.getByTestId('/admin/config/users')).toBeVisible();
  await page.getByTestId('/admin/config/users').click();

  await expect(page).toHaveTitle(/Users/);
});
