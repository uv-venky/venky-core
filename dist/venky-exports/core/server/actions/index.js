'use server';
import { authenticate } from '../../../../app/login/actions';
import {
  changePassword,
  isValidPasswordResetToken,
  requestPasswordReset,
} from '../../../../app/login/reset-password/actions';
/**
 * Form/unauthenticated server actions for login and password reset.
 * Use useMutation('updateProfile') and useMutation('signOut') for authenticated actions.
 */
export async function authenticateAction(_prevState, formData) {
  return authenticate(_prevState, formData);
}
export async function requestPasswordResetAction(_prevState, formData) {
  return requestPasswordReset(_prevState, formData);
}
export async function changePasswordAction(_prevState, formData) {
  return changePassword(_prevState, formData);
}
export async function isValidPasswordResetTokenAction(encodedToken) {
  return isValidPasswordResetToken(encodedToken);
}
//# sourceMappingURL=index.js.map
