/* Copyright (c) 2024-present Venky Corp. */

import type { User } from '@/lib/core/common/types/Auth';

export const MOBILE_AUTH_REQUIRED_ACTION = {
  ForcePasswordChange: 'FORCE_PASSWORD_CHANGE',
} as const;

export type MobileAuthRequiredAction = (typeof MOBILE_AUTH_REQUIRED_ACTION)[keyof typeof MOBILE_AUTH_REQUIRED_ACTION];

export interface MobileAuthSessionData {
  encryptedSessionId: string;
  expiresAt: string;
  forcePasswordChange: boolean;
  requiredAction?: MobileAuthRequiredAction;
  nextPath?: string;
}

export function getMobileAuthSessionMetadata(
  user: Pick<User, 'forcePasswordChange'>,
): Pick<MobileAuthSessionData, 'forcePasswordChange' | 'requiredAction' | 'nextPath'> {
  if (user.forcePasswordChange) {
    return {
      forcePasswordChange: true,
      requiredAction: MOBILE_AUTH_REQUIRED_ACTION.ForcePasswordChange,
      nextPath: '/force-password-change',
    };
  }

  return {
    forcePasswordChange: false,
  };
}
