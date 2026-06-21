import type { CSSProperties } from 'react';
/** Default Venky login backdrop when no backgroundImageUrl is provided. */
export declare const DEFAULT_LOGIN_BACKGROUND_CLASS = "bg-black bg-[radial-gradient(ellipse_at_15%_15%,rgba(124,92,255,0.45)_0%,transparent_52%),radial-gradient(ellipse_at_85%_85%,rgba(81,46,255,0.3)_0%,transparent_48%)]";
export declare function getLoginPageBackgroundClass(backgroundImageUrl?: string, backgroundClassName?: string): string;
export declare function getLoginPageBackgroundStyle(backgroundImageUrl?: string): CSSProperties | undefined;
//# sourceMappingURL=login-page-background.d.ts.map