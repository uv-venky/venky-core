'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../../components/ui/button';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Clock, Play, Trash2 } from 'lucide-react';
import CopyToClipboard from '../../../../components/core/common/CopyToClipboard';
import { isErrorResponse } from '../../../../lib/core/common/error';
import { showError } from '../../common/Notification';
export default function QueryHistory({ onSelectQuery, onHistoryUpdated }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const loadHistory = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/sql/history');
            const data = await response.json();
            if (isErrorResponse(data)) {
                showError(data.message);
            }
            else {
                setHistory(data.history || []);
            }
        }
        catch (error) {
            console.error('Failed to load query history:', error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        loadHistory();
    }, [loadHistory]);
    const deleteQuery = async (id) => {
        try {
            const response = await fetch(`/api/sql/history/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await loadHistory();
                onHistoryUpdated?.();
            }
        }
        catch (error) {
            console.error('Failed to delete query:', error);
        }
    };
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };
    if (loading) {
        return (_jsx("div", { className: "p-4", children: _jsx("div", { className: "text-muted-foreground text-sm", children: "Loading history..." }) }));
    }
    return (_jsx("div", { className: "flex h-full flex-col", children: _jsx(ScrollArea, { className: "flex-1", children: _jsx("div", { className: "p-2", children: history.length === 0 ? (_jsxs("div", { className: "py-8 text-center text-muted-foreground", children: [_jsx(Clock, { className: "mx-auto mb-2 h-8 w-8 opacity-50" }), _jsx("p", { className: "text-sm", children: "No saved queries" })] })) : (_jsx("div", { className: "space-y-2", children: history.map((item) => (_jsxs("div", { className: "rounded-lg border p-3 hover:bg-muted/50", children: [_jsxs("div", { className: "mb-2 flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "mb-1 font-medium text-sm", children: item.name || 'Unnamed Query' }), _jsx("div", { className: "text-muted-foreground text-xs", children: formatTimestamp(item.timestamp) })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => onSelectQuery(item.query), title: "Run query", children: _jsx(Play, { className: "h-3 w-3" }) }), _jsx(CopyToClipboard, { text: item.query }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => deleteQuery(item.id), title: "Delete query", children: _jsx(Trash2, { className: "h-3 w-3" }) })] })] }), _jsx("div", { className: "overflow-x-auto rounded bg-muted/30 p-2 font-mono text-xs", children: item.query.length > 100 ? `${item.query.substring(0, 100)}...` : item.query })] }, item.id))) })) }) }) }));
}
//# sourceMappingURL=QueryHistory.js.map