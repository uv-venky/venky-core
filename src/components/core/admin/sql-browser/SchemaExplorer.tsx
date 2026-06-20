'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, Table, Eye, Database, MoreVertical, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getErrorMessage, isErrorResponse } from '@/lib/core/common/error';
import { showError } from '../../common/Notification';
import { useLoadingControl } from '@/lib/core/client/loading-tracker';
import { cn } from '@/lib/utils';

interface SchemaNode {
  name: string;
  type: 'schema' | 'table' | 'view' | 'column';
  children?: SchemaNode[];
  expanded?: boolean;
}

interface SchemaExplorerProps {
  onTableDoubleClick?: (schemaName: string, tableName: string) => void;
  onAddTab?: (sql: string, name: string) => void;
}

export default function SchemaExplorer({ onTableDoubleClick, onAddTab }: SchemaExplorerProps) {
  const [schemas, setSchemas] = useState<SchemaNode[]>([]);
  const [loading, setLoading] = useState(true);
  const { increment, decrement } = useLoadingControl();

  const fetchSchemas = useCallback(async () => {
    try {
      setLoading(true);
      increment();
      const response = await fetch('/api/sql/schemas');
      const data = await response.json();

      if (isErrorResponse(data)) {
        showError(data.message);
      } else {
        setSchemas(data.schemas);
      }
    } catch (err) {
      showError(`Failed to load schemas: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
      decrement();
    }
  }, [increment, decrement]);

  useEffect(() => {
    fetchSchemas();
  }, [fetchSchemas]);

  const toggleNode = (node: SchemaNode) => {
    if (node.type === 'schema' || node.type === 'table' || node.type === 'view') {
      node.expanded = !node.expanded;
      setSchemas([...schemas]);
    }
  };

  const handleDescribe = async (schemaName: string, tableName: string) => {
    try {
      const response = await fetch('/api/sql/describe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schema: schemaName,
          table: tableName,
        }),
      });
      const data = await response.json();

      if (data.status === 'OK') {
        const columns = data.data.columns;
        const describeQuery = `-- Table Structure for ${schemaName}.${tableName}\n-- Generated on ${new Date().toLocaleString()}\n\n`;
        const columnInfo = columns
          .map(
            (col: any) =>
              `-- ${col.column_name}: ${col.data_type}${col.is_nullable === 'YES' ? ' (nullable)' : ' (not null)'}${col.column_default ? ` default: ${col.column_default}` : ''}`,
          )
          .join('\n');

        if (onAddTab) {
          onAddTab(describeQuery + columnInfo, `${schemaName}.${tableName} - Structure`);
        }
      } else {
        console.error('Failed to describe table:', data.message);
      }
    } catch (error) {
      console.error('Error describing table:', error);
    }
  };

  const handleGenerateSelect = async (schemaName: string, tableName: string) => {
    try {
      const response = await fetch('/api/sql/describe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schema: schemaName,
          table: tableName,
        }),
      });
      const data = await response.json();

      if (data.status === 'OK') {
        const columns = data.data.columns;
        const columnNames = columns.map((col: any) => col.column_name).join(', ');
        const selectQuery = `SELECT ${columnNames} FROM ${schemaName}.${tableName}`;

        if (onAddTab) {
          onAddTab(selectQuery, `${schemaName}.${tableName} - Select All`);
        }
      } else {
        console.error('Failed to describe table:', data.message);
      }
    } catch (error) {
      console.error('Error generating select query:', error);
    }
  };

  const renderNode = (node: SchemaNode, level = 0, parentSchema?: string) => {
    const paddingLeft = level * 16;
    const currentSchema = node.type === 'schema' ? node.name : parentSchema;

    return (
      <div key={node.name} style={{ paddingLeft }}>
        <div
          className={cn(
            'group flex cursor-pointer items-center rounded-lg px-2 py-1.5 transition-all duration-150',
            node.type === 'schema' ? 'hover:bg-cyan-50 dark:hover:bg-cyan-500/10' : 'hover:bg-muted/80',
          )}
        >
          {node.type === 'schema' && (
            <button
              type="button"
              onClick={() => toggleNode(node)}
              className="mr-1.5 flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {node.expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          )}

          {node.type === 'schema' && <Database className="mr-1.5 h-4 w-4 text-cyan-600 dark:text-cyan-400" />}
          {node.type === 'table' && <Table className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
          {node.type === 'view' && <Eye className="mr-1.5 h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />}

          <span
            role="button"
            className={cn(
              'flex-1 truncate text-sm transition-colors',
              node.type === 'schema' ? 'font-medium' : 'text-muted-foreground group-hover:text-foreground',
            )}
            onDoubleClick={() => {
              if ((node.type === 'table' || node.type === 'view') && currentSchema) {
                onTableDoubleClick?.(currentSchema, node.name);
              }
            }}
          >
            {node.name}
          </span>

          {(node.type === 'table' || node.type === 'view') && currentSchema && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDescribe(currentSchema, node.name)}>Describe</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGenerateSelect(currentSchema, node.name)}>
                  Generate Select All Columns
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {node.expanded && node.children && (
          <div className="mt-0.5">{node.children.map((child) => renderNode(child, level + 1, currentSchema))}</div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div className="relative flex h-12 shrink-0 items-center gap-3 border-b bg-muted/30 px-4">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/10 to-teal-500/10">
            <Layers className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Schema Explorer</h3>
            <p className="text-muted-foreground text-xs">Loading...</p>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="text-xs">Loading schemas...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="relative flex h-12 shrink-0 items-center gap-3 border-b bg-muted/30 px-4">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/10 to-teal-500/10">
          <Layers className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Schema Explorer</h3>
          <p className="text-muted-foreground text-xs">
            {schemas.length} schema{schemas.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 select-none overflow-hidden">
        <div className="p-2">{schemas.map((schema) => renderNode(schema))}</div>
      </ScrollArea>
    </div>
  );
}
