/* Copyright (c) 2024-present Venky Corp. */
import { makeServerOnlyExport } from './runtime';
const stub = makeServerOnlyExport('logger');
export default stub;
export const logger = stub;
//# sourceMappingURL=server-logger.js.map