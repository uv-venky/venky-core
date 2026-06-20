import os from 'node:os';

export function getPrefix(): string {
  return 'uv_';
}

export const PREFIX = getPrefix();

export function getNodeRunId(): string {
  return process.env.NODE_RUN_ID || os.hostname();
}
