/* Copyright (c) 2024-present Venky Corp. */
import { makeServerOnlyExport } from './runtime';
const stub = (name) => makeServerOnlyExport(name);
export const DefaultDataSource = stub('DefaultDataSource');
export const DefaultAttribute = stub('DefaultAttribute');
export const DefaultCalculatedAttribute = stub('DefaultCalculatedAttribute');
export const DefaultFullAccess = stub('DefaultFullAccess');
export const DefaultReadOnlyAccess = stub('DefaultReadOnlyAccess');
export default stub('ds-default');
//# sourceMappingURL=ds.js.map