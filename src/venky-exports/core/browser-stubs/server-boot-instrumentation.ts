/* Copyright (c) 2024-present Venky Corp. */

import { makeServerOnlyExport } from './runtime';

const stub = (name: string) => makeServerOnlyExport(name);

export const registerCoreInstrumentation = stub('registerCoreInstrumentation');
export const onCoreRequestError = stub('onCoreRequestError');
