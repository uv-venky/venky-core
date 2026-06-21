import type { UserSession } from '../../lib/core/common/types/UserSession';
export default function ClientRootLayout({
  children,
  session,
  hideSidebar,
}: Readonly<{
  children: React.ReactNode;
  session: UserSession | null;
  hideSidebar?: boolean;
}>): import('react/jsx-runtime').JSX.Element;
//# sourceMappingURL=client-root-layout-dynamic.d.ts.map
