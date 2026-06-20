import type { Edge, EdgeChange, Node, NodeChange } from '@xyflow/react';
import { applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import { atom } from 'jotai';

export type WorkflowNodeType = 'trigger' | 'action' | 'add' | 'fork' | 'join';

export type WorkflowNodeData = {
  label: string;
  description?: string;
  type: WorkflowNodeType;
  config?: Record<string, unknown>;
  status?: 'idle' | 'running' | 'paused' | 'success' | 'error';
  enabled?: boolean; // Whether the step is enabled (defaults to true)
  onClick?: () => void; // For the "add" node type
  /** Display-only: true when node is between a Fork and its Join (runs in parallel). Not persisted. */
  isInForkBranch?: boolean;
  /** Display-only: when viewing an execution, number of parallel runs for this node (fork branch). Not persisted. */
  forkBranchCount?: number;
  /** Transient: last step output for the selected execution (e.g. run details viewer). Not persisted. */
  executionOutput?: unknown;
};

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

// Workflow visibility type
export type WorkflowVisibility = 'private' | 'public';

// Atoms for workflow state (now backed by database)
export const nodesAtom = atom<WorkflowNode[]>([]);
export const edgesAtom = atom<WorkflowEdge[]>([]);
export const selectedNodeAtom = atom<string | null>(null);
export const selectedEdgeAtom = atom<string | null>(null);
export const isExecutingAtom = atom(false);
export const isLoadingAtom = atom(false);
export const isGeneratingAtom = atom(false);
export const currentWorkflowVisibilityAtom = atom<WorkflowVisibility>('private');
export const isWorkflowOwnerAtom = atom<boolean>(true); // Whether current user owns this workflow

// UI state atoms
export const propertiesPanelActiveTabAtom = atom<string>('properties');
export const showMinimapAtom = atom(false);
export const selectedExecutionIdAtom = atom<string | null>(null);
export const rightPanelWidthAtom = atom<string | null>(null);
export const isPanelAnimatingAtom = atom<boolean>(false);
export const hasSidebarBeenShownAtom = atom<boolean>(false);
export const isSidebarCollapsedAtom = atom<boolean>(false);
export const isTransitioningFromHomepageAtom = atom<boolean>(false);

// Tracks nodes that are pending integration auto-select check
// Don't show "missing integration" warning for these nodes
export const pendingIntegrationNodesAtom = atom<Set<string>>(new Set<string>());

// Tracks the ID of a newly created node (for auto-focusing search input)
// Cleared when the node gets an action type or is deselected
export const newlyCreatedNodeIdAtom = atom<string | null>(null);

// Trigger execute atom - set to true to trigger workflow execution
// This allows keyboard shortcuts to trigger the same execute flow as the button
export const triggerExecuteAtom = atom(false);

// Execution log entry type for storing run outputs per node
export type ExecutionLogEntry = {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: 'pending' | 'running' | 'success' | 'error';
  output?: unknown;
};

// Map of nodeId -> execution log entry for the currently selected execution
export const executionLogsAtom = atom<Record<string, ExecutionLogEntry>>({});

// Per-node log count for the selected execution (used for "Parallel × N" when node ran in fork branches)
export const forkBranchCountByNodeIdAtom = atom<Record<string, number>>({});

// Derived atoms for node/edge operations
export const onNodesChangeAtom = atom(null, (get, set, changes: NodeChange[]) => {
  const currentNodes = get(nodesAtom);

  // Filter out deletion attempts on trigger nodes
  const filteredChanges = changes.filter((change) => {
    if (change.type === 'remove') {
      const nodeToRemove = currentNodes.find((n) => n.id === change.id);
      // Prevent deletion of trigger nodes
      return nodeToRemove?.data.type !== 'trigger';
    }
    return true;
  });

  const newNodes = applyNodeChanges(filteredChanges, currentNodes) as WorkflowNode[];
  set(nodesAtom, newNodes);

  // Sync selection state with selectedNodeAtom
  const selectedNode = newNodes.find((n) => n.selected);
  if (selectedNode) {
    set(selectedNodeAtom, selectedNode.id);
    // Clear edge selection when a node is selected
    set(selectedEdgeAtom, null);
    // Clear newly created node tracking if a different node is selected
    const newlyCreatedId = get(newlyCreatedNodeIdAtom);
    if (newlyCreatedId && newlyCreatedId !== selectedNode.id) {
      set(newlyCreatedNodeIdAtom, null);
    }
  } else if (get(selectedNodeAtom)) {
    // If no node is selected in ReactFlow but we have a selection, clear it
    const currentSelection = get(selectedNodeAtom);
    const stillExists = newNodes.find((n) => n.id === currentSelection);
    if (!stillExists) {
      set(selectedNodeAtom, null);
    }
    // Clear newly created node tracking when no node is selected
    set(newlyCreatedNodeIdAtom, null);
  }
});

export const onEdgesChangeAtom = atom(null, (get, set, changes: EdgeChange[]) => {
  const currentEdges = get(edgesAtom);
  const newEdges = applyEdgeChanges(changes, currentEdges) as WorkflowEdge[];
  set(edgesAtom, newEdges);

  // Sync selection state with selectedEdgeAtom
  const selectedEdge = newEdges.find((e) => e.selected);
  if (selectedEdge) {
    set(selectedEdgeAtom, selectedEdge.id);
    // Clear node selection when an edge is selected
    set(selectedNodeAtom, null);
  } else if (get(selectedEdgeAtom)) {
    // If no edge is selected in ReactFlow but we have a selection, clear it
    const currentSelection = get(selectedEdgeAtom);
    const stillExists = newEdges.find((e) => e.id === currentSelection);
    if (!stillExists) {
      set(selectedEdgeAtom, null);
    }
  }
});

export const addNodeAtom = atom(null, (get, set, node: WorkflowNode) => {
  // Save current state to history before making changes
  const currentNodes = get(nodesAtom);
  const currentEdges = get(edgesAtom);
  const history = get(historyAtom);
  set(historyAtom, [...history, { nodes: currentNodes, edges: currentEdges }]);
  set(futureAtom, []);

  // Deselect all existing nodes and add new node as selected
  const updatedNodes = currentNodes.map((n) => ({ ...n, selected: false }));
  const newNode = { ...node, selected: true };
  const newNodes = [...updatedNodes, newNode];
  set(nodesAtom, newNodes);

  // Auto-select the newly added node
  set(selectedNodeAtom, node.id);

  // Track newly created action nodes (for auto-focusing search input)
  if (node.data.type === 'action' && !node.data.config?.actionType) {
    set(newlyCreatedNodeIdAtom, node.id);
  }

  // Mark as having unsaved changes
  set(hasUnsavedChangesAtom, true);
});

export const updateNodeDataAtom = atom(
  null,
  (get, set, { id, data }: { id: string; data: Partial<WorkflowNodeData> }) => {
    const currentNodes = get(nodesAtom);

    // Check if label is being updated
    const oldNode = currentNodes.find((node) => node.id === id);
    const oldLabel = oldNode?.data.label;
    const newLabel = data.label;
    const isLabelChange = newLabel !== undefined && oldLabel !== newLabel;

    const newNodes = currentNodes.map((node) => {
      if (node.id === id) {
        // Update the node itself
        return { ...node, data: { ...node.data, ...data } };
      }

      // If label changed, update all templates in other nodes that reference this node
      if (isLabelChange && oldLabel) {
        const updatedConfig = updateTemplatesInConfig(node.data.config || {}, id, oldLabel, newLabel);

        if (updatedConfig !== node.data.config) {
          return {
            ...node,
            data: {
              ...node.data,
              config: updatedConfig,
            },
          };
        }
      }

      return node;
    });

    set(nodesAtom, newNodes);

    // Mark as having unsaved changes (except for status updates during execution)
    if (!data.status) {
      set(hasUnsavedChangesAtom, true);
    }
  },
);

export const replaceNodeTypeAtom = atom(null, (get, set, id: string, newType: 'fork' | 'join') => {
  const currentNodes = get(nodesAtom);
  const node = currentNodes.find((n) => n.id === id);
  if (!node || node.data.type !== 'action') {
    return;
  }

  const currentEdges = get(edgesAtom);
  const history = get(historyAtom);
  set(historyAtom, [...history, { nodes: currentNodes, edges: currentEdges }]);
  set(futureAtom, []);

  const defaultConfig = newType === 'fork' ? { arraySource: '' } : { forkNodeId: '' };
  const newNodes = currentNodes.map((n) => {
    if (n.id !== id) return n;
    return {
      ...n,
      type: newType,
      data: {
        ...n.data,
        type: newType,
        config: defaultConfig,
      },
    };
  });

  set(nodesAtom, newNodes);
  set(hasUnsavedChangesAtom, true);

  const newlyCreatedId = get(newlyCreatedNodeIdAtom);
  if (newlyCreatedId === id) {
    set(newlyCreatedNodeIdAtom, null);
  }
});

// Helper function to update templates in a config object when a node label changes
function updateTemplatesInConfig(
  config: Record<string, unknown>,
  nodeId: string,
  oldLabel: string,
  newLabel: string,
): Record<string, unknown> {
  let hasChanges = false;
  const updated: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') {
      // Update template references to this node
      // Pattern: {{@nodeId:OldLabel}} or {{@nodeId:OldLabel.field}}
      const pattern = new RegExp(`\\{\\{@${escapeRegex(nodeId)}:${escapeRegex(oldLabel)}(\\.[^}]+)?\\}\\}`, 'g');
      const newValue = value.replace(pattern, (_match, fieldPart) => {
        hasChanges = true;
        return `{{@${nodeId}:${newLabel}${fieldPart || ''}}}`;
      });
      updated[key] = newValue;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nestedUpdated = updateTemplatesInConfig(value as Record<string, unknown>, nodeId, oldLabel, newLabel);
      if (nestedUpdated !== value) {
        hasChanges = true;
      }
      updated[key] = nestedUpdated;
    } else {
      updated[key] = value;
    }
  }

  return hasChanges ? updated : config;
}

