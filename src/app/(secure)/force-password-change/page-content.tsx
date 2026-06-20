'use client';

import { useState } from 'react';
import { useRouter } from '@/components/core/hooks/useRouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { changePasswordForced } from './actions';
import { CheckIcon, Loader2, Shield } from 'lucide-react';
import { getPasswordRequirements } from '@/lib/common/password-utils';
import { getErrorMessage } from '@/lib/core/common/error';
import { showError } from '@/components/core/common';
import { PasswordInput } from '@/components/core/page';

export function ForcePasswordChangePageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (formData: FormData) => {
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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Password Changed Successfully</CardTitle>
            <CardDescription>Your password has been updated. You will be redirected shortly.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const requirements = getPasswordRequirements();
  requirements.push({
    label: 'Password matches',
    test: (pwd: string) => pwd.length > 0 && pwd === confirmPassword,
    message: 'Passwords do not match',
  });

  return (
    <form action={handleSubmit}>
      <div className="flex h-screen items-center justify-center overflow-hidden py-4">
        <Card className="max-h-full w-full max-w-md overflow-hidden">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Shield className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Password Change Required</CardTitle>
            <CardDescription>For security reasons, you must change your password before continuing.</CardDescription>
          </CardHeader>
          <CardContent className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 space-y-4 overflow-y-auto">
            <div className="space-y-4">
              <PasswordInput
                label="Current Password"
                labelOnTop
                autoFocus
                autoComplete="current-password"
                name="currentPassword"
              />
              <PasswordInput
                value={password}
                onChange={(value) => setPassword(value ?? '')}
                label="New Password"
                labelOnTop
                autoComplete="new-password"
                name="newPassword"
              />
              <PasswordInput
                value={confirmPassword}
                onChange={(value) => setConfirmPassword(value ?? '')}
                label="Confirm Password"
                labelOnTop
                autoComplete="new-password"
                name="confirmPassword"
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
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
