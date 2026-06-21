'use client';

import { cn } from '@/lib/utils';
import { VenkyLogo } from '../../logo';
import { getLoginPageBackgroundClass, getLoginPageBackgroundStyle } from '../../login-page-background';
import type { LoginPageContentProps } from '../../login-page-types';
import { NewPasswordForm } from '@/components/new-password-form';
import { isValidPasswordResetToken } from '../actions';
import type { ValidPasswordResetTokenType } from '@/app/login/reset-password/types';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Link } from '@/components/core/link';
import { useEffect, useState } from 'react';
import { getErrorMessage, isErrorResponse } from '@/lib/core/common/error';
import { showError } from '@/components/core/common/Notification';

export function ResetPasswordPageContent({
  token,
  logo: LogoComponent = VenkyLogo,
  backgroundImageUrl,
  backgroundClassName,
  className,
}: { token: string } & LoginPageContentProps) {
  const [isValid, setIsValid] = useState<ValidPasswordResetTokenType | false | null>(null);

  useEffect(() => {
    async function checkIsValid() {
      const result = await isValidPasswordResetToken(token);
      if (isErrorResponse(result)) {
        showError(result.message);
        setIsValid(false);
      } else {
        setIsValid(result);
      }
    }
    checkIsValid().catch((error) => {
      showError(getErrorMessage(error));
      setIsValid(false);
    });
  }, [token]);

  if (isValid === null) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className={cn(
        'flex h-screen flex-col overflow-hidden',
        getLoginPageBackgroundClass(backgroundImageUrl, backgroundClassName),
        className,
      )}
      style={getLoginPageBackgroundStyle(backgroundImageUrl)}
    >
      <header className="shrink-0 bg-transparent px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoComponent />
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        {isValid ? (
          <NewPasswordForm token={token} />
        ) : (
          <Alert variant="destructive" className="max-w-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between gap-2">
              Link expired or invalid!
              <Link prefetch={false} href="/login/reset-password" className="text-primary text-sm hover:underline">
                Request a new link
              </Link>
            </AlertTitle>
          </Alert>
        )}
      </main>
    </div>
  );
}
