/* Copyright (c) 2024-present Venky Corp. */
import { makeServerOnlyExport } from './runtime';
const stub = (name) => makeServerOnlyExport(name);
export const CommandCenterLayout = stub('CommandCenterLayout');
export default stub('server-layouts-default');
//# sourceMappingURL=server-layouts.js.map
