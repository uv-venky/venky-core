'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Play, Trash2 } from 'lucide-react';
import CopyToClipboard from '@/components/core/common/CopyToClipboard';
import { isErrorResponse } from '@/lib/core/common/error';
import { showError } from '../../common/Notification';

interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  name?: string;
}

interface QueryHistoryProps {
  onSelectQuery: (query: string) => void;
  onHistoryUpdated?: () => void;
}

export default function QueryHistory({ onSelectQuery, onHistoryUpdated }: QueryHistoryProps) {
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sql/history');
      const data = await response.json();

      if (isErrorResponse(data)) {
        showError(data.message);
      } else {
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load query history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const deleteQuery = async (id: string) => {
    try {
      const response = await fetch(`/api/sql/history/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadHistory();
        onHistoryUpdated?.();
      }
    } catch (error) {
      console.error('Failed to delete query:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-muted-foreground text-sm">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="p-2">
          {history.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No saved queries</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.id} className="rounded-lg border p-3 hover:bg-muted/50">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 font-medium text-sm">{item.name || 'Unnamed Query'}</div>
                      <div className="text-muted-foreground text-xs">{formatTimestamp(item.timestamp)}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onSelectQuery(item.query)} title="Run query">
                        <Play className="h-3 w-3" />
                      </Button>
                      <CopyToClipboard text={item.query} />
                      <Button variant="ghost" size="sm" onClick={() => deleteQuery(item.id)} title="Delete query">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded bg-muted/30 p-2 font-mono text-xs">
                    {item.query.length > 100 ? `${item.query.substring(0, 100)}...` : item.query}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
