import { useRef } from 'react';
export default function useConstant(fn) {
    // @ts-expect-error ref.current will not be null
    const ref = useRef();
    if (!ref.current) {
        ref.current = { v: fn() };
    }
    return ref.current.v;
}
//# sourceMappingURL=useConstant.js.map