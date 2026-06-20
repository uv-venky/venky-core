import type { StringKeyof } from '@/lib/core/common/ds/types/filter.js';

export type ReferenceMapping<T extends object, R extends object> = {
  code: StringKeyof<T>;
  refCode: StringKeyof<R>;
};
