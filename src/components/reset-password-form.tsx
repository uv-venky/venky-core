'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useActionState, useEffect, useId } from 'react';
import { requestPasswordReset } from '@/app/login/reset-password/actions';
import { toast } from 'sonner';
import { Link } from '@/components/core/link';
import { ArrowLeft } from 'lucide-react';
import { loginButtonStyles, loginFieldStyles } from './login-form';
import { useManualReadySignal } from '@/lib/core/client/loading-tracker';

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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Password reset email will be sent to your email address if it exists.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <span>
            Please check your email for a reset link provided we have an account for the given username and email.
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-end pr-24">
      <form action={formAction} className="w-full max-w-sm">
        <Card className="border-none bg-black/50 text-white backdrop-blur-md">
          <CardContent className="min-h-[300px] space-y-4">
            <div className="mb-8 flex items-center justify-center">
              <span className="mx-auto font-title-light text-3xl">Reset Password</span>
            </div>
            <Input
              id={usernameId}
              name="username"
              placeholder="Username"
              type="text"
              required
              autoComplete="username"
              autoFocus
              className={loginFieldStyles}
            />
            <Input
              id={emailId}
              name="email"
              type="email"
              required
              placeholder="Email"
              autoComplete="email"
              className={loginFieldStyles}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className={loginButtonStyles}>
              Send Reset Link
            </Button>
            <Link
              prefetch={false}
              href="/login"
              className="flex items-center justify-center text-primary text-sm hover:text-white hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
            </Link>
          </CardFooter>
        </Card>
      </form>
    </main>
  );
}