// Helper to escape special regex characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const deleteNodeAtom = atom(null, (get, set, nodeId: string) => {
  const currentNodes = get(nodesAtom);

  // Prevent deletion of trigger nodes
  const nodeToDelete = currentNodes.find((node) => node.id === nodeId);
  if (nodeToDelete?.data.type === 'trigger') {
    return;
  }

  // Save current state to history before making changes
  const currentEdges = get(edgesAtom);
  const history = get(historyAtom);
  set(historyAtom, [...history, { nodes: currentNodes, edges: currentEdges }]);
  set(futureAtom, []);

  const newNodes = currentNodes.filter((node) => node.id !== nodeId);
  const newEdges = currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);

  set(nodesAtom, newNodes);
  set(edgesAtom, newEdges);

  if (get(selectedNodeAtom) === nodeId) {
    set(selectedNodeAtom, null);
  }

  // Mark as having unsaved changes
  set(hasUnsavedChangesAtom, true);
});

export const deleteEdgeAtom = atom(null, (get, set, edgeId: string) => {
  // Save current state to history before making changes
  const currentNodes = get(nodesAtom);
  const currentEdges = get(edgesAtom);
  const history = get(historyAtom);
  set(historyAtom, [...history, { nodes: currentNodes, edges: currentEdges }]);
  set(futureAtom, []);

  const newEdges = currentEdges.filter((edge) => edge.id !== edgeId);
  set(edgesAtom, newEdges);

  if (get(selectedEdgeAtom) === edgeId) {
    set(selectedEdgeAtom, null);
  }

  // Mark as having unsaved changes
  set(hasUnsavedChangesAtom, true);
});

