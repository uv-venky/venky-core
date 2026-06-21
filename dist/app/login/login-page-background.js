/** Default Venky login backdrop when no backgroundImageUrl is provided. */
export const DEFAULT_LOGIN_BACKGROUND_CLASS = 'bg-black bg-[radial-gradient(ellipse_at_15%_15%,rgba(124,92,255,0.45)_0%,transparent_52%),radial-gradient(ellipse_at_85%_85%,rgba(81,46,255,0.3)_0%,transparent_48%)]';
export function getLoginPageBackgroundClass(backgroundImageUrl, backgroundClassName) {
    if (backgroundImageUrl) {
        return ['bg-black bg-center bg-cover', backgroundClassName].filter(Boolean).join(' ');
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