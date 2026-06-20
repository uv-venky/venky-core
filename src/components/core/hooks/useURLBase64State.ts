'use client';

import { useURLState } from '@/components/core/hooks/useURLState';
import { base64Deserialize, base64Serialize, type Validator } from '@/components/core/hooks/useURLStateUtils';

export function useURLBase64State(
  key: string,
  initialValue: string,
  validator?: Validator<string>,
): [string, (val: string | ((prev: string) => string)) => void] {
  return useURLState<string>(key, initialValue, {
    deserialize: base64Deserialize,
    serialize: base64Serialize,
    validator,
  });
}
