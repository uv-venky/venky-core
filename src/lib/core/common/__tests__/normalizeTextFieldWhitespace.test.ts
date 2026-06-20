/* Copyright (c) 2024-present Venky Corp. */

import { describe, expect, it as test } from 'vitest';
import { normalizeTextArrayElementsForPost, normalizeTextFieldWhitespace } from '../normalizeTextFieldWhitespace';

describe('normalizeTextFieldWhitespace', () => {
  test('returns undefined for undefined', () => {
    expect(normalizeTextFieldWhitespace(undefined)).toBeUndefined();
  });
  test('returns undefined for whitespace-only', () => {
    expect(normalizeTextFieldWhitespace('   ')).toBeUndefined();
    expect(normalizeTextFieldWhitespace('')).toBeUndefined();
  });
  test('trims leading and trailing space', () => {
    expect(normalizeTextFieldWhitespace('  hello  ')).toBe('hello');
  });
  test('preserves internal spaces', () => {
    expect(normalizeTextFieldWhitespace(' a b ')).toBe('a b');
  });
});

describe('normalizeTextArrayElementsForPost', () => {
  test('trims string elements only', () => {
    expect(normalizeTextArrayElementsForPost(['  a  ', '  ', 1, null])).toEqual(['a', '', 1, null]);
  });
});
