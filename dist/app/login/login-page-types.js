export const DEFAULT_LOGIN_TABS = [
    { id: 'client', label: 'Client & Affiliate', type: 'credentials' },
    {
        id: 'metro',
        label: 'Employee Login',
        type: 'sso',
        ssoTitle: 'Metro One SSO Login',
        ssoDescription: 'Only accessible via Metro One email addresses.',
    },
];
/** Legacy Metro One default; pass via `legalNotice` when needed. */
export const DEFAULT_LOGIN_LEGAL_NOTICE = {
    prefix: 'By Signing In, I have read, and I understand and agree To the',
    termsLink: { label: 'M1 Terms for Use', href: '#' },
    conjunction: 'and',
    privacyLink: { label: 'Data Privacy Notice', href: '#' },
};
//# sourceMappingURL=login-page-types.js.map