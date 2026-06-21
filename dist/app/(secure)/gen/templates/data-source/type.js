import { getInterfaceFields } from '../../utils';
export default ({ index, dsName, columns }) => {
  const { fields, hasYNField, hasDateTime, hasDate, hasTime } = getInterfaceFields(columns, index);
  return `/* Copyright (c) 2024-present Venky Corp. */

import type { ${[hasDateTime && 'ISODateTimeString', hasDate && 'ISODateString', hasTime && 'ISOTimeString']
    .filter(Boolean)
    .join(', ')} } ${'from'} '@/lib/core/common/ds/types/Base';
${hasYNField ? `import type { YN } ${'from'} '@/lib/core/common/ds/types/YN';` : ''}

export interface ${dsName} {
${fields}
}
`;
};
//# sourceMappingURL=type.js.map
