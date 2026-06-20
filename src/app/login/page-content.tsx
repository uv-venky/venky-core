'use client';

import { useSearchParams } from '@/components/core/hooks/useSearchParams';
import { LoginForm } from '@/components/login-form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from './logo';
import { SSOButton } from './signin-button';
import { GoogleSignInButton } from './google-signin-button';

const isGoogleOAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';

export function LoginPageContent() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error');

  return (
    <div className={`flex h-screen flex-col overflow-hidden bg-[url('/images/bg.jpeg')] bg-black bg-center bg-cover`}>
      <header className="shrink-0 px-8 py-6">
        <div className="flex items-center">
          <Logo />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-end pr-24">
        <div className="w-full max-w-md">
          <div className="flex flex-col self-center rounded-2xl bg-black/40 p-8 shadow-lg backdrop-blur-md">
            {errorMessage && (
              <div className="mb-4 rounded-md bg-destructive/20 p-3 text-center text-destructive text-sm">
                {errorMessage}
              </div>
            )}
            <Tabs defaultValue="client" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-full bg-gray-800/70 p-1">
                <TabsTrigger
                  value="client"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Client & Affiliate
                </TabsTrigger>
                {
                  <TabsTrigger
                    value="metro"
                    className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Employee Login
                  </TabsTrigger>
                }
              </TabsList>
              <TabsContent value="client" className="pt-6">
                <LoginForm />
              </TabsContent>
              <TabsContent value="metro" className="pt-6">
                <Card className="border-none bg-black/50 text-white backdrop-blur-md">
                  <CardContent className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
                    <span data-slot="card-title" className="font-semibold leading-none">
                      Metro One SSO Login
                    </span>
                    <span data-slot="card-description" className="text-muted-foreground text-sm">
                      Only accessible via Metro One email addresses.
                    </span>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                    <SSOButton />
                    {isGoogleOAuthEnabled && (
                      <>
                        <div className="flex w-full items-center gap-3">
                          <div className="h-px flex-1 bg-gray-600" />
                          <span className="text-gray-400 text-xs">or</span>
                          <div className="h-px flex-1 bg-gray-600" />
                        </div>
                        <GoogleSignInButton />
                      </>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
