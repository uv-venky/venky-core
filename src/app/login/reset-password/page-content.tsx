'use client';

import { Logo } from '../logo';
import { ResetPasswordForm } from '@/components/reset-password-form';
// import { usePageReadySignal } from '@/lib/core/client/use-data-loading-tracker';
// import { useEffect } from 'react';

export function ResetPasswordPageContent() {
  // const signalReady = usePageReadySignal();

  // useEffect(() => {
  //   signalReady();
  // }, [signalReady]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[url('/images/bg.jpeg')] bg-center bg-cover">
      <header className="shrink-0 bg-transparent px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <ResetPasswordForm />
      </main>
    </div>
  );
}
