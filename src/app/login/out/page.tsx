import { redirect } from '@/lib/core/server/redirect';
import { decrypt } from '@/lib/core/server/secure';

function isAllowedLogoutUrl(url: URL): boolean {
  if (url.protocol === 'https:') {
    return true;
  }

  return process.env.NODE_ENV !== 'production' && url.protocol === 'http:' && url.hostname === 'localhost';
}

export default async function Logout({ searchParams }: { searchParams: Promise<{ sso?: string }> }) {
  const { sso } = await searchParams;

  if (sso) {
    try {
      const logoutUrl = await decrypt(sso);
      const parsedUrl = new URL(logoutUrl);
      if (isAllowedLogoutUrl(parsedUrl)) {
        redirect(parsedUrl.toString());
      }
    } catch {
      // Fall back to the signed out page when the token is invalid.
    }
  }

  return <div className="flex h-screen items-center justify-center bg-background text-foreground">Signed out...</div>;
}
