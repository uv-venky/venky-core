import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setHashParams } from '@/components/core/hooks/useHashParams';

// Mock window.history and window.location
const mockHistoryReplaceState = vi.fn();
const mockLocation = {
  hash: '#test=value',
  href: 'http://localhost:3000/#test=value',
};

Object.defineProperty(window, 'history', {
  value: {
    replaceState: mockHistoryReplaceState,
  },
  writable: true,
});

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('useHashParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock location
    Object.defineProperty(window, 'location', {
      value: { ...mockLocation },
      writable: true,
    });
  });

  describe('setHashParams', () => {
    it('should set hash parameter when value is provided', () => {
      // Mock URLSearchParams
      const mockSet = vi.fn();
      const mockToString = vi.fn(() => 'key=value');
      class MockURLSearchParams {
        set = mockSet;
        toString = mockToString;
      }

      global.URLSearchParams = MockURLSearchParams as any;

      setHashParams('test-key', 'test-value');

      expect(mockSet).toHaveBeenCalledWith('test-key', 'test-value');
      expect(mockHistoryReplaceState).toHaveBeenCalledWith(null, '', '#key=value');
    });

    it('should delete hash parameter when value is null', () => {
      const mockDelete = vi.fn();
      const mockToString = vi.fn(() => '');
      class MockURLSearchParams {
        delete = mockDelete;
        toString = mockToString;
      }

      global.URLSearchParams = MockURLSearchParams as any;

      setHashParams('test-key', null);

      expect(mockDelete).toHaveBeenCalledWith('test-key');
      expect(mockHistoryReplaceState).toHaveBeenCalledWith(null, '', '#');
    });

    it('should delete hash parameter when value is undefined', () => {
      const mockDelete = vi.fn();
      const mockToString = vi.fn(() => '');
      class MockURLSearchParams {
        delete = mockDelete;
        toString = mockToString;
      }

      global.URLSearchParams = MockURLSearchParams as any;

      setHashParams('test-key', undefined);

      expect(mockDelete).toHaveBeenCalledWith('test-key');
      expect(mockHistoryReplaceState).toHaveBeenCalledWith(null, '', '#');
    });

    it('should handle existing hash parameters', () => {
      const mockSet = vi.fn();
      const mockGet = vi.fn(() => 'existing-value');
      const mockToString = vi.fn(() => 'existing=value&new=value');
      class MockURLSearchParams {
        set = mockSet;
        get = mockGet;
        toString = mockToString;
      }

      global.URLSearchParams = MockURLSearchParams as any;

      setHashParams('new-key', 'new-value');

      expect(mockSet).toHaveBeenCalledWith('new-key', 'new-value');
      expect(mockHistoryReplaceState).toHaveBeenCalledWith(null, '', '#existing=value&new=value');
    });

    it('should handle empty hash string', () => {
      const mockSet = vi.fn();
      const mockToString = vi.fn(() => 'key=value');
      class MockURLSearchParams {
        set = mockSet;
        toString = mockToString;
      }

      global.URLSearchParams = MockURLSearchParams as any;

      // Mock window.location.hash to be empty
      Object.defineProperty(window, 'location', {
        value: { hash: '' },
        writable: true,
      });

      setHashParams('test-key', 'test-value');

      expect(mockSet).toHaveBeenCalledWith('test-key', 'test-value');
      expect(mockHistoryReplaceState).toHaveBeenCalledWith(null, '', '#key=value');
    });
  });
});
