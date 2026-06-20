import 'server-only';

/** No-op stub — workflow execution logging removed from venky-core. */
export async function logWorkflowCompleteDb(_options: {
  executionId: string;
  status: 'success' | 'error';
  output?: unknown;
  error?: string;
  startTime: number;
}): Promise<void> {}
