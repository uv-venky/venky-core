'use server';

import { authenticate, type Result } from '@/app/login/actions';
import { changePassword, isValidPasswordResetToken, requestPasswordReset } from '@/app/login/reset-password/actions';
import type { ValidPasswordResetTokenType } from '@/app/login/reset-password/types';

/**
 * Form/unauthenticated server actions for login and password reset.
 * Use useMutation('updateProfile') and useMutation('signOut') for authenticated actions.
 */
export async function authenticateAction(_prevState: Result | undefined, formData: FormData): Promise<Result> {
  return authenticate(_prevState, formData);
}

export async function requestPasswordResetAction(_prevState: Result | undefined, formData: FormData): Promise<Result> {
  return requestPasswordReset(_prevState, formData);
}

export async function changePasswordAction(_prevState: Result | undefined, formData: FormData): Promise<Result> {
  return changePassword(_prevState, formData);
}

export async function isValidPasswordResetTokenAction(
  encodedToken: string,
): Promise<ValidPasswordResetTokenType | false> {
  return isValidPasswordResetToken(encodedToken);
}
