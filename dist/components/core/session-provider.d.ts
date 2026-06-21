import type { UserSession } from '../../lib/core/common/types/UserSession';
import type { UserSettings } from '../../lib/core/common/types/UserSettings';
import { type ReactNode } from 'react';
export declare function SessionProvider({ children, session: initialSession, onSettingsChange, }: {
    children: ReactNode;
    session: UserSession;
    onSettingsChange?: (key: keyof UserSettings, value: unknown) => void;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=session-provider.d.ts.map