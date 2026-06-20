'use client'; // Only this component is client-side

import { useRouter } from '@/components/core/hooks/useRouter';
import { useSearchParams } from '@/components/core/hooks/useSearchParams';
import { Button } from '@/components/ui/button';
import { loginButtonStyles } from '@/components/login-form';

export function SSOButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceUrl = searchParams.get('sourceUrl') ?? '/';

  return (
    <div className="w-full">
      <Button
        activityId="login-sso-signin"
        className={loginButtonStyles}
        onClick={() => router.push(`/api/auth/sso?RelayState=${sourceUrl}`)}
      >
        Sign In
      </Button>
    </div>
  );
}
