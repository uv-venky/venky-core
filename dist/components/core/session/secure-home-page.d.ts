export interface SecureHomePageProps {
    /** Path when the user has no teams or no landing URL. Default `/no-access`. */
    noAccessPath?: string;
}
/**
 * Redirects from `/home` to the first navigable team URL (same rules as the team switcher),
 * or to `noAccessPath` when there is nowhere to go.
 */
export declare function SecureHomePage({ noAccessPath }: SecureHomePageProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=secure-home-page.d.ts.map