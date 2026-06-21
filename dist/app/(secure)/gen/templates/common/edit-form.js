import { camelCase, startCase } from 'lodash-es';
import { getAttributeType } from '../../utils';
export default ({ dsName, moduleCode, columns, columnOrder, index }) => {
  let hasYN = false;
  const hasTF = false;
  let hasBoolean = false;
  let hasDate = false;
  let hasTime = false;
  let hasNumber = false;
  let hasText = false;
  const cols = columns
    .filter((c) => columnOrder.includes(c.name))
    .sort((a, b) => columnOrder.indexOf(a.name) - columnOrder.indexOf(b.name));
  const fields = cols
    .filter(
      (column) =>
        ![
          'created_by',
          'last_updated_by',
          'creation_date',
          'last_update_date',
          'created_at',
          'updated_at',
          'updated_by',
        ].includes(column.name) &&
        column.name.indexOf('password') === -1 &&
        column.name.indexOf('secret') === -1,
    )
    .map((column) => {
      const type = getAttributeType(column.type, column.maxLength);
      const key = `${camelCase(column.name)}${index ?? ''}`;
      const label = `${startCase(camelCase(column.name))}${index ?? ''}`;
      if (!type || type === 'JSON' || type === 'Polygon' || type === 'Vector' || type === 'TextArray') {
        return `      {/* Ignored column ${column.name} of type ${column.type}! */}\n`;
      }
      switch (type) {
        case 'Date':
          hasDate = true;
          return `      <DateInputField store={store} attributeCode="${key}" label="${label}" />`;
        case 'Time':
          hasTime = true;
          return `      <TimeInputField store={store} attributeCode="${key}" label="${label}" />`;
        case 'Number':
          hasNumber = true;
          return `      <NumberInput store={store} attributeCode="${key}" label="${label}" />`;
        case 'YN':
          hasYN = true;
          return `      <YNInput store={store} attributeCode="${key}" label="${label}" />`;
        // case 'TF':
        //   hasTF = true;
        //   return `      <TFInput store={store} attributeCode="${key}" label="${label}" />`;
        case 'Boolean':
          hasBoolean = true;
          return `      <BooleanInput store={store} attributeCode="${key}" label="${label}" />`;
        default:
          hasText = true;
          return `      <TextInput store={store} attributeCode="${key}" label="${label}" />`;
      }
    })
    .join('\n');
  return `/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useCurrentRowSync } ${'from'} '@/components/core/hooks/useStoreHooks';
import { ${hasBoolean ? 'BooleanInput, ' : ''} ${hasDate ? 'DateInputField, ' : ''} ${hasTime ? 'TimeInputField, ' : ''} ${hasNumber ? 'NumberInput, ' : ''} ${hasYN ? 'YNInput, ' : ''} ${hasTF ? 'TFInput, ' : ''} ${hasText ? 'TextInput, ' : ''} } ${'from'} '@/components/core/page/fields';
import type { ${dsName} } ${'from'} '@/lib/common/ds/types/${moduleCode ? `${moduleCode}/` : ''}${dsName}';
import type {  Store } ${'from'} '@/lib/core/common/types/Store';

export default function ${dsName}EditForm({ store }: { store: Store<${dsName}> }) {
  const row = useCurrentRowSync(store);
  if (!row || !store) {
    return null;
  }
  return (
    <div className="grid gap-4 py-4">
      ${fields.trim()}
    </div>
  );
}
`;
};
//# sourceMappingURL=edit-form.js.map
