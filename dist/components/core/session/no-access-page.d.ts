export interface NoAccessPageProps {
    /**
     * When true, notifies the loading tracker on mount (matches core default secure layout usage).
     */
    reportReadyToLoadingTracker?: boolean;
    /** Sign-out handler returning redirect URL. Defaults to the `signOut` work action. */
    signOut?: () => Promise<string | undefined>;
}
/**
 * Shown when the user has no application access. If the session later includes a navigable team,
 * redirects to that landing URL.
 */
export declare function NoAccessPage({ reportReadyToLoadingTracker, signOut: signOutProp }: NoAccessPageProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=no-access-page.d.ts.map