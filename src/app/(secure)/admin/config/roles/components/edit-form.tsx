/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useCurrentRowSync } from '@/components/core/hooks/useStoreHooks';
import { DateInputField, TextInput } from '@/components/core/page/fields';
import type { Roles } from '@/lib/common/ds/types/core/Roles';
import type { Store } from '@/lib/core/common/types/Store';

export default function RolesEditForm({ store }: { store: Store<Roles> }) {
  const row = useCurrentRowSync(store);
  if (!row || !store) {
    return null;
  }
  const fromDB = store.isRowFromDB(store.rowId(row));
  return (
    <div className="grid gap-4">
      <TextInput disabled={fromDB} label="Role Code" store={store} attributeCode="roleCode" />
      <TextInput label="Role Name" required store={store} attributeCode="roleName" />
      <DateInputField label="Start Date" store={store} attributeCode="startDate" />
      <DateInputField label="End Date" store={store} attributeCode="endDate" />
      <TextInput label="Description" store={store} attributeCode="description" />
    </div>
  );
}
