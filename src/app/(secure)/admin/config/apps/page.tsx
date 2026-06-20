/* Copyright (c) 2024-present Venky Corp. */

import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/common/ui-constants';
import { AppsPage } from './AppsPage';

export const metadata: Metadata = {
  title: `Apps | Admin | ${APP_NAME}`,
  description: `Manage application configuration for ${APP_NAME}`,
};

export default function Page() {
  return <AppsPage />;
}
