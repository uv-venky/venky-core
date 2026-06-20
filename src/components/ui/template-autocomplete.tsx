'use client';

import { useAtom } from 'jotai';
import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { edgesAtom, nodesAtom, type WorkflowNode } from '@/lib/workflow-store';
import { findActionById } from '@/plugins';

export type TemplateStaticOption = { template: string; label: string; description?: string };

type TemplateAutocompleteProps = {
  isOpen: boolean;
  position: { top: number; left: number };
  onSelect: (template: string) => void;
  onClose: () => void;
  currentNodeId?: string;
  filter?: string;
  /** Extra options (e.g. runtime context placeholders) shown at top of list; filter matches on label */
  staticOptions?: TemplateStaticOption[];
};

type SchemaField = {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  itemType?: 'string' | 'number' | 'boolean' | 'object';
  fields?: SchemaField[];
  description?: string;
};

// Helper to get a display name for a node
const getNodeDisplayName = (node: WorkflowNode): string => {
  if (node.data.label) {
    return node.data.label;
  }

  if (node.data.type === 'action') {
    const actionType = node.data.config?.actionType as string | undefined;
    if (actionType) {
      // Look up human-readable label from plugin registry
      const action = findActionById(actionType);
      if (action?.label) {
        return action.label;
      }
    }
    return actionType || 'HTTP Request';
  }

  if (node.data.type === 'trigger') {
    const triggerType = node.data.config?.triggerType as string | undefined;
    return triggerType || 'Manual';
  }

  if (node.data.type === 'fork') {
    return node.data.label || 'Fork';
  }
  if (node.data.type === 'join') {
    return node.data.label || 'Join';
  }

  return 'Node';
};

// Convert schema fields to field descriptions
const schemaToFields = (schema: SchemaField[], prefix = ''): Array<{ field: string; description: string }> => {
  const fields: Array<{ field: string; description: string }> = [];

  for (const schemaField of schema) {
    const fieldPath = prefix ? `${prefix}.${schemaField.name}` : schemaField.name;
    const typeLabel = schemaField.type === 'array' ? `${schemaField.itemType}[]` : schemaField.type;
    const description = schemaField.description || `${typeLabel}`;

    fields.push({ field: fieldPath, description });

    // Add nested fields for objects
    if (schemaField.type === 'object' && schemaField.fields && schemaField.fields.length > 0) {
      fields.push(...schemaToFields(schemaField.fields, fieldPath));
    }

    // Add nested fields for array items that are objects
    if (
      schemaField.type === 'array' &&
      schemaField.itemType === 'object' &&
      schemaField.fields &&
      schemaField.fields.length > 0
    ) {
      const arrayItemPath = `${fieldPath}[0]`;
      fields.push(...schemaToFields(schemaField.fields, arrayItemPath));
    }
  }

  return fields;
};

// Helper to check if action type matches (supports both namespaced IDs and legacy labels)
const isActionType = (actionType: string | undefined, ...matches: string[]): boolean => {
  if (!actionType) return false;
  return matches.some(
    (match) => actionType === match || actionType.endsWith(`/${match.toLowerCase().replace(/\s+/g, '-')}`),
  );
};

// Get common fields based on node action type
const getCommonFields = (node: WorkflowNode) => {
  const actionType = node.data.config?.actionType as string | undefined;

  // Special handling for dynamic outputs (system actions and schema-based)
  if (actionType === 'HTTP Request') {
    return [
      { field: 'data', description: 'Response data' },
      { field: 'status', description: 'HTTP status code' },
    ];
  }

  if (actionType === 'Database Query') {
    const dbSchema = node.data.config?.dbSchema as string | undefined;
    if (dbSchema) {
      try {
        const schema = JSON.parse(dbSchema) as SchemaField[];
        if (schema.length > 0) {
          return schemaToFields(schema);
        }
      } catch {
        // If schema parsing fails, fall through to default fields
      }
    }
    return [
      { field: 'rows', description: 'Query result rows' },
      { field: 'count', description: 'Number of rows' },
    ];
  }

  // AI Gateway generate-text has dynamic output based on format/schema
  if (isActionType(actionType, 'Generate Text', 'ai-gateway/generate-text')) {
    const aiFormat = node.data.config?.aiFormat as string | undefined;
    const aiSchema = node.data.config?.aiSchema as string | undefined;

    if (aiFormat === 'object' && aiSchema) {
      try {
        const schema = JSON.parse(aiSchema) as SchemaField[];
        if (schema.length > 0) {
          return schemaToFields(schema, 'object');
        }
      } catch {
        // If schema parsing fails, fall through to default fields
      }
    }
    return [{ field: 'text', description: 'Generated text' }];
  }

  // Check if the plugin defines output fields
  if (actionType) {
    const action = findActionById(actionType);
    if (action?.outputFields && action.outputFields.length > 0) {
      return action.outputFields;
    }
  }

  // Trigger fields
  if (node.data.type === 'trigger') {
    return [
      { field: 'triggered', description: 'Trigger status' },
      { field: 'timestamp', description: 'Trigger timestamp' },
      { field: 'input', description: 'Input data' },
    ];
  }

  return [{ field: 'data', description: 'Output data' }];
};

type AutocompleteOption =
  | { type: 'static'; template: string; nodeName: string; description?: string }
  | {
      type: 'node' | 'field';
      nodeId: string;
      nodeName: string;
      field?: string;
      description?: string;
      template: string;
    };

