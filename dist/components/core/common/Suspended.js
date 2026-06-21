'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { WaveDots } from '../../../components/core/common/WaveDots';
import clientLogger from '../../../lib/core/client/client-logger';
const debug = false;
export default function Suspended({ name }) {
    if (debug && clientLogger.isDebugEnabled) {
        clientLogger.debug({ message: 'Suspended.render', name });
    }
    useEffect(() => {
        if (!debug || !clientLogger.isDebugEnabled) {
            return;
        }
        clientLogger.debug({ message: 'Suspended.mount', name });
        return () => {
            clientLogger.debug({ message: 'Suspended.unmount', name });
        };
    }, [name]);
    return _jsx(WaveDots, { active: true, reason: name });
}
//# sourceMappingURL=Suspended.js.map