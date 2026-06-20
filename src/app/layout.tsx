import { APP_DESCRIPTION, APP_NAME } from '@/lib/common/ui-constants';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Albert_Sans, Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import AppThemeProvider from './theme-provider';

import './globals.css';

const albertSans = Albert_Sans({
  variable: '--font-albert-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const titlingGothicLight = localFont({
  src: './fonts/TitlingGothicFB-WideLight.otf',
  variable: '--font-titling-gothic-light',
  display: 'swap',
});

const titlingGothicMedium = localFont({
  src: './fonts/TitlingGothicFB-WideMd.otf',
  variable: '--font-titling-gothic-medium',
  display: 'swap',
});

// Use dynamic metadata to prevent static generation
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    icons: {
      icon: '/logo-mini.png',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get('x-nonce');

  return (
    <AppThemeProvider
      nonce={nonce ?? undefined}
      className={cn(
        albertSans.className,
        albertSans.variable,
        geistMono.variable,
        titlingGothicLight.variable,
        titlingGothicMedium.variable,
      )}
    >
      {children}
    </AppThemeProvider>
  );
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