export function TemplateAutocomplete({
  isOpen,
  position,
  onSelect,
  onClose,
  currentNodeId,
  filter = '',
  staticOptions = [],
}: TemplateAutocompleteProps) {
  const [nodes] = useAtom(nodesAtom);
  const [edges] = useAtom(edgesAtom);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure we're mounted before trying to use portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Find all nodes that come before the current node
  const getUpstreamNodes = () => {
    if (!currentNodeId) {
      return [];
    }

    const visited = new Set<string>();
    const upstream: string[] = [];

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) {
        return;
      }
      visited.add(nodeId);

      const incomingEdges = edges.filter((edge) => edge.target === nodeId);
      for (const edge of incomingEdges) {
        upstream.push(edge.source);
        traverse(edge.source);
      }
    };

    traverse(currentNodeId);

    return nodes.filter((node) => upstream.includes(node.id));
  };

  const upstreamNodes = getUpstreamNodes();

  // Build list: static options first (Runtime context), then upstream nodes + fields
  const options: AutocompleteOption[] = [];

  for (const so of staticOptions) {
    options.push({
      type: 'static',
      template: so.template,
      nodeName: so.label,
      description: so.description,
    });
  }

  for (const node of upstreamNodes) {
    const nodeName = getNodeDisplayName(node);
    const fields = getCommonFields(node);

    options.push({
      type: 'node',
      nodeId: node.id,
      nodeName,
      template: `{{@${node.id}:${nodeName}}}`,
    });

    for (const field of fields) {
      options.push({
        type: 'field',
        nodeId: node.id,
        nodeName,
        field: field.field,
        description: field.description,
        template: `{{@${node.id}:${nodeName}.${field.field}}}`,
      });
    }
  }

  // Filter options based on search term (static: match label/description; node/field: match nodeName/field)
  const filteredOptions = filter
    ? options.filter((opt) => {
        const search = filter.toLowerCase();
        if (opt.type === 'static') {
          return (
            opt.nodeName.toLowerCase().includes(search) || (opt.description?.toLowerCase().includes(search) ?? false)
          );
        }
        return opt.nodeName.toLowerCase().includes(search) || (opt.field?.toLowerCase().includes(search) ?? false);
      })
    : options;

  // Node options (type 'node') are section headers only - not selectable. Only static and field options are selectable.
  const selectableOptions = filteredOptions.filter((opt) => opt.type !== 'node');

  // Reset selection when filter or selectable list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filter, selectableOptions.length]);

  // Handle keyboard navigation (only over selectable options)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < selectableOptions.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectableOptions[selectedIndex]) {
            onSelect(selectableOptions[selectedIndex].template);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectableOptions, selectedIndex, onSelect, onClose]);

  // Scroll selected item into view (selected index refers to selectable options)
  useEffect(() => {
    const selected = selectableOptions[selectedIndex];
    if (!selected || !menuRef.current) return;
    const el = menuRef.current.querySelector('[data-autocomplete-selected="true"]');
    if (el) {
      (el as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, selectableOptions]);

  if (!isOpen || filteredOptions.length === 0 || !mounted) {
    return null;
  }

  // Ensure position is within viewport
  const adjustedPosition = {
    top: Math.min(position.top, window.innerHeight - 300), // Keep 300px from bottom
    left: Math.min(position.left, window.innerWidth - 320), // Keep menu (320px wide) within viewport
  };

  const menuContent = (
    <div
      className="fixed z-[9999] w-80 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
      ref={menuRef}
      style={{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
      }}
    >
      <div className="max-h-60 overflow-y-auto">
        {(() => {
          let selectableIdx = 0;
          let staticHeaderShown = false;
          return filteredOptions.flatMap((option) => {
            const isNodeHeader = option.type === 'node';
            const currentSelectableIdx = selectableIdx;
            const isSelected = !isNodeHeader && currentSelectableIdx === selectedIndex;
            if (!isNodeHeader) selectableIdx += 1;

            if (isNodeHeader) {
              return [
                <div
                  className="border-border/50 border-b px-2 py-1.5 font-medium text-muted-foreground text-xs"
                  key={`${option.nodeId}-header`}
                  role="presentation"
                >
                  {option.nodeName}
                </div>,
              ];
            }

            const row = (
              <div
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-sm transition-colors',
                  isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
                )}
                data-autocomplete-selected={isSelected ? 'true' : undefined}
                key={
                  option.type === 'static' ? `static-${option.template}` : `${option.nodeId}-${option.field ?? 'root'}`
                }
                onClick={() => onSelect(option.template)}
                onMouseEnter={() => setSelectedIndex(currentSelectableIdx)}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {option.type === 'static' ? (
                      option.nodeName
                    ) : (
                      <>
                        <span className="text-muted-foreground">{option.nodeName}.</span>
                        {option.field}
                      </>
                    )}
                  </div>
                  {option.description ? (
                    <div className="text-muted-foreground text-xs">{option.description}</div>
                  ) : null}
                </div>
                {isSelected ? <Check className="h-4 w-4" /> : null}
              </div>
            );

            if (option.type === 'static' && !staticHeaderShown) {
              staticHeaderShown = true;
              return [
                <div
                  className="border-border/50 border-b px-2 py-1.5 font-medium text-muted-foreground text-xs"
                  key="static-header"
                  role="presentation"
                >
                  Runtime context
                </div>,
                row,
              ];
            }

            return [row];
          });
        })()}
      </div>
    </div>
  );

  // Use portal to render at document root to avoid clipping issues
  return createPortal(menuContent, document.body);
}
