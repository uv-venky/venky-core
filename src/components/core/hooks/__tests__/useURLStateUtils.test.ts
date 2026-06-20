import { describe, it, expect, vi } from 'vitest';
import {
  defaultDeserialize,
  defaultSerialize,
  defaultValidator,
  jsonSerialize,
  jsonDeserialize,
  base64Serialize,
  base64Deserialize,
  stringSerialize,
  stringDeserialize,
  intSerialize,
  intDeserialize,
} from '@/components/core/hooks/useURLStateUtils';
import clientLogger from '@/lib/core/client/client-logger';

describe('useURLStateUtils', () => {
  describe('defaultDeserialize', () => {
    it('should return null for null input', () => {
      expect(defaultDeserialize(null)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(defaultDeserialize('')).toBeNull();
    });

    it('should parse valid JSON', () => {
      expect(defaultDeserialize('"test"')).toBe('test');
      expect(defaultDeserialize('42')).toBe(42);
      expect(defaultDeserialize('true')).toBe(true);
      expect(defaultDeserialize('{"key": "value"}')).toEqual({ key: 'value' });
      expect(defaultDeserialize('[1, 2, 3]')).toEqual([1, 2, 3]);
    });

    it('should return null for invalid JSON', () => {
      const consoleSpy = vi.spyOn(clientLogger, 'error').mockImplementation(() => {});

      expect(defaultDeserialize('invalid json')).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith({
        message: 'Failed to parse JSON: invalid json',
      });

      consoleSpy.mockRestore();
    });
  });

  describe('defaultSerialize', () => {
    it('should return empty string for null', () => {
      expect(defaultSerialize(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(defaultSerialize(undefined)).toBe('');
    });

    it('should serialize valid values', () => {
      expect(defaultSerialize('test')).toBe('"test"');
      expect(defaultSerialize(42)).toBe('42');
      expect(defaultSerialize(true)).toBe('true');
      expect(defaultSerialize({ key: 'value' })).toBe('{"key":"value"}');
      expect(defaultSerialize([1, 2, 3])).toBe('[1,2,3]');
    });
  });

  describe('defaultValidator', () => {
    it('should always return true', () => {
      expect(defaultValidator()).toBe(true);
    });
  });

  describe('jsonSerialize', () => {
    it('should serialize and base64 encode', () => {
      const result = jsonSerialize('test');
      expect(result).toBe('InRlc3Qi');

      const result2 = jsonSerialize({ key: 'value' });
      expect(result2).toBe('eyJrZXkiOiJ2YWx1ZSJ9');
    });

    it('should handle null values', () => {
      expect(jsonSerialize(null)).toBe('bnVsbA==');
    });
  });

  describe('jsonDeserialize', () => {
    it('should decode base64 and parse JSON', () => {
      expect(jsonDeserialize('InRlc3Qi')).toBe('test');
      expect(jsonDeserialize('eyJrZXkiOiJ2YWx1ZSJ9')).toEqual({ key: 'value' });
    });

    it('should return null for null input', () => {
      expect(jsonDeserialize(null)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(jsonDeserialize('')).toBeNull();
    });

    it('should return null for invalid base64', () => {
      const consoleSpy = vi.spyOn(clientLogger, 'error').mockImplementation(() => {});

      expect(jsonDeserialize('invalid base64')).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith({
        message: 'Failed to parse JSON: invalid base64',
      });

      consoleSpy.mockRestore();
    });

    it('should return null for invalid JSON after base64 decode', () => {
      const consoleSpy = vi.spyOn(clientLogger, 'error').mockImplementation(() => {});

      // Valid base64 but invalid JSON
      expect(jsonDeserialize('aW52YWxpZA==')).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith({
        message: 'Failed to parse JSON: aW52YWxpZA==',
      });

      consoleSpy.mockRestore();
    });
  });

  describe('base64Serialize', () => {
    it('should encode string to base64', () => {
      expect(base64Serialize('test')).toBe('dGVzdA==');
      expect(base64Serialize('hello world')).toBe('aGVsbG8gd29ybGQ=');
    });
  });

  describe('base64Deserialize', () => {
    it('should decode base64 to string', () => {
      expect(base64Deserialize('dGVzdA==')).toBe('test');
      expect(base64Deserialize('aGVsbG8gd29ybGQ=')).toBe('hello world');
    });

    it('should return null for null input', () => {
      expect(base64Deserialize(null)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(base64Deserialize('')).toBeNull();
    });

    it('should return null for invalid base64', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(base64Deserialize('invalid base64')).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse base64: invalid base64');

      consoleSpy.mockRestore();
    });
  });

  describe('stringSerialize', () => {
    it('should return the string as-is', () => {
      expect(stringSerialize('test')).toBe('test');
      expect(stringSerialize('hello world')).toBe('hello world');
      expect(stringSerialize('')).toBe('');
    });
  });

  describe('stringDeserialize', () => {
    it('should return the string as-is for valid input', () => {
      expect(stringDeserialize('test')).toBe('test');
      expect(stringDeserialize('hello world')).toBe('hello world');
    });

    it('should return null for null input', () => {
      expect(stringDeserialize(null)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(stringDeserialize('')).toBeNull();
    });
  });

  describe('intSerialize', () => {
    it('should convert number to string', () => {
      expect(intSerialize(42)).toBe('42');
      expect(intSerialize(0)).toBe('0');
      expect(intSerialize(-123)).toBe('-123');
    });

    it('should handle decimal numbers', () => {
      expect(intSerialize(42.5)).toBe('43');
      expect(intSerialize(Math.PI)).toBe('3');
    });
  });

  describe('intDeserialize', () => {
    it('should parse valid integers', () => {
      expect(intDeserialize('42')).toBe(42);
      expect(intDeserialize('0')).toBe(0);
      expect(intDeserialize('-123')).toBe(-123);
    });

    it('should handle decimal numbers', () => {
      expect(intDeserialize('42.5')).toBe(42);
      expect(intDeserialize('3.14159')).toBe(3);
    });

    it('should return null for null input', () => {
      expect(intDeserialize(null)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(intDeserialize('')).toBeNull();
    });

    it('should return NaN for invalid numbers', () => {
      expect(intDeserialize('not a number')).toBeNaN();
      expect(intDeserialize('abc123')).toBeNaN();
    });
  });

  describe('integration tests', () => {
    it('should round-trip serialize and deserialize complex objects', () => {
      const complexObject = {
        string: 'test',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        nested: { key: 'value' },
        nullValue: null,
      };

      const serialized = defaultSerialize(complexObject);
      const deserialized = defaultDeserialize(serialized);

      expect(deserialized).toEqual(complexObject);
    });

    it('should round-trip base64 serialization', () => {
      const original = 'test string with special chars: !@#$%^&*()';
      const serialized = base64Serialize(original);
      const deserialized = base64Deserialize(serialized);

      expect(deserialized).toBe(original);
    });

    it('should round-trip JSON base64 serialization', () => {
      const original = { key: 'value', number: 42, array: [1, 2, 3] };
      const serialized = jsonSerialize(original);
      const deserialized = jsonDeserialize(serialized);

      expect(deserialized).toEqual(original);
    });

    it('should round-trip string serialization', () => {
      const original = 'test string';
      const serialized = stringSerialize(original);
      const deserialized = stringDeserialize(serialized);

      expect(deserialized).toBe(original);
    });

    it('should round-trip integer serialization', () => {
      const original = 42;
      const serialized = intSerialize(original);
      const deserialized = intDeserialize(serialized);

      expect(deserialized).toBe(original);
    });
  });
});
