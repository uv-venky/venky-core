'use client';

import GlobalTooltip from '@/components/core/common/GlobalTooltip';
import { ThemeProvider } from '@/components/theme-provider';
import ToasterComponent from '@/components/core/common/toaster';
import { useClientSession } from '@/components/core/session-context';
import SetupHashListener from '@/components/core/common/SetupHashListener';
import { cn } from '@/lib/utils';
import { InitNextJSCoreHooksSetup } from '@/components/core/InitNextJSCoreHooksSetup';

function useTheme() {
  const session = useClientSession();
  return session?.settings.theme ?? 'system';
}

export default function AppThemeProvider({
  children,
  nonce,
  className,
}: Readonly<{
  children: React.ReactNode;
  nonce: string | undefined;
  className: string;
}>) {
  const theme = useTheme();

  return (
    <html lang="en" className={cn(theme, className)} style={{ colorScheme: theme }} suppressHydrationWarning>
      <body className={`h-screen max-h-screen overflow-auto antialiased`}>
        <InitNextJSCoreHooksSetup />
        <SetupHashListener />
        <ThemeProvider nonce={nonce} attribute="class" defaultTheme={theme} enableSystem disableTransitionOnChange>
          {children}
          <ToasterComponent />
          <div id="tooltip" />
          <GlobalTooltip />
        </ThemeProvider>
      </body>
    </html>
  );
}
