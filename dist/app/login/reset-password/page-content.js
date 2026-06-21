'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Logo } from '../logo';
import { ResetPasswordForm } from '../../../components/reset-password-form';
// import { usePageReadySignal } from '@/lib/core/client/use-data-loading-tracker';
// import { useEffect } from 'react';
export function ResetPasswordPageContent() {
  // const signalReady = usePageReadySignal();
  // useEffect(() => {
  //   signalReady();
  // }, [signalReady]);
  return _jsxs('div', {
    className: "flex h-screen flex-col overflow-hidden bg-[url('/images/bg.jpeg')] bg-center bg-cover",
    children: [
      _jsx('header', {
        className: 'shrink-0 bg-transparent px-6 py-3',
        children: _jsx('div', {
          className: 'mx-auto flex max-w-7xl items-center justify-between',
          children: _jsx('div', { className: 'flex items-center gap-4', children: _jsx(Logo, {}) }),
        }),
      }),
      _jsx('main', { className: 'flex flex-1 items-center justify-center p-6', children: _jsx(ResetPasswordForm, {}) }),
    ],
  });
}
//# sourceMappingURL=page-content.js.map
