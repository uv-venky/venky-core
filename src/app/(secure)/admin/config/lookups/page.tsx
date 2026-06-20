/* Copyright (c) 2024-present Venky Corp. */

import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/common/ui-constants';
import { LookupsPage } from './LookupsPage';

export const metadata: Metadata = {
  title: `Lookups | Admin | ${APP_NAME}`,
  description: `Manage lookup types and values for ${APP_NAME}`,
};

export default function Page() {
  return <LookupsPage />;
}
