/* Copyright (c) 2024-present Venky Corp. */
import { makeServerOnlyExport } from './runtime';
const stub = (name: string) => makeServerOnlyExport(name);

export const authenticateAction = stub('authenticateAction');
export const requestPasswordResetAction = stub('requestPasswordResetAction');
export const isValidPasswordResetTokenAction = stub('isValidPasswordResetTokenAction');
export const changePasswordAction = stub('changePasswordAction');

export default stub('server-actions-default');
