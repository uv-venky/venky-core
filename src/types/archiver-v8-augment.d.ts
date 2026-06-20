/* Copyright (c) 2024-present Venky Corp. */

/**
 * `@types/archiver` v7 only models `export = archiver` (legacy default invocation).
 * `archiver` v8 is ESM and exposes `{ ZipArchive, TarArchive }` etc. — no default export.
 *
 * Turbopack/Node resolve the named exports; these declarations merge onto module `'archiver'`
 * alongside the DefinitelyTyped typings.
 */

declare module 'archiver' {
  import stream = require('node:stream');

  /** Same `glob()` parameter tuple as `@types/archiver` (GlobOptions isn’t exported on `archiver`). */
  type ArchiverGlobArgs = Parameters<archiver.Archiver['glob']>;

  export class ZipArchive extends stream.Transform {
    constructor(options?: Partial<Pick<archiver.ArchiverOptions, 'zlib' | 'statConcurrency'>>);

    abort(): this;

    append(
      source: stream.Readable | Buffer | string,
      data?: archiver.EntryData | archiver.ZipEntryData | archiver.TarEntryData,
    ): this;

    directory(
      dirpath: string,
      destpath: string | false,
      data?: Partial<archiver.EntryData> | archiver.EntryDataFunction | undefined,
    ): this;

    file(filepath: string, data: archiver.EntryData): this;

    glob(pattern: string, options?: ArchiverGlobArgs[1], data?: ArchiverGlobArgs[2]): this;

    finalize(): Promise<void>;

    pointer(): number;

    symlink(filepath: string, target: string, mode?: number): this;

    on(event: 'error' | 'warning', listener: (error: archiver.ArchiverError) => void): this;
    on(event: 'progress', listener: (progress: archiver.ProgressData) => void): this;
    on(event: 'pipe' | 'unpipe', listener: (src: stream.Readable) => void): this;
    on(event: string, listener: (...args: unknown[]) => void): this;
  }

  /** Present in archiver ≥8 alongside `ZipArchive`; typings mirror `@types/archiver` where applicable. */
  export class TarArchive extends stream.Transform {
    constructor(options?: Partial<Pick<archiver.ArchiverOptions, 'gzip' | 'gzipOptions'>>);

    abort(): this;

    append(source: stream.Readable | Buffer | string, data?: archiver.EntryData | archiver.TarEntryData): this;

    directory(
      dirpath: string,
      destpath: string | false,
      data?: Partial<archiver.EntryData> | archiver.EntryDataFunction | undefined,
    ): this;

    file(filepath: string, data: archiver.EntryData): this;

    glob(pattern: string, options?: ArchiverGlobArgs[1], data?: ArchiverGlobArgs[2]): this;

    finalize(): Promise<void>;

    pointer(): number;

    symlink(filepath: string, target: string, mode?: number): this;

    on(event: 'error' | 'warning', listener: (error: archiver.ArchiverError) => void): this;
    on(event: 'progress', listener: (progress: archiver.ProgressData) => void): this;
    on(event: 'pipe' | 'unpipe', listener: (src: stream.Readable) => void): this;
    on(event: string, listener: (...args: unknown[]) => void): this;
  }
}
