/* Copyright (c) 2024-present Venky Corp. */

import { describe, expect, it } from 'vitest';
import { isUserError, UserError } from '../error';

describe('isUserError', () => {
  it('recognizes UserError via instanceof', () => {
    expect(isUserError(new UserError('blocked'))).toBe(true);
  });

  it('recognizes UserError when instanceof fails (duplicate class)', () => {
    // Second bundle copy: same class name, default Error.name on instance
    const ForeignUserError = class UserError extends Error {};
    const err = new ForeignUserError('blocked');
    expect(err).not.toBeInstanceOf(UserError);
    expect(err.name).toBe('Error');
    expect(isUserError(err)).toBe(true);
  });

  it('rejects plain Error', () => {
    expect(isUserError(new Error('fail'))).toBe(false);
  });
});
