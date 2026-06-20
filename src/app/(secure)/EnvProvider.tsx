'use client';
/* Copyright (c) 2024-present VENKY Corp. */

import type * as React from 'react';
import { createContext, useContext } from 'react';

export type Env = {
  APP_ID: string;
  CLOUDIO_API_URL?: string;
};
const EnvContext = createContext<Env>({
  APP_ID: 'APP_ID_NOT_SET',
});

export function useEnv(): Env {
  return useContext(EnvContext);
}

export function EnvProvider({ children, env }: { children: React.ReactNode; env: Env }) {
  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
}
