'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useActionState, useEffect, useState } from 'react';
import { changePassword } from '@/app/login/reset-password/actions';
import { toast } from 'sonner';
import { ArrowRight, CheckIcon } from 'lucide-react';
import { Link } from '@/components/core/link';
import { getPasswordRequirements } from '@/lib/common/password-utils';
import { PasswordInput } from './core/page/fields';
import { loginButtonStyles, loginFieldStyles } from './login-form';

export function NewPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(changePassword, undefined);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const requirements = getPasswordRequirements();
  requirements.push({
    label: 'Password matches',
    test: (pwd: string) => pwd.length > 0 && pwd === confirmPassword,
    message: 'Passwords do not match',
  });

  // Helper to check if all requirements are met
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = requirements.every((req) => req.test(password));
  const isFormValid = isPasswordValid && passwordsMatch;

  useEffect(() => {
    if (state) {
      if (state.status === 'OK') {
        toast.success('Password changed');
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  if (state && state.status === 'OK') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password changed</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <span>Your password has been changed successfully.</span>
          <Link prefetch={false} href="/login" className="item-center flex text-primary text-sm hover:underline">
            Login <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-end pr-24">
      <form action={formAction} className="w-full max-w-sm">
        <Card className="border-none bg-black/50 text-white backdrop-blur-md">
          <CardContent className="space-y-4">
            <div className="mb-8 flex items-center justify-center">
              <span className="mx-auto font-title-light text-3xl">Change your password</span>
            </div>
            <PasswordInput
              value={password}
              onChange={(value) => setPassword(value ?? '')}
              labelOnTop
              autoFocus
              autoComplete="new-password"
              placeholder="New Password"
              name="password"
              inputClassName={loginFieldStyles}
            />
            <PasswordInput
              value={confirmPassword}
              onChange={(value) => setConfirmPassword(value ?? '')}
              placeholder="Confirm Password"
              labelOnTop
              autoComplete="new-password"
              name="confirmPassword"
              inputClassName={loginFieldStyles}
            />
            <ul className="mt-1 space-y-1 text-sm">
              {requirements.map((req) => {
                const passed = req.test(password);
                return (
                  <li key={req.label} className="flex items-center gap-2">
                    <span
                      className={`flex size-4 items-center justify-center rounded-full border ${passed ? 'border-green-500 bg-green-500 text-white' : 'border-muted-foreground bg-muted text-muted-foreground'}`}
                    >
                      {passed && <CheckIcon className="size-3" />}
                    </span>
                    <span className={passed ? 'text-green-600' : 'text-muted-foreground'}>{req.label}</span>
                  </li>
                );
              })}
            </ul>
            <input type="hidden" name="token" value={token} />
          </CardContent>
          <CardFooter>
            <Button type="submit" className={loginButtonStyles} disabled={!isFormValid}>
              Change Password
            </Button>
          </CardFooter>
        </Card>
      </form>
    </main>
  );
}
