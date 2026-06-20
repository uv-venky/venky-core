/**
 * API Client for making type-safe API calls to the backend
 * Replaces server actions with API endpoints
 */

import type { IntegrationType } from './types/integration';
import type { WorkflowEdge, WorkflowNode } from './workflow-store';

// Workflow data types
export type WorkflowVisibility = 'private' | 'public';

export type WorkflowData = {
  id?: string;
  name?: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  visibility?: WorkflowVisibility;
};

export type SavedWorkflow = WorkflowData & {
  id: string;
  name: string;
  visibility: WorkflowVisibility;
  createdAt: string;
  updatedAt: string;
  isOwner?: boolean;
};

// API error class
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Helper function to make API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }

  return response.json();
}

// AI API

type StreamMessage = {
  type: 'operation' | 'complete' | 'error';
  operation?: {
    op: 'setName' | 'setDescription' | 'addNode' | 'addEdge' | 'removeNode' | 'removeEdge' | 'updateNode';
    name?: string;
    description?: string;
    node?: unknown;
    edge?: unknown;
    nodeId?: string;
    edgeId?: string;
    updates?: {
      position?: { x: number; y: number };
      data?: unknown;
    };
  };
  error?: string;
};

type StreamState = {
  buffer: string;
  currentData: WorkflowData;
};

type OperationHandler = (op: StreamMessage['operation'], state: StreamState) => void;

function handleSetName(op: StreamMessage['operation'], state: StreamState): void {
  if (op?.name) {
    state.currentData.name = op.name;
  }
}

function handleSetDescription(op: StreamMessage['operation'], state: StreamState): void {
  if (op?.description) {
    state.currentData.description = op.description;
  }
}

function handleAddNode(op: StreamMessage['operation'], state: StreamState): void {
  if (op?.node) {
    state.currentData.nodes = [...state.currentData.nodes, op.node as WorkflowNode];
  }
}

function handleAddEdge(op: StreamMessage['operation'], state: StreamState): void {
  if (op?.edge) {
    state.currentData.edges = [...state.currentData.edges, op.edge as WorkflowEdge];
  }
}

function handleRemoveNode(op: StreamMessage['operation'], state: StreamState): void {
  if (op?.nodeId) {
    state.currentData.nodes = state.currentData.nodes.filter((n) => n.id !== op.nodeId);
    state.currentData.edges = state.currentData.edges.filter((e) => e.source !== op.nodeId && e.target !== op.nodeId);
  }
}

function handleRemoveEdge(op: StreamMessage['operation'], state: StreamState): void {
  if (op?.edgeId) {
    state.currentData.edges = state.currentData.edges.filter((e) => e.id !== op.edgeId);
  }
}

function handleUpdateNode(op: StreamMessage['operation'], state: StreamState): void {
  if (op?.nodeId && op.updates) {
    state.currentData.nodes = state.currentData.nodes.map((n) => {
      if (n.id === op.nodeId) {
        return {
          ...n,
          ...(op.updates?.position ? { position: op.updates.position } : {}),
          ...(op.updates?.data ? { data: { ...n.data, ...op.updates.data } } : {}),
        };
      }
      return n;
    });
  }
}

const operationHandlers: Record<string, OperationHandler> = {
  setName: handleSetName,
  setDescription: handleSetDescription,
  addNode: handleAddNode,
  addEdge: handleAddEdge,
  removeNode: handleRemoveNode,
  removeEdge: handleRemoveEdge,
  updateNode: handleUpdateNode,
};

function applyOperation(op: StreamMessage['operation'], state: StreamState): void {
  if (!op?.op) {
    return;
  }

  const handler = operationHandlers[op.op];
  if (handler) {
    handler(op, state);
  }
}

function processStreamLine(line: string, onUpdate: (data: WorkflowData) => void, state: StreamState): void {
  if (!line.trim()) {
    return;
  }

  try {
    const message = JSON.parse(line) as StreamMessage;

    if (message.type === 'operation' && message.operation) {
      applyOperation(message.operation, state);
      onUpdate({ ...state.currentData });
    } else if (message.type === 'error') {
      console.error('[API Client] Error:', message.error);
      throw new Error(message.error);
    }
  } catch (error) {
    console.error('[API Client] Failed to parse JSONL line:', error);
  }
}

function processStreamChunk(
  value: Uint8Array,
  decoder: TextDecoder,
  onUpdate: (data: WorkflowData) => void,
  state: StreamState,
): void {
  state.buffer += decoder.decode(value, { stream: true });

  // Process complete JSONL lines
  const lines = state.buffer.split('\n');
  state.buffer = lines.pop() || '';

  for (const line of lines) {
    processStreamLine(line, onUpdate, state);
  }
}

export const aiApi = {
  generate: (
    prompt: string,
    existingWorkflow?: {
      nodes: WorkflowNode[];
      edges: WorkflowEdge[];
      name?: string;
    },
  ) =>
    apiCall<WorkflowData>('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, existingWorkflow }),
    }),
  generateStream: async (
    prompt: string,
    onUpdate: (data: WorkflowData) => void,
    existingWorkflow?: {
      nodes: WorkflowNode[];
      edges: WorkflowEdge[];
      name?: string;
    },
  ): Promise<WorkflowData> => {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, existingWorkflow }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const state: StreamState = {
      buffer: '',
      currentData: existingWorkflow
        ? {
            nodes: existingWorkflow.nodes || [],
            edges: existingWorkflow.edges || [],
            name: existingWorkflow.name,
          }
        : { nodes: [], edges: [] },
    };

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        processStreamChunk(value, decoder, onUpdate, state);
      }

      return state.currentData;
    } finally {
      reader.releaseLock();
    }
  },
};

// Integration type (for backward compatibility)
// Use Integrations from datasource types for new code
// Note: config is Record<string, unknown> to match datasource type
export type Integration = {
  id: string;
  name: string;
  type: IntegrationType;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

// Integration API
// Note: CRUD operations (getAll, get, create, update, delete) are handled by useIntegrationsStore
// This API only provides server-side operations that can't be handled by the datasource
export const integrationApi = {
  // Test connection (server-side operation that requires API route)
  testConnection: (integrationId: string) =>
    apiCall<{ status: 'success' | 'error'; message: string }>(`/api/integrations/${integrationId}/test`, {
      method: 'POST',
    }),
};

// Workflow API
// Note: CRUD operations (getAll, getById, create, update, delete) are now handled by useWorkflowsStore
export const workflowApi = {
  // Duplicate a workflow (special operation)
  duplicate: (id: string) =>
    apiCall<SavedWorkflow>(`/api/workflows/${id}/duplicate`, {
      method: 'POST',
    }),

  // Delete executions (server-side operation)
  deleteExecutions: (id: string) =>
    apiCall<{ success: boolean; deletedCount: number }>(`/api/workflows/${id}/executions`, {
      method: 'DELETE',
    }),
};

// Export all APIs as a single object
export const api = {
  ai: aiApi,
  integration: integrationApi,
  workflow: workflowApi,
};