export const deleteSelectedItemsAtom = atom(null, (get, set) => {
  // Save current state to history before making changes
  const currentNodes = get(nodesAtom);
  const currentEdges = get(edgesAtom);
  const history = get(historyAtom);
  set(historyAtom, [...history, { nodes: currentNodes, edges: currentEdges }]);
  set(futureAtom, []);

  // Get all selected nodes, excluding trigger nodes
  const selectedNodeIds = currentNodes
    .filter((node) => node.selected && node.data.type !== 'trigger')
    .map((node) => node.id);

  // Delete selected nodes (excluding trigger nodes) and their connected edges
  const newNodes = currentNodes.filter((node) => {
    // Keep trigger nodes even if selected
    if (node.data.type === 'trigger') {
      return true;
    }
    // Remove other selected nodes
    return !node.selected;
  });

  const newEdges = currentEdges.filter(
    (edge) => !(edge.selected || selectedNodeIds.includes(edge.source) || selectedNodeIds.includes(edge.target)),
  );

  set(nodesAtom, newNodes);
  set(edgesAtom, newEdges);
  set(selectedNodeAtom, null);
  set(selectedEdgeAtom, null);

  // Mark as having unsaved changes
  set(hasUnsavedChangesAtom, true);
});

export const clearWorkflowAtom = atom(null, (get, set) => {
  // Save current state to history before making changes
  const currentNodes = get(nodesAtom);
  const currentEdges = get(edgesAtom);
  const history = get(historyAtom);
  set(historyAtom, [...history, { nodes: currentNodes, edges: currentEdges }]);
  set(futureAtom, []);

  set(nodesAtom, []);
  set(edgesAtom, []);
  set(selectedNodeAtom, null);
  set(selectedEdgeAtom, null);

  // Mark as having unsaved changes
  set(hasUnsavedChangesAtom, true);
});

