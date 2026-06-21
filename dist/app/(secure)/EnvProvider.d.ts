import type * as React from 'react';
export type Env = {
    APP_ID: string;
    CLOUDIO_API_URL?: string;
};
export declare function useEnv(): Env;
export declare function EnvProvider({ children, env }: {
    children: React.ReactNode;
    env: Env;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=EnvProvider.d.ts.map