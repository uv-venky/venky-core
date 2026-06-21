'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { use } from 'react';
import { ResetPasswordPageContent } from './page-content';
export function ResetPasswordConfirmationPage({ params }) {
  const { token } = use(params);
  return _jsx(ResetPasswordPageContent, { token: token });
}
//# sourceMappingURL=ResetPasswordConfirmationPage.js.map
