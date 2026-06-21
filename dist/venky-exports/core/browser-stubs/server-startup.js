/* Copyright (c) 2024-present Venky Corp. */
import { makeServerOnlyExport } from './runtime';
const stub = (name) => makeServerOnlyExport(name);
export const startup = stub('startup');
export default stub('server-startup-default');
//# sourceMappingURL=server-startup.js.map
