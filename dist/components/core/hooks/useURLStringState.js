'use client';
import { useURLState } from '../../../components/core/hooks/useURLState';
import { stringDeserialize, stringSerialize } from '../../../components/core/hooks/useURLStateUtils';
export function useURLStringState(key, initialValue, validator) {
    return useURLState(key, initialValue, {
        deserialize: stringDeserialize,
        serialize: stringSerialize,
        validator,
    });
}
//# sourceMappingURL=useURLStringState.js.map