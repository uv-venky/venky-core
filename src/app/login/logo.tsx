import { cn } from '@/lib/utils';
import type { LoginLogoProps } from './login-page-types';
import { VenkyLogoMark } from './venky-logo-mark';

/** Default Venky login header logo: stylized V mark + wordmark. */
export function VenkyLogo({ maxHeight = 58, className, fill = 'var(--logo)' }: LoginLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)} style={{ maxHeight }}>
      <VenkyLogoMark className="h-12 w-12" fill={fill} />
      <span
        className="font-semibold text-3xl text-login-foreground tracking-tight"
        style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}
      >
        Venky
      </span>
    </div>
  );
}

/** @deprecated Use VenkyLogo. Kept for internal compatibility. */
export const Logo = VenkyLogo;
