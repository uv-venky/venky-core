import type { AnchorHTMLAttributes, ReactNode } from 'react';
/**
 * Framework-agnostic Link props.
 * Core uses href; adapters map to framework (e.g. Next.js href, TanStack to).
 */
export interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    href: string;
    prefetch?: boolean;
    children?: ReactNode;
}
export type LinkComponent = React.ComponentType<AppLinkProps>;
/**
 * Set the Link component for client-side navigation.
 * Call during app init (e.g. InitNextJSCoreHooksSetup for Next.js, core-hooks-setup for TanStack).
 */
export declare function setLinkComponent(component: LinkComponent): void;
/**
 * Get the current Link component (or default anchor).
 */
export declare function getLinkComponent(): LinkComponent;
/**
 * Framework-agnostic Link. Uses the component set via setLinkComponent(), or <a> by default.
 */
export declare function Link(props: AppLinkProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Link.d.ts.map