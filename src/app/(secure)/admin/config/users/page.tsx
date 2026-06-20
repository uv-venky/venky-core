/* Copyright (c) 2024-present Venky Corp. */

import type { Metadata } from 'next';
import { UsersPage } from './UsersPage';
import { APP_NAME } from '@/lib/common/ui-constants';

export const metadata: Metadata = {
  title: `Users | Admin | ${APP_NAME}`,
  description: `Manage user accounts and permissions for ${APP_NAME}`,
};

export default function Page() {
  return <UsersPage />;
}
