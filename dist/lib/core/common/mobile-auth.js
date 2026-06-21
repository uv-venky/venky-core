/* Copyright (c) 2024-present Venky Corp. */
export const MOBILE_AUTH_REQUIRED_ACTION = {
  ForcePasswordChange: 'FORCE_PASSWORD_CHANGE',
};
export function getMobileAuthSessionMetadata(user) {
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
//# sourceMappingURL=mobile-auth.js.map
