/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useCurrentRowSync } from '@/components/core/hooks/useStoreHooks';
import { BooleanInput, DatePickerField, PasswordInput, TextInput } from '@/components/core/page/fields';
import type { Users } from '@/lib/common/ds/types/core/Users';
import type { Store } from '@/lib/core/common/types/Store';
import { CopyRolesFromUserField } from './CopyRolesFromUserField';
import { useCopyRolesContext } from './CopyRolesContext';
import { useEffect } from 'react';

export default function UsersEditForm({ store }: { store: Store<Users> }) {
  const row = useCurrentRowSync(store);
  const { setCopyRolesFromUser } = useCopyRolesContext();

  // Reset copy roles selection when editing an existing user
  useEffect(() => {
    if (row && store) {
      const fromDB = store.isRowFromDB(store.rowId(row));
      if (fromDB) {
        setCopyRolesFromUser(undefined);
      }
    }
  }, [row, store, setCopyRolesFromUser]);

  if (!row || !store) {
    return null;
  }
  const fromDB = store.isRowFromDB(store.rowId(row));
  return (
    <div className="grid gap-4">
      <TextInput label="Display Name" store={store} attributeCode="displayName" required />
      <TextInput
        disabled={fromDB}
        transformValue={(value) => value?.toLowerCase().trim()}
        store={store}
        attributeCode="email"
        label="Email"
        required
      />
      <TextInput
        disabled={fromDB}
        transformValue={(value) => value?.toLowerCase().trim()}
        store={store}
        attributeCode="userName"
        label="User Name"
        required
      />
      {!fromDB && (
        <>
          <PasswordInput
            label="Password"
            store={store}
            attributeCode="password"
            helpText="Leave blank to autogenerate a new password"
          />
          <BooleanInput label="Send New User Email" store={store} attributeCode="sendNewUserEmail" />
        </>
      )}
      <DatePickerField label="Start Date" store={store} attributeCode="startDate" required />
      <DatePickerField label="End Date" store={store} attributeCode="endDate" />
      <TextInput label="Location Name" store={store} attributeCode="locationName" />
      {fromDB && <BooleanInput label="Locked" store={store} attributeCode="locked" />}
      <BooleanInput label="Force Password Change" store={store} attributeCode="forcePasswordChange" />
      {!fromDB && <CopyRolesFromUserField />}
    </div>
  );
}