// Workflow toolbar UI state atoms
export const showClearDialogAtom = atom(false);
export const showDeleteDialogAtom = atom(false);
export const isSavingAtom = atom(false);
export const hasUnsavedChangesAtom = atom(false);
export const workflowNotFoundAtom = atom(false);

// Undo/Redo state
type HistoryState = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

const historyAtom = atom<HistoryState[]>([]);
const futureAtom = atom<HistoryState[]>([]);

// Undo atom
export const undoAtom = atom(null, (get, set) => {
  const history = get(historyAtom);
  if (history.length === 0) {
    return;
  }

  const currentNodes = get(nodesAtom);
  const currentEdges = get(edgesAtom);
  const future = get(futureAtom);

  // Save current state to future
  set(futureAtom, [...future, { nodes: currentNodes, edges: currentEdges }]);

  // Pop from history and set as current
  const newHistory = [...history];
  const previousState = newHistory.pop();
  if (!previousState) {
    return; // No history to undo
  }
  set(historyAtom, newHistory);
  set(nodesAtom, previousState.nodes);
  set(edgesAtom, previousState.edges);

  // Mark as having unsaved changes
  set(hasUnsavedChangesAtom, true);
});

// Redo atom
export const redoAtom = atom(null, (get, set) => {
  const future = get(futureAtom);
  if (future.length === 0) {
    return;
  }

  const currentNodes = get(nodesAtom);
  const currentEdges = get(edgesAtom);
  const history = get(historyAtom);

  // Save current state to history
  set(historyAtom, [...history, { nodes: currentNodes, edges: currentEdges }]);

  // Pop from future and set as current
  const newFuture = [...future];
  const nextState = newFuture.pop();
  if (!nextState) {
    return; // No future to redo
  }
  set(futureAtom, newFuture);
  set(nodesAtom, nextState.nodes);
  set(edgesAtom, nextState.edges);

  // Mark as having unsaved changes
  set(hasUnsavedChangesAtom, true);
});

// Can undo/redo atoms
export const canUndoAtom = atom((get) => get(historyAtom).length > 0);
export const canRedoAtom = atom((get) => get(futureAtom).length > 0);

// Clear all node statuses (used when clearing runs)
export const clearNodeStatusesAtom = atom(null, (get, set) => {
  const currentNodes = get(nodesAtom);
  const newNodes = currentNodes.map((node) => ({
    ...node,
    data: { ...node.data, status: 'idle' as const },
  }));
  set(nodesAtom, newNodes);
});
