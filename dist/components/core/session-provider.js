'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { deepUnwrap } from '../../lib/core/common/deepUtils';
import { areEqualShallow } from '../../lib/core/common/isEmpty';
import { useEffect, useState } from 'react';
import { proxy, subscribe } from 'valtio';
import { userSessionState } from '../../components/core/hooks/useClientSessionSnapshot';
import { SessionContext } from '../../components/core/session-context';
export function SessionProvider({ children, session: initialSession, onSettingsChange, }) {
    const [session, setSession] = useState(initialSession);
    useEffect(() => {
        // break readonly/frozen/server reference
        const mutableSession = deepUnwrap(initialSession);
        // ensure valtio owns nested graph
        userSessionState.session = proxy(mutableSession);
    }, [initialSession]);
    useEffect(() => {
        return subscribe(userSessionState, () => {
            if (userSessionState.session) {
                setSession({ ...userSessionState.session });
            }
        });
    }, []);
    useEffect(() => {
        if (!onSettingsChange)
            return;
        let previousSettings = deepUnwrap(userSessionState.session?.settings);
        return subscribe(userSessionState, () => {
            const newSettings = userSessionState.session?.settings;
            if (newSettings && !areEqualShallow(previousSettings, newSettings)) {
                for (const key in newSettings) {
                    // @ts-expect-error - key is valid
                    const value = newSettings[key];
                    // @ts-expect-error - key is valid
                    const oldValue = previousSettings?.[key];
                    if (value !== oldValue) {
                        onSettingsChange(key, value);
                    }
                }
                previousSettings = deepUnwrap(newSettings);
            }
        });
    }, [onSettingsChange]);
    return _jsx(SessionContext.Provider, { value: session, children: children });
}
//# sourceMappingURL=session-provider.js.map