'use client';

import { cn } from '@/lib/utils';
import { VenkyLogo } from '../logo';
import { getLoginPageBackgroundClass, getLoginPageBackgroundStyle } from '../login-page-background';
import type { LoginPageContentProps } from '../login-page-types';
import { ResetPasswordForm } from '@/components/reset-password-form';

export function ResetPasswordPageContent({
  logo: LogoComponent = VenkyLogo,
  backgroundImageUrl,
  backgroundClassName,
  className,
}: LoginPageContentProps = {}) {
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
        <ResetPasswordForm />
      </main>
    </div>
  );
}
