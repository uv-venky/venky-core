/** biome-ignore-all lint/suspicious/noExportsInTest: We need to export these functions for the visual regression test to use */
import type { Page } from '@playwright/test';
import type { PageConfig } from './visual-regression-utils';

/**
 * All page configurations
 */
export const PAGE_CONFIGS: PageConfig[] = [
  // Unauthenticated Pages
  {
    name: 'login page',
    path: '/login',
    screenshot: '00-login-page.png',
    requiresAuth: false,
    maxDiffPixels: 50,
  },
  {
    name: 'reset password page',
    path: '/login/reset-password',
    screenshot: '01-reset-password-page.png',
    requiresAuth: false,
    maxDiffPixels: 50,
  },
  // Home & Dashboard
  {
    name: 'home page',
    path: '/home',
    screenshot: '02-home-page.png',
    maxDiffPixels: 150,
    preAction: async (page: Page) => {
      await page.waitForURL((url) => url.pathname !== '/home', {
        timeout: 120000,
      });
    },
  },
  // Admin - Configuration
  {
    name: 'admin users',
    path: '/admin/config/users',
    screenshot: '03-admin-users.png',
    maxDiffPixels: 100,
  },
  {
    name: 'admin roles',
    path: '/admin/config/roles',
    screenshot: '04-admin-roles.png',
    maxDiffPixels: 100,
  },
  {
    name: 'admin apps',
    path: '/admin/config/apps',
    screenshot: '05-admin-apps.png',
    maxDiffPixels: 300,
  },
  {
    name: 'admin themes',
    path: '/admin/config/themes',
    screenshot: '06-admin-themes.png',
    maxDiffPixels: 100,
  },
  {
    name: 'unknown page',
    path: '/some/unknown-page',
    screenshot: '07-unknown-page.png',
    maxDiffPixels: 150,
  },

  // Admin - Monitoring
  {
    name: 'admin health monitoring',
    path: '/admin/monitoring/health',
    screenshot: '08-admin-health.png',
    maxDiffPixels: 8000,
  },
  {
    name: 'admin audit logs',
    path: '/admin/monitoring/audit',
    screenshot: '10-admin-audit.png',
    maxDiffPixels: 1000,
  },
  {
    name: 'admin SQL browser',
    path: '/admin/monitoring/sql-browser',
    screenshot: '12-admin-sql-browser.png',
    maxDiffPixels: 100,
  },
  {
    name: 'admin API playground',
    path: '/admin/monitoring/api-playground',
    screenshot: '13-admin-api-playground.png',
    maxDiffPixels: 100,
  },
  {
    name: 'admin cache',
    path: '/admin/monitoring/cache',
    screenshot: '14-admin-cache.png',
    maxDiffPixels: 300,
  },

  // Responsive Views
  {
    name: 'mobile view - users',
    path: '/admin/config/users',
    screenshot: '15-mobile-home.png',
    maxDiffPixels: 200,
    viewport: { width: 375, height: 667 },
  },
  {
    name: 'tablet view - users',
    path: '/admin/config/users',
    screenshot: '14-tablet-cop-dashboard.png',
    maxDiffPixels: 150,
    viewport: { width: 768, height: 1024 },
  },

  // Theme Variations
  {
    name: 'light theme - home',
    path: '/admin/config/users',
    screenshot: '15-light-theme-home.png',
    maxDiffPixels: 150,
    waitTimeout: 1000,
    postAction: async (page: Page) => {
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      if ((await themeToggle.count()) > 0) {
        await themeToggle.click();
        const lightTheme = page.locator('[data-testid="theme-toggle-light"]');
        if ((await lightTheme.count()) > 0) {
          await lightTheme.click();
        }
      }
    },
  },
  {
    name: 'dark theme - home',
    path: '/admin/config/users',
    screenshot: '16-dark-theme-home.png',
    maxDiffPixels: 150,
    waitTimeout: 1000,
    postAction: async (page: Page) => {
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      if ((await themeToggle.count()) > 0) {
        await themeToggle.click();
        const darkTheme = page.locator('[data-testid="theme-toggle-dark"]');
        if ((await darkTheme.count()) > 0) {
          await darkTheme.click();
        }
      }
    },
  },
  {
    name: 'chat',
    path: '/chat',
    screenshot: '17-chat.png',
    maxDiffPixels: 150,
  },
  {
    name: 'workflow list',
    path: '/workflows/list',
    screenshot: '18-workflow-list.png',
    maxDiffPixels: 150,
  },
  {
    name: 'workflow runs',
    path: '/workflows/runs',
    screenshot: '19-workflow-runs.png',
    maxDiffPixels: 150,
  },
  {
    name: 'workflow designer',
    path: '/workflows/019b0bb9-cc45-75e7-89a1-1f10ea434322',
    screenshot: '20-workflow-designer.png',
    maxDiffPixels: 150,
  },
];
