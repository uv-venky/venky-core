/* Copyright (c) 2024-present Venky Corp. */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { isAbortedRequestError } from '@/lib/core/common/error';

/**
 * On-disk crash dumper for OOM postmortem.
 *
 * What this DOES catch:
 *   • Uncaught synchronous exceptions
 *   • Unhandled promise rejections
 *   • Voluntary process.exit(code) with non-zero code
 *
 * What this DOES NOT catch:
 *   • V8 heap-out-of-memory aborts. V8 calls abort() directly and JS-level
 *     listeners do not fire. The only mitigation there is a periodic sample
 *     (see memory-sampler) so you have data up to ~5 min before the crash,
 *     plus Node's --report-on-fatalerror flag which produces a diagnostic
 *     report file on V8 abort (we recommend enabling it at the launcher).
 *
 * Output: a JSON file per crash in VENKY_OOM_DIR (defaults to <tmp>/venky-oom).
 * The memory-sampler job recovers these files into uv_memory_samples on its
 * next periodic run.
 */

const OOM_DIR = process.env.VENKY_OOM_DIR ?? path.join(os.tmpdir(), 'venky-oom');

export interface CrashDump {
  ts: string;
  pid: number;
  uptimeSec: number;
  reason: 'uncaughtException' | 'unhandledRejection' | 'exit';
  error?: { message: string; stack?: string } | { code: number };
  mem: NodeJS.MemoryUsage;
}

export function getOomDir(): string {
  return OOM_DIR;
}

function ensureDir(): void {
  try {
    fs.mkdirSync(OOM_DIR, { recursive: true });
  } catch {
    // best effort — if /tmp is unwritable there's nothing we can do
  }
}

// Distinct prefix so it's trivial to grep in CloudWatch:
//   fields @timestamp, @message | filter @message like /VENKY_OOM_DUMP/
const STDERR_TAG = 'VENKY_OOM_DUMP';

function writeCrashSync(dump: CrashDump): void {
  const json = JSON.stringify(dump);

  // 1. stderr first — on Fargate the container disk dies with the task,
  // but the awslogs driver flushes stderr to CloudWatch. process.stderr.write
  // is synchronous on a pipe/file (and stays sync even while exiting), so a
  // dying process still gets the line out. One line so log shipping doesn't
  // split it.
  try {
    process.stderr.write(`${STDERR_TAG} ${json}\n`);
  } catch {
    // exiting anyway
  }

  // 2. Disk dump — useful in environments where the filesystem outlives the
  // process (dev, EC2, persistent volumes). The sampler drains these into
  // uv_memory_samples on its next run. On Fargate this is best-effort and
  // typically lost, which is fine because stderr already carried the data.
  try {
    const file = path.join(OOM_DIR, `oom-${dump.pid}-${Date.now()}.json`);
    fs.writeFileSync(file, json, { encoding: 'utf8' });
  } catch {
    // exiting anyway
  }
}

function buildDump(reason: CrashDump['reason'], error?: Error | { code: number } | unknown): CrashDump {
  return {
    ts: new Date().toISOString(),
    pid: process.pid,
    uptimeSec: Math.round(process.uptime()),
    reason,
    error:
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : typeof error === 'object' && error !== null && 'code' in error
          ? { code: (error as { code: number }).code }
          : undefined,
    mem: process.memoryUsage(),
  };
}

let installed = false;
export function installOomRecorder(): void {
  if (installed) return;
  installed = true;
  ensureDir();

  // 'uncaughtExceptionMonitor' lets us OBSERVE the error without overriding
  // Node's default behavior. If nothing else handles it Node still terminates
  // normally with its usual stack trace; if some other layer (e.g. Next.js)
  // has its own handler the process keeps running as before. Registering
  // 'uncaughtException' would suppress the default exit and force us to
  // decide — which we got wrong once already (see git history).
  process.on('uncaughtExceptionMonitor', (err) => {
    // Aborted HTTP requests are routine (browser cancelling an in-flight
    // request on navigation). Skip them or we'd spam uv_memory_samples.
    if (isAbortedRequestError(err)) return;
    writeCrashSync(buildDump('uncaughtException', err));
  });

  process.on('unhandledRejection', (reason) => {
    if (isAbortedRequestError(reason)) return;
    writeCrashSync(buildDump('unhandledRejection', reason));
  });

  process.on('exit', (code) => {
    // Skip clean (0) and signal-induced graceful exits — Node uses 128+N for
    // signals. 130=SIGINT (Ctrl+C, HMR restart in dev), 143=SIGTERM (Fargate
    // task stop / docker stop), 129=SIGHUP. These are restarts, not crashes,
    // and we don't want them polluting the crash count.
    if (GRACEFUL_EXIT_CODES.has(code)) return;
    writeCrashSync(buildDump('exit', { code }));
  });
}

const GRACEFUL_EXIT_CODES = new Set<number>([0, 129, 130, 143]);

/** Read and delete all crash dumps. Returns the parsed dumps. */
export function drainCrashDumps(): CrashDump[] {
  let names: string[] = [];
  try {
    names = fs.readdirSync(OOM_DIR).filter((n) => n.startsWith('oom-') && n.endsWith('.json'));
  } catch {
    return [];
  }
  const dumps: CrashDump[] = [];
  for (const name of names) {
    const file = path.join(OOM_DIR, name);
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const parsed = JSON.parse(raw) as CrashDump;
      dumps.push(parsed);
    } catch {
      // bad file — leave it for manual cleanup, don't delete blindly
      continue;
    }
    try {
      fs.unlinkSync(file);
    } catch {
      // already gone, ok
    }
  }
  return dumps;
}
