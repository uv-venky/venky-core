import type { LoginLogoProps } from './login-page-types';
import { VenkyLogoMark } from './venky-logo-mark';

/** Default sidebar / app mini logo: stylized V mark. */
export function MiniLogo({ className, fill = 'var(--logo)' }: LoginLogoProps) {
  return <VenkyLogoMark className={className} fill={fill} />;
}
