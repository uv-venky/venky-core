import os from 'node:os';
export function getPrefix() {
  return 'uv_';
}
export const PREFIX = getPrefix();
export function getNodeRunId() {
  return process.env.NODE_RUN_ID || os.hostname();
}
//# sourceMappingURL=constants.js.map
