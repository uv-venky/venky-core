---
name: venky-testing-patterns
description: Testing patterns for Vitest unit tests and Playwright e2e tests. Use when writing tests, creating test fixtures, mocking dependencies, or setting up e2e test automation.
---

# VENKY Testing Patterns

Patterns for Vitest unit tests and Playwright e2e tests.

## Test Tools

| Tool | Use Case |
|------|----------|
| Vitest + React Testing Library | Unit tests |
| Playwright | E2E tests |
| Playwright snapshots | Visual regression |

## File Naming Convention

| Test Type | Extension | Location |
|-----------|-----------|----------|
| Unit tests | `.test.ts`, `.test.tsx` | Next to source file |
| E2E tests | `.spec.ts` | `e2e/` directory |
| Visual tests | `.spec.ts` | `e2e/` directory |

## Directory Structure

```
src/
├── components/
│   └── MyComponent/
│       ├── MyComponent.tsx
│       └── MyComponent.test.tsx    # Unit test
├── lib/
│   └── utils/
│       ├── helper.ts
│       └── helper.test.ts          # Unit test
│   └── server/
│       └── actions/
│           ├── chart-actions.ts
│           └── chart-actions.test.ts  # Action tests
e2e/
├── auth.spec.ts                    # E2E test
├── visual-regression.spec.ts       # Visual tests
└── fixtures/
    └── auth.ts                     # Reusable helpers
```

## Unit Test Pattern

```typescript
/* Copyright (c) 2024-present Venky Corp. */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

// Mock dependencies
vi.mock('venky-core/client', () => ({
  useStore: vi.fn(() => ({
    rows: [],
    isLoading: false,
    executeQuery: vi.fn(),
  })),
}));

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    render(<MyComponent onSubmit={onSubmit} />);
    
    await user.type(screen.getByRole('textbox'), 'Hello');
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(onSubmit).toHaveBeenCalledWith('Hello');
  });

  it('shows loading state', () => {
    render(<MyComponent isLoading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles async operations', async () => {
    render(<MyComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('Loaded')).toBeInTheDocument();
    });
  });

  it('matches snapshot', () => {
    const { container } = render(<MyComponent title="Test" />);
    expect(container).toMatchSnapshot();
  });
});
```

## Testing Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock session
vi.mock('venky-core/auth', () => ({
  auth: vi.fn(() => Promise.resolve({
    user: { id: 'test-user', userName: 'testuser', roles: ['user'] },
  })),
}));
```

## Testing Server Actions

```typescript
/* Copyright (c) 2024-present Venky Corp. */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSalesChart } from './chart-actions';
import type { PgPoolClient } from 'venky-core/server';
import type { Session } from 'venky-core/auth';

function createMockClient(rows: unknown[] = []): PgPoolClient {
  return {
    query: vi.fn().mockResolvedValue({ rows }),
  } as unknown as PgPoolClient;
}

function createMockSession(overrides = {}): Session {
  return {
    id: 'test-session',
    user: {
      id: 'user-123',
      userName: 'testuser',
      roles: ['user'],
      ...overrides,
    },
  } as Session;
}

describe('getSalesChart', () => {
  it('returns aggregated data for date range', async () => {
    const mockData = [
      { date: '2024-01-01', revenue: 1000, orders: 10 },
      { date: '2024-02-01', revenue: 1500, orders: 15 },
    ];
    const client = createMockClient(mockData);
    const session = createMockSession();

    const result = await getSalesChart(client, session, '2024-01-01', '2024-12-31', 'month');

    expect(result).toEqual(mockData);
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('DATE_TRUNC'),
      expect.arrayContaining(['2024-01-01', '2024-12-31'])
    );
  });

  it('filters by user permissions', async () => {
    const client = createMockClient([]);
    const session = createMockSession({ id: 'user-456' });

    await getSalesChart(client, session, '2024-01-01', '2024-12-31', 'month');

    expect(client.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['user-456'])
    );
  });
});
```

## E2E Test Pattern (Playwright)

### Auth Fixture

```typescript
// e2e/fixtures/auth.ts
import type { Page } from '@playwright/test';

export async function loginAsUser(page: Page, email = 'test@example.com', password = 'password') {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

export async function loginAsAdmin(page: Page) {
  await loginAsUser(page, 'admin@example.com', 'adminpass');
}
```

### E2E Test with Fixtures

```typescript
/* Copyright (c) 2024-present Venky Corp. */

import { test, expect } from '@playwright/test';
import { loginAsUser } from './fixtures/auth';

test.describe('Entity Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('can create a new entity', async ({ page }) => {
    await page.goto('/entities');
    
    await page.click('button:has-text("Add New")');
    await page.fill('[name="name"]', 'Test Entity');
    await page.fill('[name="description"]', 'Test description');
    await page.click('button:has-text("Save")');
    
    await expect(page.getByText('Successfully created')).toBeVisible();
    await expect(page.getByText('Test Entity')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/entities/new');
    await page.click('button:has-text("Save")');
    
    await expect(page.getByText('Name is required')).toBeVisible();
  });

  test('handles API errors gracefully', async ({ page }) => {
    await page.route('/api/action', async route => {
      await route.fulfill({
        status: 200,
        json: { status: 'ERROR', message: 'Server error' },
      });
    });

    await page.goto('/entities');
    await expect(page.getByText('Server error')).toBeVisible();
  });

  test('works with mocked data', async ({ page }) => {
    await page.route('/api/action', async route => {
      const body = await route.request().postDataJSON();
      if (body[0] === 'getEntities') {
        await route.fulfill({
          json: { status: 'OK', result: [{ id: '1', name: 'Mock Entity' }] },
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/entities');
    await expect(page.getByText('Mock Entity')).toBeVisible();
  });
});
```

## Visual Regression Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('dashboard matches snapshot', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="dashboard-content"]');
    
    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('table component matches snapshot', async ({ page }) => {
    await page.goto('/entities');
    await page.waitForSelector('table');
    
    const table = page.locator('table');
    await expect(table).toHaveScreenshot('entity-table.png');
  });
});
```

## Testing Store/State

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEntityStore } from './use-store';

vi.mock('venky-core/client', () => ({
  useStore: vi.fn((config) => ({
    rows: [],
    isLoading: false,
    executeQuery: vi.fn(),
    ...config,
  })),
}));

describe('useEntityStore', () => {
  it('creates store with correct config', () => {
    const { result } = renderHook(() => useEntityStore());
    
    expect(result.current.datasourceId).toBe('Entity');
    expect(result.current.limit).toBe(20);
  });
});
```

## Running Tests

```bash
# Unit tests
pnpm test                    # Watch mode
pnpm test --run              # Run once and exit (CI)
pnpm test MyComponent        # Run specific test
pnpm test --coverage         # Generate coverage

# E2E tests
pnpm test:e2e                # Run all e2e
pnpm test:e2e --ui           # Interactive UI
pnpm test:e2e auth           # Specific file

# Visual regression
pnpm test:visual             # Run visual tests
pnpm test:visual:update      # Update snapshots

# CI pipeline
pnpm typecheck && pnpm test --run && pnpm test:e2e
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what users see and do
2. **Use data-testid sparingly** - Prefer accessible queries (role, label, text)
3. **Keep tests isolated** - Each test should be independent
4. **Mock external dependencies** - Don't rely on real APIs in unit tests
5. **Use meaningful assertions** - Be specific about expectations
6. **Write descriptive test names** - Should read like documentation
7. **Follow AAA pattern** - Arrange, Act, Assert
8. **Clean up after tests** - Reset mocks in beforeEach/afterEach
