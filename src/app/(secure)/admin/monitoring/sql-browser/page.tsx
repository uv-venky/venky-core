/* Copyright (c) 2024-present Venky Corp. */

import type { Metadata } from 'next';
import { auth } from '@/auth';
import { APP_NAME } from '@/lib/common/ui-constants';
import { SQLBrowserPage } from './SQLBrowserPage';
import { redirect } from '@/lib/core/server/redirect';

export const metadata: Metadata = {
  title: `SQL Browser | Admin | ${APP_NAME}`,
  description: `Execute and explore SQL queries for ${APP_NAME}`,
};

export default async function Page() {
  const session = await auth(true);

  if (!session) {
    redirect('/login');
  }

  const isAdmin = session.user.roles.includes('admin');
  if (!isAdmin) {
    redirect('/access-denied?message=Access restricted to admins.');
  }

  return <SQLBrowserPage />;
}
