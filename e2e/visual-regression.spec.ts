import { test, expect, type Page } from '@playwright/test';
import { BASE_URL, signIn, waitForStoresLoaded, enableDemoMaskMode } from './visual-regression-utils';
import { PerformanceTracker, type PerformanceMetrics } from './performance-tracker';
import { PAGE_CONFIGS } from './visual-regression-pages';
import type { DataLoadMeta } from '@/lib/core/client/loading-tracker';

/**
 * Wait for all data stores to be loaded using the DataLoadingTracker.
 * Also tracks API call count and timing for performance metrics.
 */
async function waitForDataStores(page: Page): Promise<DataLoadMeta> {
  const result: DataLoadMeta = await waitForStoresLoaded(page);
  return result;
}

async function capturePerformanceMetrics(
  page: Page,
  pagePath: string,
  dataSourceResult: DataLoadMeta,
  viewport?: { width: number; height: number },
): Promise<PerformanceMetrics> {
  // Get browser performance metrics
  const timing = await page.evaluate(() => {
    const perf = performance.timing;
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');

    return {
      loadTime: perf.loadEventEnd - perf.navigationStart,
      domReadyTime: perf.domContentLoadedEventEnd - perf.navigationStart,
      firstContentfulPaint: fcp ? fcp.startTime : 0,
    };
  });

  return {
    ...dataSourceResult,
    loadTime: timing.loadTime,
    domReadyTime: timing.domReadyTime,
    firstContentfulPaint: timing.firstContentfulPaint,
    timestamp: new Date().toISOString(),
    pagePath,
    viewport,
  };
}

test.describe('Visual Regression Tests', () => {
  test.setTimeout(180000);

  // Initialize performance tracker
  const performanceTracker = new PerformanceTracker();

  // Configure for visual testing
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  const ONLY_TEST_PAGES: string[] = [];
  const pagesToTest =
    ONLY_TEST_PAGES.length > 0 ? PAGE_CONFIGS.filter((config) => ONLY_TEST_PAGES.includes(config.path)) : PAGE_CONFIGS;

  for (const config of pagesToTest.sort((a, b) => a.screenshot.localeCompare(b.screenshot))) {
    test(`${config.path} - ${config.name}`, async ({ page }, testInfo) => {
      // Detect update mode from testInfo - this works in worker processes!
      const isBaseline = testInfo.config.updateSnapshots === 'changed';

      // Set custom viewport if specified
      if (config.viewport) {
        await page.setViewportSize(config.viewport);
      }

      // Sign in if required (default is true unless explicitly set to false)
      if (config.requiresAuth !== false) {
        await signIn(page);
      }

      // Enable demo mask mode for stable screenshots (after sign-in to not affect login)
      await enableDemoMaskMode(page);

      // Navigate to the page
      await page.goto(`${BASE_URL}${config.path}`, {
        waitUntil: 'commit',
        timeout: 50000,
      });

      // Execute pre-action if specified
      if (config.preAction) {
        await config.preAction(page);
      }
      // Wait for data stores to load and capture performance metrics
      const dataSourceResult: DataLoadMeta = await waitForDataStores(page);

      // Execute pre-action if specified
      if (config.postAction) {
        await config.postAction(page);
      }
      // Capture performance metrics
      const metrics = await capturePerformanceMetrics(page, config.path, dataSourceResult, config.viewport);

      // Save or compare metrics
      if (isBaseline) {
        await performanceTracker.saveBaseline(config.screenshot, metrics);
      } else {
        await performanceTracker.saveCurrent(config.screenshot, metrics);
        const comparison = await performanceTracker.compare(config.screenshot, metrics);

        if (comparison) {
          // Attach comparison to test report
          test.info().attach('performance-comparison.json', {
            body: JSON.stringify(comparison, null, 2),
            contentType: 'application/json',
          });

          // Warn if there are regressions
          if (comparison.regressions.length > 0) {
            console.warn(`⚠️  Performance regressions detected for ${config.name}:`);
            for (const regression of comparison.regressions) {
              console.warn(`   - ${regression}`);
            }
          }
        } else {
          // biome-ignore lint/suspicious/noConsole: Intentional test output for performance metrics
          console.log(`${performanceTracker.formatMetrics(metrics)}`);
        }
      }

      // Take screenshot with configuration
      await expect(page).toHaveScreenshot(config.screenshot, {
        fullPage: true,
        maxDiffPixels: config.maxDiffPixels,
      });
    });
  }

  // After all tests, generate summary report
  // test.afterAll(async () => {
  //   if (!isBaseline) {
  //     const report = await performanceTracker.generateSummaryReport();
  //     // biome-ignore lint/suspicious/noConsole: Intentional test output for performance summary report
  //     console.log(`\n${report}`);
  //   }
  // });
});
