'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { useState } from 'react';
import { useRouter } from '../../../components/core/hooks/useRouter';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { changePasswordForced } from './actions';
import { CheckIcon, Loader2, Shield } from 'lucide-react';
import { getPasswordRequirements } from '../../../lib/common/password-utils';
import { getErrorMessage } from '../../../lib/core/common/error';
import { showError } from '../../../components/core/common';
import { PasswordInput } from '../../../components/core/page';
export function ForcePasswordChangePageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const result = await changePasswordForced(formData);
      if (result.status === 'OK') {
        setSuccess(true);
        // Redirect to dashboard after successful password change
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        showError(result.message);
      }
    } catch (error) {
      showError(`Unexpected error: ${getErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  if (success) {
    return _jsx('div', {
      className: 'flex min-h-screen items-center justify-center',
      children: _jsx(Card, {
        className: 'w-full max-w-md',
        children: _jsxs(CardHeader, {
          className: 'text-center',
          children: [
            _jsx('div', {
              className: 'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100',
              children: _jsx(Shield, { className: 'h-6 w-6 text-green-600' }),
            }),
            _jsx(CardTitle, { className: 'text-2xl', children: 'Password Changed Successfully' }),
            _jsx(CardDescription, { children: 'Your password has been updated. You will be redirected shortly.' }),
          ],
        }),
      }),
    });
  }
  const requirements = getPasswordRequirements();
  requirements.push({
    label: 'Password matches',
    test: (pwd) => pwd.length > 0 && pwd === confirmPassword,
    message: 'Passwords do not match',
  });
  return _jsx('form', {
    action: handleSubmit,
    children: _jsx('div', {
      className: 'flex h-screen items-center justify-center overflow-hidden py-4',
      children: _jsxs(Card, {
        className: 'max-h-full w-full max-w-md overflow-hidden',
        children: [
          _jsxs(CardHeader, {
            className: 'text-center',
            children: [
              _jsx('div', {
                className: 'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100',
                children: _jsx(Shield, { className: 'h-6 w-6 text-amber-600' }),
              }),
              _jsx(CardTitle, { className: 'text-2xl', children: 'Password Change Required' }),
              _jsx(CardDescription, {
                children: 'For security reasons, you must change your password before continuing.',
              }),
            ],
          }),
          _jsx(CardContent, {
            className:
              'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 space-y-4 overflow-y-auto',
            children: _jsxs('div', {
              className: 'space-y-4',
              children: [
                _jsx(PasswordInput, {
                  label: 'Current Password',
                  labelOnTop: true,
                  autoFocus: true,
                  autoComplete: 'current-password',
                  name: 'currentPassword',
                }),
                _jsx(PasswordInput, {
                  value: password,
                  onChange: (value) => setPassword(value ?? ''),
                  label: 'New Password',
                  labelOnTop: true,
                  autoComplete: 'new-password',
                  name: 'newPassword',
                }),
                _jsx(PasswordInput, {
                  value: confirmPassword,
                  onChange: (value) => setConfirmPassword(value ?? ''),
                  label: 'Confirm Password',
                  labelOnTop: true,
                  autoComplete: 'new-password',
                  name: 'confirmPassword',
                }),
                _jsx('ul', {
                  className: 'mt-1 space-y-1 text-sm',
                  children: requirements.map((req) => {
                    const passed = req.test(password);
                    return _jsxs(
                      'li',
                      {
                        className: 'flex items-center gap-2',
                        children: [
                          _jsx('span', {
                            className: `flex size-4 items-center justify-center rounded-full border ${passed ? 'border-green-500 bg-green-500 text-white' : 'border-muted-foreground bg-muted text-muted-foreground'}`,
                            children: passed && _jsx(CheckIcon, { className: 'size-3' }),
                          }),
                          _jsx('span', {
                            className: passed ? 'text-green-600' : 'text-muted-foreground',
                            children: req.label,
                          }),
                        ],
                      },
                      req.label,
                    );
                  }),
                }),
              ],
            }),
          }),
          _jsx(CardFooter, {
            children: _jsx(Button, {
              type: 'submit',
              className: 'w-full',
              disabled: isLoading,
              children: isLoading
                ? _jsxs(_Fragment, {
                    children: [_jsx(Loader2, { className: 'mr-2 h-4 w-4 animate-spin' }), 'Changing Password...'],
                  })
                : 'Change Password',
            }),
          }),
        ],
      }),
    }),
  });
}
//# sourceMappingURL=page-content.js.map
