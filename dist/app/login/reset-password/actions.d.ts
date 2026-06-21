import type {
  ChangePasswordWithResetTokenInput,
  PasswordResetRequestInput,
  Result,
  ValidPasswordResetTokenType,
} from '../../../app/login/reset-password/types';
export declare const requestPasswordReset: (
  _prev: Result | undefined,
  formData: FormData,
) => Promise<import('../../../venky-exports/core/common').ErrorResponse | Result>;
export declare function requestPasswordResetForUser(input: PasswordResetRequestInput): Promise<Result>;
export declare function isValidPasswordResetToken(encodedToken: string): Promise<false | ValidPasswordResetTokenType>;
export declare function validatePasswordResetTokenValue(
  encodedToken: string,
): Promise<false | ValidPasswordResetTokenType>;
export declare function changePasswordWithResetToken(input: ChangePasswordWithResetTokenInput): Promise<Result>;
export declare function changePassword(_prev: Result | undefined, formData: FormData): Promise<Result>;
//# sourceMappingURL=actions.d.ts.map
