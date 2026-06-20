/* Copyright (c) 2024-present Venky Corp. */
import { makeServerOnlyExport } from './runtime';
const stub = (name: string) => makeServerOnlyExport(name);

export const initializeServer = stub('initializeServer');
export default stub('server-init-default');
