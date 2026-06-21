import type { ComponentType, CSSProperties } from 'react';

/** Props for the login header logo and default Venky mini logo. */
export interface LoginLogoProps {
  className?: string;
  /** Primary accent color for the logo mark. */
  fill?: string;
  /** Max height in px for the full header logo. */
  maxHeight?: number;
}

export type LoginLogoComponent = ComponentType<LoginLogoProps>;

export type LoginTabType = 'credentials' | 'sso';

export interface LoginTabConfig {
  id: string;
  label: string;
  type: LoginTabType;
  /** SSO tab only. */
  ssoTitle?: string;
  /** SSO tab only. */
  ssoDescription?: string;
}

export const DEFAULT_LOGIN_TABS: LoginTabConfig[] = [
  { id: 'client', label: 'Client & Affiliate', type: 'credentials' },
  {
    id: 'metro',
    label: 'Employee Login',
    type: 'sso',
    ssoTitle: 'Metro One SSO Login',
    ssoDescription: 'Only accessible via Metro One email addresses.',
  },
];

export interface LoginLegalLink {
  label: string;
  href: string;
}

/** Optional terms / privacy notice below the login fields. Omit to hide. */
export interface LoginLegalNoticeConfig {
  /** Text before the first link. */
  prefix?: string;
  termsLink?: LoginLegalLink;
  /** Text between links. Default: "and" */
  conjunction?: string;
  privacyLink?: LoginLegalLink;
}

/** Legacy Metro One default; pass via `legalNotice` when needed. */
export const DEFAULT_LOGIN_LEGAL_NOTICE: LoginLegalNoticeConfig = {
  prefix: 'By Signing In, I have read, and I understand and agree To the',
  termsLink: { label: 'M1 Terms for Use', href: '#' },
  conjunction: 'and',
  privacyLink: { label: 'Data Privacy Notice', href: '#' },
};

export interface LoginPageContentProps {
  /** Optional logo component for the login header. Defaults to VenkyLogo. */
  logo?: LoginLogoComponent;
  /** Background image URL served from the consumer app public folder, e.g. `/images/login-bg.jpg`. */
  backgroundImageUrl?: string;
  /** Extra classes merged into the page backdrop (with default gradient or image layout). */
  backgroundClassName?: string;
  /** Extra classes on the outer page container. */
  className?: string;
  /**
   * Login tabs shown above the form. Defaults to credentials + SSO tabs.
   * Pass a single tab to hide the switcher and show one login mode only.
   */
  tabs?: LoginTabConfig[];
  /** Optional terms/privacy notice under the password field. Omit to hide. */
  legalNotice?: LoginLegalNoticeConfig;
}

export type LoginPageBackgroundStyle = CSSProperties | undefined;
