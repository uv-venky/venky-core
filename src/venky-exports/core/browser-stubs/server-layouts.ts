/* Copyright (c) 2024-present Venky Corp. */
import { makeServerOnlyExport } from './runtime';
const stub = (name: string) => makeServerOnlyExport(name);

export const CommandCenterLayout = stub('CommandCenterLayout');

export default stub('server-layouts-default');
