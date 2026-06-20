'use client';

import { useURLState } from '@/components/core/hooks/useURLState';
import { stringDeserialize, stringSerialize, type Validator } from '@/components/core/hooks/useURLStateUtils';

export function useURLStringState<T extends string>(
  key: string,
  initialValue: string,
  validator?: Validator<T>,
): [T, (val: T | ((prev: T) => T)) => void] {
  return useURLState<T>(key, initialValue as T, {
    deserialize: stringDeserialize,
    serialize: stringSerialize,
    validator,
  });
}
