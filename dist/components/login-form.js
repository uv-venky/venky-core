'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';
import { authenticate } from '../app/login/actions';
import { useSearchParams } from '../components/core/hooks/useSearchParams';
import { useActionState, useEffect, useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PasswordInput } from './core/page/fields';
import { useManualReadySignal } from '../lib/core/client/loading-tracker';
import { Link } from '../components/core/link';
export const loginFieldStyles = cn(
  'h-12 w-full rounded-md border-primary bg-black text-white placeholder:text-white placeholder:opacity-80 focus-visible:border-primary focus-visible:ring-primary/50',
);
export const loginButtonStyles = cn(
  'h-[70px] w-full rounded-full bg-primary px-3 py-4 text-2xl text-white transition-colors hover:bg-[#4120D9]',
);
export function LoginForm({ className, ...props }) {
  const [result, dispatch] = useActionState(authenticate, undefined);
  const searchParams = useSearchParams();
  // Store sourceUrl in a ref to persist it through form submission
  const sourceUrlRef = useRef(searchParams.get('sourceUrl') ?? '/');
  const userId = useId();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const manualReadySignal = useManualReadySignal();
  useEffect(() => {
    manualReadySignal();
  }, [manualReadySignal]);
  // Update ref when searchParams changes to ensure we have the latest sourceUrl
  useEffect(() => {
    const sourceUrl = searchParams.get('sourceUrl') ?? '/';
    if (sourceUrl !== sourceUrlRef.current) {
      sourceUrlRef.current = sourceUrl;
    }
  }, [searchParams]);
  useEffect(() => {
    if (result) {
      if (result.status === 'ERROR') {
        toast.error(result.message);
      } else {
        toast.success('Login successful!');
        const redirectUrl = sourceUrlRef.current;
        // Use window.location.href for a hard redirect to ensure it's not intercepted
        window.location.href = redirectUrl;
      }
    }
  }, [result]);
  if (result && result.status !== 'ERROR') {
    return null;
  }
  return _jsxs('form', {
    action: dispatch,
    children: [
      _jsx('input', { type: 'hidden', name: 'sourceUrl', value: sourceUrlRef.current }),
      _jsxs(Card, {
        className: 'border-none bg-black/50 text-white backdrop-blur-md',
        children: [
          _jsx(CardContent, {
            className: 'min-h-[300px] space-y-4',
            children: _jsx('div', {
              className: cn('flex flex-col gap-6 rounded', className),
              ...props,
              children: _jsxs('div', {
                className: 'flex flex-col gap-6',
                children: [
                  _jsx('span', { className: 'mx-auto font-light font-title-light text-4xl', children: 'Sign In' }),
                  _jsx('div', {
                    className: 'grid gap-3',
                    children: _jsx('div', {
                      className: 'relative flex w-full items-center justify-between',
                      children: _jsx(Input, {
                        name: 'userName',
                        id: userId,
                        placeholder: 'User Name',
                        className: loginFieldStyles,
                        required: true,
                        minLength: 3,
                        autoComplete: 'username',
                        'data-testid': 'email-input',
                        autoFocus: true,
                        value: userName,
                        onChange: (e) => setUserName(e.target.value),
                      }),
                    }),
                  }),
                  _jsxs('div', {
                    className: 'grid gap-3',
                    children: [
                      _jsx(PasswordInput, {
                        labelOnTop: true,
                        autoComplete: 'current-password',
                        name: 'password',
                        dataTestId: 'password-input',
                        minLength: 5,
                        placeholder: 'Password',
                        inputClassName: loginFieldStyles,
                        value: password,
                        onChange: (value) => setPassword(value ?? ''),
                      }),
                      _jsx('div', {
                        className: 'relative flex w-full items-center justify-end',
                        children: _jsx(Link, {
                          prefetch: false,
                          href: '/login/reset-password',
                          className: 'text-sm hover:underline',
                          children: 'Trouble logging in?',
                        }),
                      }),
                    ],
                  }),
                  _jsxs('p', {
                    className: 'mb-4 text-white/50 text-xs',
                    children: [
                      'By Signing In,I have read,and I understand and agree To the',
                      ' ',
                      _jsx(Link, {
                        prefetch: false,
                        href: '#',
                        children: _jsx('u', { className: 'cursor-pointer', children: 'M1 Terms for Use' }),
                      }),
                      ' ',
                      'and',
                      ' ',
                      _jsx(Link, {
                        prefetch: false,
                        href: '#',
                        children: _jsx('u', { className: 'cursor-pointer', children: 'Data Privacy Notice' }),
                      }),
                    ],
                  }),
                ],
              }),
            }),
          }),
          _jsx(CardFooter, {
            className: 'flex flex-col space-y-2',
            children: _jsx(Button, {
              activityId: 'login-form-sign-in',
              type: 'submit',
              className: loginButtonStyles,
              'data-testid': 'sign-in-button',
              children: 'Sign In',
            }),
          }),
        ],
      }),
    ],
  });
}
//# sourceMappingURL=login-form.js.map
