import { vi } from 'vitest';
import '@testing-library/jest-dom';
// Mock monaco-setup to prevent loading actual Monaco editor in tests
// This must be declared before any component that imports it
vi.mock('@/lib/monaco-setup', () => ({
  monaco: {},
}));
// Mock @/auth to prevent module resolution issues in tests
vi.mock('@/auth', () => ({
  auth: vi.fn(() => Promise.resolve(null)),
  signIn: vi.fn(() => Promise.resolve()),
  signOut: vi.fn(() => Promise.resolve('/login')),
  hashPassword: vi.fn(),
  getUser: vi.fn(),
  getUserRoles: vi.fn(),
  isUserActive: vi.fn(),
  serverAuthorize: vi.fn(),
  handlers: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}));
// Mock session tracker to prevent "No client to shutdown" warnings during tests
vi.mock('@/lib/core/server/session-tracker', () => ({
  sessionTracker: {
    updateSessionAccess: vi.fn(),
    shutdown: vi.fn(),
    getStats: vi.fn(() => ({ totalSessions: 0, sessionsNeedingUpdate: 0 })),
  },
}));
// Mock Next.js navigation to prevent "invariant expected app router to be mounted" errors in tests
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
}));
// Only define ResizeObserver if it doesn't already exist in the global scope
if (typeof global.ResizeObserver === 'undefined') {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  global.ResizeObserver = ResizeObserver;
}
Element.prototype.scrollIntoView = vi.fn();
// Mock flubber library to prevent getTotalLength errors in tests
vi.mock('flubber', () => ({
  interpolate: vi.fn(() => vi.fn(() => 'M0 0')),
}));
// Suppress React act() warnings that occur due to async operations in useEffect
// These warnings are expected for components with async state updates and don't affect test functionality
const originalError = console.error;
console.error = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    message.includes('An update to') &&
    message.includes('inside a test was not wrapped in act(...)')
  ) {
    return;
  }
  originalError(...args);
};
//# sourceMappingURL=setup.js.map
