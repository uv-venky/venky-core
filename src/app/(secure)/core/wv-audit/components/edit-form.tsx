/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useCurrentRowSync } from '@/components/core/hooks/useStoreHooks';
import { DateInputField, NumberInput, TextInput } from '@/components/core/page/fields';
import type { Audit } from '@/lib/common/ds/types/core/Audit';
import type { Store } from '@/lib/core/common/types/Store';

export default function WVAuditEditForm({ store }: { store: Store<Audit> }) {
  const row = useCurrentRowSync(store);
  if (!row || !store) {
    return null;
  }
  return (
    <div className="grid gap-4 py-4">
      <TextInput label="Attribute Code" store={store} attributeCode="attributeCode" />
      <NumberInput label="Audit Id" store={store} attributeCode="auditId" />
      <TextInput label="Datasource Id" store={store} attributeCode="datasourceId" />
      <TextInput label="New Clob Value" store={store} attributeCode="newClobValue" />
      <DateInputField label="New Datetime Value" store={store} attributeCode="newDatetimeValue" />
      <NumberInput label="New Double Value" store={store} attributeCode="newDoubleValue" />
      <TextInput label="New String Value" store={store} attributeCode="newStringValue" />
      <TextInput label="Old Clob Value" store={store} attributeCode="oldClobValue" />
      <DateInputField label="Old Datetime Value" store={store} attributeCode="oldDatetimeValue" />
      <NumberInput label="Old Double Value" store={store} attributeCode="oldDoubleValue" />
      <TextInput label="Old String Value" store={store} attributeCode="oldStringValue" />
      <TextInput label="Pk Value" store={store} attributeCode="pkValue" />
      <TextInput label="Value Type" store={store} attributeCode="valueType" />
    </div>
  );
}
