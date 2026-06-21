import { Link } from '@/components/core/link';
import type { LoginLegalNoticeConfig } from '@/app/login/login-page-types';

export function LoginLegalNotice({ notice }: { notice: LoginLegalNoticeConfig }) {
  const { prefix, termsLink, conjunction = 'and', privacyLink } = notice;

  if (!termsLink && !privacyLink) {
    return null;
  }

  return (
    <p className="mb-4 text-white/50 text-xs">
      {prefix ? <>{prefix} </> : null}
      {termsLink ? (
        <Link prefetch={false} href={termsLink.href}>
          <u className="cursor-pointer">{termsLink.label}</u>
        </Link>
      ) : null}
      {termsLink && privacyLink ? <> {conjunction} </> : null}
      {privacyLink ? (
        <Link prefetch={false} href={privacyLink.href}>
          <u className="cursor-pointer">{privacyLink.label}</u>
        </Link>
      ) : null}
    </p>
  );
}
