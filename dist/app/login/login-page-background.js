/** Default Venky login backdrop when no backgroundImageUrl is provided. */
export const DEFAULT_LOGIN_BACKGROUND_CLASS = 'login-backdrop';
export function getLoginPageBackgroundClass(backgroundImageUrl, backgroundClassName) {
    if (backgroundImageUrl) {
        return ['bg-login-backdrop bg-center bg-cover', backgroundClassName].filter(Boolean).join(' ');
    }
    if (backgroundClassName) {
        return backgroundClassName;
    }
    return DEFAULT_LOGIN_BACKGROUND_CLASS;
}
export function getLoginPageBackgroundStyle(backgroundImageUrl) {
    if (!backgroundImageUrl) {
        return undefined;
    }
    return { backgroundImage: `url('${backgroundImageUrl}')` };
}
//# sourceMappingURL=login-page-background.js.map