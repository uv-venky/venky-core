'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { useSearchParams } from '../../components/core/hooks/useSearchParams';
import { LoginForm } from '../../components/login-form';
import { Card, CardContent, CardFooter } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Logo } from './logo';
import { SSOButton } from './signin-button';
import { GoogleSignInButton } from './google-signin-button';
const isGoogleOAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';
export function LoginPageContent() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error');
  return _jsxs('div', {
    className: `flex h-screen flex-col overflow-hidden bg-[url('/images/bg.jpeg')] bg-black bg-center bg-cover`,
    children: [
      _jsx('header', {
        className: 'shrink-0 px-8 py-6',
        children: _jsx('div', { className: 'flex items-center', children: _jsx(Logo, {}) }),
      }),
      _jsx('main', {
        className: 'flex flex-1 items-center justify-end pr-24',
        children: _jsx('div', {
          className: 'w-full max-w-md',
          children: _jsxs('div', {
            className: 'flex flex-col self-center rounded-2xl bg-black/40 p-8 shadow-lg backdrop-blur-md',
            children: [
              errorMessage &&
                _jsx('div', {
                  className: 'mb-4 rounded-md bg-destructive/20 p-3 text-center text-destructive text-sm',
                  children: errorMessage,
                }),
              _jsxs(Tabs, {
                defaultValue: 'client',
                className: 'w-full',
                children: [
                  _jsxs(TabsList, {
                    className: 'grid w-full grid-cols-2 rounded-full bg-gray-800/70 p-1',
                    children: [
                      _jsx(TabsTrigger, {
                        value: 'client',
                        className: 'rounded-full data-[state=active]:bg-primary data-[state=active]:text-white',
                        children: 'Client & Affiliate',
                      }),
                      _jsx(TabsTrigger, {
                        value: 'metro',
                        className: 'rounded-full data-[state=active]:bg-primary data-[state=active]:text-white',
                        children: 'Employee Login',
                      }),
                    ],
                  }),
                  _jsx(TabsContent, { value: 'client', className: 'pt-6', children: _jsx(LoginForm, {}) }),
                  _jsx(TabsContent, {
                    value: 'metro',
                    className: 'pt-6',
                    children: _jsxs(Card, {
                      className: 'border-none bg-black/50 text-white backdrop-blur-md',
                      children: [
                        _jsxs(CardContent, {
                          className: 'flex min-h-[300px] flex-col items-center justify-center space-y-4',
                          children: [
                            _jsx('span', {
                              'data-slot': 'card-title',
                              className: 'font-semibold leading-none',
                              children: 'Metro One SSO Login',
                            }),
                            _jsx('span', {
                              'data-slot': 'card-description',
                              className: 'text-muted-foreground text-sm',
                              children: 'Only accessible via Metro One email addresses.',
                            }),
                          ],
                        }),
                        _jsxs(CardFooter, {
                          className: 'flex flex-col gap-3',
                          children: [
                            _jsx(SSOButton, {}),
                            isGoogleOAuthEnabled &&
                              _jsxs(_Fragment, {
                                children: [
                                  _jsxs('div', {
                                    className: 'flex w-full items-center gap-3',
                                    children: [
                                      _jsx('div', { className: 'h-px flex-1 bg-gray-600' }),
                                      _jsx('span', { className: 'text-gray-400 text-xs', children: 'or' }),
                                      _jsx('div', { className: 'h-px flex-1 bg-gray-600' }),
                                    ],
                                  }),
                                  _jsx(GoogleSignInButton, {}),
                                ],
                              }),
                          ],
                        }),
                      ],
                    }),
                  }),
                ],
              }),
            ],
          }),
        }),
      }),
    ],
  });
}
//# sourceMappingURL=page-content.js.map
