/* Copyright (c) 2024-present Venky Corp. */

import { describe, expect, it } from 'vitest';
import { getMobileAuthSessionMetadata, MOBILE_AUTH_REQUIRED_ACTION } from '@/lib/core/common/mobile-auth';

describe('getMobileAuthSessionMetadata', () => {
  it('returns no required action when password change is not forced', () => {
    expect(getMobileAuthSessionMetadata({ forcePasswordChange: false })).toEqual({
      forcePasswordChange: false,
    });
  });

  it('returns force-password-change metadata when password change is forced', () => {
    expect(getMobileAuthSessionMetadata({ forcePasswordChange: true })).toEqual({
      forcePasswordChange: true,
      requiredAction: MOBILE_AUTH_REQUIRED_ACTION.ForcePasswordChange,
      nextPath: '/force-password-change',
    });
  });
});
