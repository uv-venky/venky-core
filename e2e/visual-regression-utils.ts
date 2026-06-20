/** biome-ignore-all lint/suspicious/noExportsInTest: We need to export these functions for the visual regression test to use */
/// <reference path="./global.d.ts" />
import type { Page } from '@playwright/test';
import type { DataLoadMeta } from '@/lib/core/client/loading-tracker';

export const BASE_URL = 'http://localhost:3000';

/**
 * Helper function to sign in before taking screenshots
 */
export async function signIn(page: Page) {
  await page.goto(BASE_URL);

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Fill in credentials
  const emailInput = page.getByTestId('email-input');
  const passwordInput = page.getByTestId('password-input');
  const signInButton = page.getByTestId('sign-in-button');

  await emailInput.fill('admin');
  await passwordInput.fill('VENKY123!');

  // Wait for button to be visible and enabled, then click
  await signInButton.waitFor({ state: 'visible', timeout: 10000 });
  await signInButton.click({ force: true });

  // Wait for redirect away from login page
  await page.waitForURL((url) => url.pathname !== '/' && url.pathname !== '/home' && url.pathname !== '/login', {
    timeout: 120000,
  });

  // Wait for page to be ready
  await page.waitForLoadState('domcontentloaded');

  // Ensure cookies are set by waiting a bit longer
  await page.waitForTimeout(2000);

  // Verify we're authenticated by checking cookies
  const cookies = await page.context().cookies();
  const hasAuthCookie = cookies.some((cookie) => cookie.name === 'venky-session');

  if (!hasAuthCookie) {
    console.warn('Warning: No auth cookie found after login');
  }
}

export const MAX_WAIT_TIME_MS = 180000;

/**
 * Enable demo mask mode for visual regression tests.
 * Transforms all text to X's and numbers to 0's for stable screenshots.
 * Must be called BEFORE any navigation.
 */
export async function enableDemoMaskMode(page: Page) {
  await page.addInitScript(() => {
    window.__VENKY_DEMO_MASK__ = true;
  });
}

/**
 * Wait for all data stores and queries to finish loading.
 * This uses the DataLoadingTracker component which sets window.__VENKY_DATA_READY__
 * to true after all stores have finished loading and the state has been stable
 * for 500ms (to handle cascading/dependent stores).
 *
 * @param page - Playwright page object
 * @param timeout - Maximum time to wait in ms (default: 60000ms)
 * @returns Object with timing information for performance tracking
 */
export async function waitForStoresLoaded(page: Page, timeout = 1200000): Promise<DataLoadMeta> {
  const startTime = Date.now();

  try {
    // Wait for the data ready signal from the DataLoadingTracker
    await page.waitForFunction(
      () => {
        // Check if the tracker has signaled ready
        return window.__VENKY_DATA_READY__ === true;
      },
      { timeout },
    );
  } catch (error) {
    // If timeout, log debug info
    const loadingCount = await page.evaluate(() => window.__VENKY_LOADING_COUNT__ ?? -1);
    console.warn(
      `waitForStoresLoaded timed out after ${Date.now() - startTime}ms. ` +
        `Loading count: ${loadingCount}. ` +
        `Page: ${new URL(page.url()).pathname} ${page.title()}`,
    );
    throw error;
  }

  const dataLoadMeta: DataLoadMeta = await page.evaluate(() =>
    document.body.dataset.VENKYDataLoadMeta ? JSON.parse(document.body.dataset.VENKYDataLoadMeta) : {},
  );

  // Small additional wait for any final render cycle
  await page.waitForTimeout(100);

  return dataLoadMeta;
}

/**
 * Page configuration interface
 */
export interface PageConfig {
  name: string;
  path: string;
  screenshot: string;
  maxDiffPixels?: number;
  waitTimeout?: number;
  requiresAuth?: boolean;
  viewport?: { width: number; height: number };
  preAction?: (page: Page) => Promise<void>;
  postAction?: (page: Page) => Promise<void>;
}
