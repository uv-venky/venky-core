'use client';

import { useURLState } from '@/components/core/hooks/useURLState';
import { intDeserialize, intSerialize, type Validator } from '@/components/core/hooks/useURLStateUtils';

export function useURLIntState(
  key: string,
  initialValue: number,
  validator?: Validator<number>,
): [number, (val: number | ((prev: number) => number)) => void] {
  return useURLState<number>(key, initialValue, {
    deserialize: intDeserialize,
    serialize: intSerialize,
    validator,
  });
}
