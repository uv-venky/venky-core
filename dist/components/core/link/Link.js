/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
let linkComponent = null;
/**
 * Set the Link component for client-side navigation.
 * Call during app init (e.g. InitNextJSCoreHooksSetup for Next.js, core-hooks-setup for TanStack).
 */
export function setLinkComponent(component) {
  linkComponent = component;
}
/**
 * Get the current Link component (or default anchor).
 */
export function getLinkComponent() {
  return linkComponent ?? DefaultLink;
}
function DefaultLink({ href, prefetch: _prefetch, children, ...rest }) {
  return _jsx('a', { href: href, ...rest, children: children });
}
/**
 * Framework-agnostic Link. Uses the component set via setLinkComponent(), or <a> by default.
 */
export function Link(props) {
  const Component = getLinkComponent();
  return _jsx(Component, { ...props });
}
//# sourceMappingURL=Link.js.map
