/* Copyright (c) 2024-present Venky Corp. */
const err = (name: string) => new Error(`[venky-core] Server-only export "${name}" was imported in a browser bundle.`);

const thrower = (name: string) =>
  new Proxy(function serverOnlyStub() {}, {
    get(_target, prop) {
      if (prop === Symbol.toStringTag) return 'ServerOnlyStub';
      if (prop === 'then') return undefined;
      throw err(name);
    },
    apply() {
      throw err(name);
    },
    construct() {
      throw err(name);
    },
  });

export const makeServerOnlyExport = (name: string) => thrower(name);
