/* Copyright (c) 2024-present Venky Corp. */

'use client';

import Suspended from '@/components/core/common/Suspended';
import Filters from '@/components/core/page/filters';
import { Button } from '@/components/ui/button';
import type { UserRoles } from '@/lib/common/ds/types/core/UserRoles';
import type { Store } from '@/lib/core/common/types/Store';
import type { Table } from '@tanstack/react-table';
import { PlusIcon } from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';
import useUserRolesSmartSearchColumns from '../hooks/smart-search-columns';
import UsersLOVCombobox from './user-lov/user-lov-combobox';
import RolesLOVCombobox from './role-lov/role-lov-combobox';
import type { NewRow } from '@/lib/core/common/ds/types/filter';
import { useRows } from '@/components/core/hooks/useStoreHooks';

export function UserRolesFilterBar({
  store,
  table,
  pageId,
  itemId,
  roleCode,
  userName,
}: {
  store: Store<UserRoles>;
  table: Table<UserRoles>;
  pageId: string;
  itemId: string;
  roleCode?: string;
  userName?: string;
}) {
  const smartSearchColumns = useUserRolesSmartSearchColumns({
    roleCode,
    userName,
  });

  const rows = useRows(store);

  const selectedRoles: string[] = useMemo(() => {
    return rows.filter((row) => row._status === 'I').map((row) => row.roleCode ?? '');
  }, [rows]);

  const selectedUsers: string[] = useMemo(() => {
    return rows.filter((row) => row._status === 'I').map((row) => row.userName ?? '');
  }, [rows]);

  const [openEditPopup, setOpenEditPopup] = useState(false);

  return (
    <Suspense fallback={<Suspended name="Filters" />}>
      <div className="flex shrink-0 items-center gap-2">
        <Filters
          border="full"
          columns={smartSearchColumns}
          itemId={itemId}
          pageId={pageId}
          roundedCorners
          store={store}
          table={table}
          disableSavedSearches
        />
        {roleCode && (
          <UsersLOVCombobox
            open={openEditPopup}
            onOpenChange={(open) => {
              setOpenEditPopup(open);
            }}
            trigger={
              <Button
                variant="default"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenEditPopup(true);
                }}
              >
                <PlusIcon className="h-4 w-4" />
                Assign to Users
              </Button>
            }
            onSelect={async (_usernames, users) => {
              const rows: NewRow<UserRoles>[] = users
                .filter((user) => !selectedUsers.includes(user.userName ?? ''))
                .map(
                  (username) =>
                    ({
                      userName: username.userName,
                      roleCode,
                      startDate: new Date().toISOString(),
                      endDate: null,
                      displayName: username.displayName,
                      email: username.email,
                      _status: 'I',
                    }) satisfies NewRow<UserRoles>,
                );
              await store.insertBulk(rows, true);
              // Don't close here - let LOVCombobox handle closing after selection is confirmed
            }}
            roleCode={roleCode}
            value={selectedUsers}
          />
        )}
        {userName && (
          <RolesLOVCombobox
            open={openEditPopup}
            onOpenChange={(open) => {
              setOpenEditPopup(open);
            }}
            trigger={
              <Button
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setOpenEditPopup(true);
                }}
              >
                <PlusIcon className="h-4 w-4" />
                Assign Roles
              </Button>
            }
            onSelect={async (_rolesCodes, roles) => {
              const rows: NewRow<UserRoles>[] = roles
                .filter((role) => !selectedRoles.includes(role.roleCode ?? ''))
                .map(
                  (role) =>
                    ({
                      userName: userName,
                      roleCode: role.roleCode,
                      roleName: role.roleName,
                      startDate: new Date().toISOString(),
                      endDate: null,
                      _status: 'I',
                    }) satisfies NewRow<UserRoles>,
                );
              await store.insertBulk(rows, true);
              // Don't close here - let LOVCombobox handle closing after selection is confirmed
            }}
            userName={userName}
            value={selectedRoles}
          />
        )}
      </div>
    </Suspense>
  );
}
