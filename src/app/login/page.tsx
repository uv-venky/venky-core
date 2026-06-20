import type { Metadata } from 'next';
import { redirect } from '@/lib/core/server/redirect';
import { LoginPageContent } from './page-content';
import { auth } from '@/auth';
import { APP_NAME } from '@/lib/common/ui-constants';

export const metadata: Metadata = {
  title: `Sign In | ${APP_NAME}`,
  description: `Sign in to your ${APP_NAME} account`,
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ sourceUrl?: string }> }) {
  const session = await auth(true);
  const resolvedSearchParams = await searchParams;
  const sourceUrl = resolvedSearchParams.sourceUrl ?? '/';

  if (session) {
    redirect(sourceUrl);
    return null;
  }
  if (process.env.CLOUDIO_LOGIN_URL) {
    redirect(process.env.CLOUDIO_LOGIN_URL);
    return null;
  }

  return <LoginPageContent />;
}
