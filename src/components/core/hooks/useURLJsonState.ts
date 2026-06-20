'use client';

import { useURLState } from '@/components/core/hooks/useURLState';
import { jsonDeserialize, jsonSerialize, type Validator } from '@/components/core/hooks/useURLStateUtils';

export function useURLJsonState<T>(
  key: string,
  initialValue: T,
  validator?: Validator<T>,
): [T, (val: T | ((prev: T) => T)) => void] {
  return useURLState<T>(key, initialValue, {
    deserialize: jsonDeserialize,
    serialize: jsonSerialize,
    validator,
  });
}
