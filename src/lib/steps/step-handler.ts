/**
 * Step Handler - Type definitions and utilities for workflow steps
 * Note: All step logging is now handled by withStepExecution wrapper in workflow-executor.ts
 */
import 'server-only';

import { redactSensitiveData } from '../utils/redact';
import { logWorkflowCompleteDb } from '../workflow-logging';

export type StepContext = {
  executionId?: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  /** Branch key when step runs in a fork branch; absent for main branch */
  branchKey?: string | null;
};

/**
 * Base input type that all steps should extend
 * Adds optional _context for logging
 */
export type StepInput = {
  _context?: StepContext;
};

/**
 * Log workflow execution completion
 * Call this from within a step context to update the overall workflow status
 */
export async function logWorkflowComplete(options: {
  executionId: string;
  status: 'success' | 'error';
  output?: unknown;
  error?: string;
  startTime: number;
}): Promise<void> {
  try {
    const redactedOutput = redactSensitiveData(options.output);

    await logWorkflowCompleteDb({
      executionId: options.executionId,
      status: options.status,
      output: redactedOutput,
      error: options.error,
      startTime: options.startTime,
    });
  } catch (err) {
    console.error('[stepHandler] Failed to log workflow completion:', err);
  }
}
