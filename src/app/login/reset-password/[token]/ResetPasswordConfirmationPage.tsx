'use client';

import { use } from 'react';
import { ResetPasswordPageContent } from './page-content';

export function ResetPasswordConfirmationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <ResetPasswordPageContent token={token} />;
}
