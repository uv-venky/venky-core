import { auth } from '@/auth';
import { redirect } from '@/lib/core/server/redirect';
import { LoginPageContent } from './page-content';

export async function LoginPage() {
  const session = await auth(true);

  if (session) {
    redirect('/');
    return null;
  }
  if (process.env.CLOUDIO_LOGIN_URL) {
    redirect(process.env.CLOUDIO_LOGIN_URL);
    return null;
  }

  return <LoginPageContent />;
}
