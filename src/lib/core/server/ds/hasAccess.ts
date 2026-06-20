/* Copyright (c) 2024-present Venky Corp. */

import type { DataSource } from '@/lib/core/common/ds/types/DataSource';
import type { Session } from '@/auth';

export async function hasAccess<T extends object>(
  ds: DataSource<T>,
  session: Session,
  accessType: 'Query' | 'Update' | 'Insert' | 'Delete' | 'Export' | 'Audit',
): Promise<boolean> {
  if (ds.access?.length === 0) {
    return false;
  }
  // check if the user has access to the data source
  return ds.access.some((a) => {
    if (a.roleCode === 'all_users' && session.user.userName !== 'guest') {
      // all users access
    } else if (!session.user.roles.includes(a.roleCode)) {
      return false;
    }
    switch (accessType) {
      case 'Query':
        return a.query;
      case 'Update':
        return a.update;
      case 'Insert':
        return a.insert;
      case 'Delete':
        return a.delete;
      case 'Export':
        return a.export;
      case 'Audit':
        return a.audit;
    }
    return false;
  });
}
