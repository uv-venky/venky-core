/* Copyright (c) 2024-present Venky Corp. */
import { makeServerOnlyExport } from './runtime';
const stub = (name: string) => makeServerOnlyExport(name);

export const workflowPortal = stub('workflowPortal');
export const adminModules = stub('adminModules');

export default stub('server-sidebar-default');
