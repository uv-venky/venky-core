'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useActionState, useEffect, useId } from 'react';
import { requestPasswordReset } from '../app/login/reset-password/actions';
import { toast } from 'sonner';
import { Link } from '../components/core/link';
import { ArrowLeft } from 'lucide-react';
import { loginButtonStyles, loginFieldStyles } from './login-form';
import { useManualReadySignal } from '../lib/core/client/loading-tracker';
export function ResetPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, undefined);
  const emailId = useId();
  const usernameId = useId();
  const manualReadySignal = useManualReadySignal();
  useEffect(() => {
    manualReadySignal();
  }, [manualReadySignal]);
  useEffect(() => {
    if (state) {
      if (state.status === 'OK') {
        toast.success('Password reset email sent');
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);
  if (state && state.status === 'OK') {
    return _jsxs(Card, {
      children: [
        _jsxs(CardHeader, {
          children: [
            _jsx(CardTitle, { children: 'Reset Password' }),
            _jsx(CardDescription, {
              children: 'Password reset email will be sent to your email address if it exists.',
            }),
          ],
        }),
        _jsx(CardContent, {
          className: 'space-y-4',
          children: _jsx('span', {
            children:
              'Please check your email for a reset link provided we have an account for the given username and email.',
          }),
        }),
      ],
    });
  }
  return _jsx('main', {
    className: 'flex flex-1 items-center justify-end pr-24',
    children: _jsx('form', {
      action: formAction,
      className: 'w-full max-w-sm',
      children: _jsxs(Card, {
        className: 'border-none bg-black/50 text-white backdrop-blur-md',
        children: [
          _jsxs(CardContent, {
            className: 'min-h-[300px] space-y-4',
            children: [
              _jsx('div', {
                className: 'mb-8 flex items-center justify-center',
                children: _jsx('span', { className: 'mx-auto font-title-light text-3xl', children: 'Reset Password' }),
              }),
              _jsx(Input, {
                id: usernameId,
                name: 'username',
                placeholder: 'Username',
                type: 'text',
                required: true,
                autoComplete: 'username',
                autoFocus: true,
                className: loginFieldStyles,
              }),
              _jsx(Input, {
                id: emailId,
                name: 'email',
                type: 'email',
                required: true,
                placeholder: 'Email',
                autoComplete: 'email',
                className: loginFieldStyles,
              }),
            ],
          }),
          _jsxs(CardFooter, {
            className: 'flex flex-col gap-2',
            children: [
              _jsx(Button, { type: 'submit', className: loginButtonStyles, children: 'Send Reset Link' }),
              _jsxs(Link, {
                prefetch: false,
                href: '/login',
                className: 'flex items-center justify-center text-primary text-sm hover:text-white hover:underline',
                children: [_jsx(ArrowLeft, { className: 'mr-2 h-4 w-4' }), ' Back to login'],
              }),
            ],
          }),
        ],
      }),
    }),
  });
}
//# sourceMappingURL=reset-password-form.js.map
