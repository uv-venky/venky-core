'use client';
import { useURLState } from '../../../components/core/hooks/useURLState';
import { base64Deserialize, base64Serialize } from '../../../components/core/hooks/useURLStateUtils';
export function useURLBase64State(key, initialValue, validator) {
    return useURLState(key, initialValue, {
        deserialize: base64Deserialize,
        serialize: base64Serialize,
        validator,
    });
}
//# sourceMappingURL=useURLBase64State.js.map