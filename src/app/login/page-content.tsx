'use client';

import { useSearchParams } from '@/components/core/hooks/useSearchParams';
import { LoginForm } from '@/components/login-form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { VenkyLogo } from './logo';
import { getLoginPageBackgroundClass, getLoginPageBackgroundStyle } from './login-page-background';
import {
  DEFAULT_LOGIN_TABS,
  type LoginLegalNoticeConfig,
  type LoginPageContentProps,
  type LoginTabConfig,
} from './login-page-types';
import { SSOButton } from './signin-button';
import { GoogleSignInButton } from './google-signin-button';

const isGoogleOAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';

function SsoLoginPanel({ tab }: { tab: LoginTabConfig }) {
  return (
    <Card className="border-none bg-login-card text-login-foreground backdrop-blur-md">
      <CardContent className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
        <span data-slot="card-title" className="font-semibold leading-none">
          {tab.ssoTitle ?? 'SSO Login'}
        </span>
        {tab.ssoDescription ? (
          <span data-slot="card-description" className="text-muted-foreground text-sm">
            {tab.ssoDescription}
          </span>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <SSOButton />
        {isGoogleOAuthEnabled && (
          <>
            <div className="flex w-full items-center gap-3">
              <div className="h-px flex-1 bg-login-muted/40" />
              <span className="text-login-muted text-xs">or</span>
              <div className="h-px flex-1 bg-login-muted/40" />
            </div>
            <GoogleSignInButton />
          </>
        )}
      </CardFooter>
    </Card>
  );
}

function renderLoginTabContent(tab: LoginTabConfig, legalNotice?: LoginLegalNoticeConfig) {
  if (tab.type === 'sso') {
    return <SsoLoginPanel tab={tab} />;
  }
  return <LoginForm legalNotice={legalNotice} />;
}

const TAB_GRID_CLASS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

function LoginTabs({ tabs, legalNotice }: { tabs: LoginTabConfig[]; legalNotice?: LoginLegalNoticeConfig }) {
  const defaultTab = tabs[0]?.id ?? 'client';

  if (tabs.length === 1) {
    return <div className="pt-0">{renderLoginTabContent(tabs[0], legalNotice)}</div>;
  }

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList
        className={cn(
          'grid w-full rounded-full bg-login-input-bg/80 p-1',
          TAB_GRID_CLASS[tabs.length] ?? 'grid-cols-2',
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="pt-6">
          {renderLoginTabContent(tab, legalNotice)}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function LoginPageContent({
  logo: LogoComponent = VenkyLogo,
  backgroundImageUrl,
  backgroundClassName,
  className,
  tabs = DEFAULT_LOGIN_TABS,
  legalNotice,
}: LoginPageContentProps = {}) {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error');
  const loginTabs = tabs.length > 0 ? tabs : DEFAULT_LOGIN_TABS;

  return (
    <div
      className={cn(
        'flex h-screen flex-col overflow-hidden',
        getLoginPageBackgroundClass(backgroundImageUrl, backgroundClassName),
        className,
      )}
      style={getLoginPageBackgroundStyle(backgroundImageUrl)}
    >
      <header className="shrink-0 px-8 py-6">
        <div className="flex items-center">
          <LogoComponent />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-end pr-24">
        <div className="w-full max-w-md">
          <div className="flex flex-col self-center rounded-2xl bg-login-card/80 p-8 shadow-lg backdrop-blur-md">
            {errorMessage && (
              <div className="mb-4 rounded-md bg-destructive/20 p-3 text-center text-destructive text-sm">
                {errorMessage}
              </div>
            )}
            <LoginTabs tabs={loginTabs} legalNotice={legalNotice} />
          </div>
        </div>
      </main>
    </div>
  );
}
