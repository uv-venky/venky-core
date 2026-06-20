/* Copyright (c) 2024-present Venky Corp. */
'use client';

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

let linkComponent: LinkComponent | null = null;

/**
 * Set the Link component for client-side navigation.
 * Call during app init (e.g. InitNextJSCoreHooksSetup for Next.js, core-hooks-setup for TanStack).
 */
export function setLinkComponent(component: LinkComponent): void {
  linkComponent = component;
}

/**
 * Get the current Link component (or default anchor).
 */
export function getLinkComponent(): LinkComponent {
  return linkComponent ?? DefaultLink;
}

function DefaultLink({ href, prefetch: _prefetch, children, ...rest }: AppLinkProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

/**
 * Framework-agnostic Link. Uses the component set via setLinkComponent(), or <a> by default.
 */
export function Link(props: AppLinkProps) {
  const Component = getLinkComponent();
  return <Component {...props} />;
}
