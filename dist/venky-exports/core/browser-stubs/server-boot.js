/* Copyright (c) 2024-present Venky Corp. */
import { makeServerOnlyExport } from './runtime';
const stub = (name) => makeServerOnlyExport(name);
export const registerCoreInstrumentation = stub('registerCoreInstrumentation');
export const onCoreRequestError = stub('onCoreRequestError');
export const installCoreOomRecorder = stub('installCoreOomRecorder');
export const initVenkyApp = stub('initVenkyApp');
export const clearAppDataSourceCache = stub('clearAppDataSourceCache');
//# sourceMappingURL=server-boot.js.map