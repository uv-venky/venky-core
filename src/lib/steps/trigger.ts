/**
 * Trigger step - handles trigger execution with proper logging
 * Also handles workflow completion when called with _workflowComplete
 */
import 'server-only';

import { logWorkflowComplete, type StepInput } from './step-handler';
import logger from '@/lib/core/server/logger';

type TriggerResult = {
  success: true;
  data: Record<string, unknown>;
};

export type TriggerInput = StepInput & {
  triggerData: Record<string, unknown>;
  /** If set, this call is just to log workflow completion (no trigger execution) */
  _workflowComplete?: {
    executionId: string;
    status: 'success' | 'error';
    output?: unknown;
    error?: string;
    startTime: number;
  };
};

/**
 * Trigger logic - just passes through the trigger data
 */
function executeTrigger(input: TriggerInput): TriggerResult {
  return {
    success: true,
    data: input.triggerData,
  };
}

/**
 * Trigger Step
 * Executes a trigger and logs it properly
 * Also handles workflow completion when called with _workflowComplete
 */
export async function triggerStep(input: TriggerInput): Promise<TriggerResult> {
  if (logger.debugEnabled) {
    logger.debug('[triggerStep] Starting trigger step');
  }
  // If this is a completion-only call, just log workflow completion
  if (input._workflowComplete) {
    if (logger.debugEnabled) {
      logger.debug('[triggerStep] Handling workflow completion');
    }
    await logWorkflowComplete(input._workflowComplete);
    return { success: true, data: {} };
  }

  if (logger.debugEnabled) {
    logger.debug('[triggerStep] Executing normal trigger');
  }
  // Normal trigger execution (logging handled by withStepExecution wrapper)
  const result = executeTrigger(input);
  if (logger.debugEnabled) {
    logger.debug('[triggerStep] Trigger step completed');
  }
  return result;
}
triggerStep.maxRetries = 0;
