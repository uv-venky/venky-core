/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useCurrentRowSync } from '@/components/core/hooks/useStoreHooks';
import { DateInputField, TextInput } from '@/components/core/page/fields';
import type { UserRoles } from '@/lib/common/ds/types/core/UserRoles';
import type { Store } from '@/lib/core/common/types/Store';

export default function UserRolesEditForm({ store }: { store: Store<UserRoles> }) {
  const row = useCurrentRowSync(store);
  if (!row || !store) {
    return null;
  }
  return (
    <div className="grid gap-4 py-4">
      <TextInput label="User Name" store={store} attributeCode="userName" />
      <TextInput label="Role Code" store={store} attributeCode="roleCode" />
      <DateInputField label="Start Date" store={store} attributeCode="startDate" />
      <DateInputField label="End Date" store={store} attributeCode="endDate" />
    </div>
  );
}
