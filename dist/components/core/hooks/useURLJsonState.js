'use client';
import { useURLState } from '../../../components/core/hooks/useURLState';
import { jsonDeserialize, jsonSerialize } from '../../../components/core/hooks/useURLStateUtils';
export function useURLJsonState(key, initialValue, validator) {
    return useURLState(key, initialValue, {
        deserialize: jsonDeserialize,
        serialize: jsonSerialize,
        validator,
    });
}
//# sourceMappingURL=useURLJsonState.js.map