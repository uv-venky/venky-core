'use client';
import { useURLState } from '../../../components/core/hooks/useURLState';
import { intDeserialize, intSerialize } from '../../../components/core/hooks/useURLStateUtils';
export function useURLIntState(key, initialValue, validator) {
    return useURLState(key, initialValue, {
        deserialize: intDeserialize,
        serialize: intSerialize,
        validator,
    });
}
//# sourceMappingURL=useURLIntState.js.map