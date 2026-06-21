/* Copyright (c) 2024-present Venky Corp. */
import { makeServerOnlyExport } from './runtime';
const stub = (name) => makeServerOnlyExport(name);
export const auth = stub('auth');
export const signIn = stub('signIn');
export const signOut = stub('signOut');
export const refreshToken = stub('refreshToken');
export const hashPassword = stub('hashPassword');
export const getUserRoles = stub('getUserRoles');
export const cacheAutoLoginSession = stub('cacheAutoLoginSession');
export const clearSessionCache = stub('clearSessionCache');
export default stub('auth-default');
//# sourceMappingURL=auth.js.map