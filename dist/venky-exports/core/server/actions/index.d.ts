import { type Result } from '../../../../app/login/actions';
import type { ValidPasswordResetTokenType } from '../../../../app/login/reset-password/types';
/**
 * Form/unauthenticated server actions for login and password reset.
 * Use useMutation('updateProfile') and useMutation('signOut') for authenticated actions.
 */
export declare function authenticateAction(_prevState: Result | undefined, formData: FormData): Promise<Result>;
export declare function requestPasswordResetAction(_prevState: Result | undefined, formData: FormData): Promise<Result>;
export declare function changePasswordAction(_prevState: Result | undefined, formData: FormData): Promise<Result>;
export declare function isValidPasswordResetTokenAction(
  encodedToken: string,
): Promise<ValidPasswordResetTokenType | false>;
//# sourceMappingURL=index.d.ts.map
