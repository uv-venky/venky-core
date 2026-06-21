/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { devtoolsStore, closeDevtools, toggleDevtools, setActiveTab, setFilter, clearActivity, clearMutations, clearStores, clearNetwork, clearErrors, clearAll, exportDebugState, installFetchInterceptor, logRoute, setEnvironmentInfo, setConfigInfo, } from './devtools-store';
import { queryStore } from '../../../../lib/core/client/valtioQueryStore';
import { STORE_CACHE } from '../../../../lib/core/client/state';
import { X, Database, Search, Zap, Activity, Eraser, RefreshCw, Wrench, ChevronRight, ChevronDown, Copy, Check, Maximize2, Minimize2, Globe, Filter, AlertTriangle, AlertCircle, Trash2, Download, Settings, ExternalLink, } from 'lucide-react';
// Framework-agnostic: use window.location for navigation instead of next/navigation
import { deepEqual } from '../../../../venky-exports/core/common';
import { JsonTreeProvider, JsonTreeValue } from '../../../../components/core/common/json-preview';
const STORAGE_KEY = 'venky-devtools-size';
const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 450;
const MIN_WIDTH = 440;
const MIN_HEIGHT = 250;
const MAX_WIDTH_RATIO = 0.9;
const MAX_HEIGHT_RATIO = 0.9;
function useResizablePanel() {
    const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    const [isMaximized, setIsMaximized] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const startPos = useRef({ x: 0, y: 0 });
    const startSize = useRef({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    const savedSize = useRef({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    // Load saved size from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                const loadedSize = {
                    width: Math.max(MIN_WIDTH, Math.min(parsed.width, window.innerWidth * MAX_WIDTH_RATIO)),
                    height: Math.max(MIN_HEIGHT, Math.min(parsed.height, window.innerHeight * MAX_HEIGHT_RATIO)),
                };
                setSize(loadedSize);
                savedSize.current = loadedSize;
            }
        }
        catch {
            // Ignore parse errors
        }
    }, []);
    // Save size to localStorage when it changes (but not when maximized)
    useEffect(() => {
        if (!isResizing && !isMaximized) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(size));
            savedSize.current = size;
        }
    }, [size, isResizing, isMaximized]);
    const toggleMaximize = useCallback(() => {
        if (isMaximized) {
            // Restore to saved size
            setSize(savedSize.current);
            setIsMaximized(false);
        }
        else {
            // Maximize
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
            setIsMaximized(true);
        }
    }, [isMaximized]);
    const handleMouseDown = useCallback((e) => {
        if (isMaximized)
            return; // Don't allow resize when maximized
        e.preventDefault();
        setIsResizing(true);
        startPos.current = { x: e.clientX, y: e.clientY };
        startSize.current = { ...size };
    }, [size, isMaximized]);
    useEffect(() => {
        if (!isResizing)
            return;
        const handleMouseMove = (e) => {
            const deltaX = startPos.current.x - e.clientX;
            const deltaY = startPos.current.y - e.clientY;
            const maxWidth = window.innerWidth * MAX_WIDTH_RATIO;
            const maxHeight = window.innerHeight * MAX_HEIGHT_RATIO;
            setSize({
                width: Math.max(MIN_WIDTH, Math.min(startSize.current.width + deltaX, maxWidth)),
                height: Math.max(MIN_HEIGHT, Math.min(startSize.current.height + deltaY, maxHeight)),
            });
        };
        const handleMouseUp = () => {
            setIsResizing(false);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);
    return { size, isResizing, isMaximized, handleMouseDown, toggleMaximize };
}
function formatTime(timestamp) {
    if (!timestamp)
        return '-';
    return new Date(timestamp).toLocaleTimeString();
}
function formatDuration(ms) {
    if (ms === undefined)
        return '-';
    if (ms < 1000)
        return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}
function formatBytes(bytes) {
    if (bytes === undefined)
        return '-';
    if (bytes < 1024)
        return `${bytes}B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
function buildPlaygroundUrl(datasourceId, query, rows) {
    const params = new URLSearchParams();
    params.set('ds', datasourceId);
    if (query) {
        params.set('tab', 'Query');
        // Ensure the query has filter (required by API Playground schema)
        const queryObj = typeof query === 'string' ? JSON.parse(query) : query;
        const normalizedQuery = {
            filter: [],
            ...queryObj,
        };
        params.set('query', btoa(JSON.stringify(normalizedQuery, null, 2)));
    }
    else if (rows && Array.isArray(rows)) {
        params.set('tab', 'Post');
        params.set('post', btoa(JSON.stringify(rows, null, 2)));
    }
    // Add timestamp to force re-execution even with same params
    params.set('t', Date.now().toString());
    return `/admin/monitoring/api-playground#${params.toString()}`;
}
function useOpenInPlayground() {
    const pathname = '/admin/monitoring/api-playground';
    return (datasourceId, query, rows) => {
        const url = buildPlaygroundUrl(datasourceId, query, rows);
        const hashPart = url.split('#')[1] || '';
        // If already on the playground page, just update the hash (triggers native hashchange event)
        if (window.location.pathname === pathname) {
            window.location.hash = hashPart;
        }
        else {
            // Navigate to the page (framework-agnostic)
            window.location.href = url;
        }
    };
}
function StatusBadge({ status }) {
    const colors = {
        pending: 'bg-yellow-500/20 text-yellow-400',
        loading: 'bg-blue-500/20 text-blue-400',
        success: 'bg-green-500/20 text-green-400',
        error: 'bg-red-500/20 text-red-400',
    };
    return _jsx("span", { className: `rounded px-2 py-0.5 font-medium text-xs ${colors[status]}`, children: status });
}
function HttpStatusBadge({ status }) {
    if (!status)
        return null;
    let colorClass = 'bg-gray-500/20 text-gray-400';
    if (status >= 200 && status < 300)
        colorClass = 'bg-green-500/20 text-green-400';
    else if (status >= 300 && status < 400)
        colorClass = 'bg-blue-500/20 text-blue-400';
    else if (status >= 400 && status < 500)
        colorClass = 'bg-orange-500/20 text-orange-400';
    else if (status >= 500)
        colorClass = 'bg-red-500/20 text-red-400';
    return _jsx("span", { className: `rounded px-2 py-0.5 font-medium font-mono text-xs ${colorClass}`, children: status });
}
function MethodBadge({ method }) {
    const colors = {
        GET: 'text-green-400',
        POST: 'text-blue-400',
        PUT: 'text-orange-400',
        PATCH: 'text-yellow-400',
        DELETE: 'text-red-400',
    };
    return _jsx("span", { className: `font-mono font-semibold text-xs ${colors[method] || 'text-gray-400'}`, children: method });
}
function SlowIndicator({ duration, threshold }) {
    if (!duration || duration < threshold)
        return null;
    return (_jsx("span", { className: "flex items-center gap-0.5 text-orange-400", "data-tip": `Slow operation (>${threshold}ms)`, children: _jsx(AlertTriangle, { className: "size-3" }) }));
}
function CopyButton({ data }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (_jsx("button", { type: "button", onClick: handleCopy, className: "rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-gray-300", "data-tip": "Copy to clipboard", children: copied ? _jsx(Check, { className: "size-3 text-green-400" }) : _jsx(Copy, { className: "size-3" }) }));
}
function DataInspector({ data, label }) {
    const [expanded, setExpanded] = useState(false);
    if (data === undefined || data === null)
        return null;
    return (_jsxs("div", { className: "mt-2 rounded bg-gray-800/50 text-xs", children: [_jsxs("div", { className: "flex w-full items-center justify-between p-2 text-gray-400", children: [_jsxs("button", { type: "button", onClick: () => setExpanded(!expanded), className: "flex flex-1 items-center gap-1 text-left hover:text-gray-200", children: [expanded ? _jsx(ChevronDown, { className: "size-3" }) : _jsx(ChevronRight, { className: "size-3" }), label || 'Data'] }), _jsx(CopyButton, { data: data })] }), expanded && (_jsx("div", { className: "scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 max-h-48 overflow-auto border-gray-700 border-t p-2 font-mono text-[11px]", children: _jsx(JsonTreeProvider, { children: _jsx(JsonTreeValue, { value: data, theme: "dark", defaultExpandedDepth: 2, maxStringPreviewLength: 128, maxArrayItems: 50, maxObjectKeys: 30 }) }) }))] }));
}
function SearchFilter() {
    const snap = useSnapshot(devtoolsStore);
    return (_jsxs("div", { className: "relative", children: [_jsx(Filter, { className: "absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-gray-500" }), _jsx("input", { type: "text", value: snap.filter, onChange: (e) => setFilter(e.target.value), placeholder: "Filter...", className: "w-full rounded border border-gray-700 bg-gray-800 py-1.5 pr-2 pl-7 text-gray-200 text-xs placeholder:text-gray-500 focus:border-blue-500 focus:outline-none" }), snap.filter && (_jsx("button", { type: "button", onClick: () => setFilter(''), className: "absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-gray-300", children: _jsx(X, { className: "size-3" }) }))] }));
}
function EnvironmentBadge() {
    const snap = useSnapshot(devtoolsStore);
    const env = snap.environment;
    const envColor = env.nodeEnv === 'production' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400';
    return (_jsxs("div", { className: "flex items-center gap-2 text-xs", children: [_jsx("span", { className: `rounded px-1.5 py-0.5 font-medium ${envColor}`, children: env.nodeEnv }), env.appVersion && _jsxs("span", { className: "text-gray-500", children: ["v", env.appVersion] })] }));
}
function TabButton({ active, onClick, children, icon: Icon, count, }) {
    return (_jsxs("button", { type: "button", onClick: onClick, className: `relative flex items-center gap-1.5 rounded px-3 py-1.5 font-medium text-sm transition-colors ${active ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}`, children: [_jsx(Icon, { className: "size-4" }), children, count !== undefined && count > 0 && (_jsx("span", { className: "ml-1 rounded-full bg-gray-700 px-1.5 py-0.5 font-medium text-[10px] text-gray-300", children: count }))] }));
}
function useFilteredItems(items, filter, getSearchText) {
    return useMemo(() => {
        if (!filter.trim())
            return items;
        const lowerFilter = filter.toLowerCase();
        return items.filter((item) => getSearchText(item).toLowerCase().includes(lowerFilter));
    }, [items, filter, getSearchText]);
}
function StoreItem({ store }) {
    const [expanded, setExpanded] = useState(false);
    const openInPlayground = useOpenInPlayground();
    // Get current rows from store instance when expanded
    const currentRows = useMemo(() => {
        if (!expanded)
            return null;
        const storeInstance = STORE_CACHE.get(store.key);
        if (!storeInstance || storeInstance.destroyed)
            return null;
        return storeInstance.list();
    }, [expanded, store.key]);
    const handleOpenInPlayground = (e) => {
        e.stopPropagation();
        openInPlayground(store.datasourceId, store.query);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
        }
    };
    const hasInitialRows = store.rows && store.rows.length > 0;
    const hasCurrentRows = currentRows && currentRows.length > 0;
    const initialRowCount = store.rows?.length ?? 0;
    const currentRowCount = currentRows?.length ?? 0;
    const rowsAreDifferent = hasInitialRows && hasCurrentRows && !deepEqual(store.rows, currentRows);
    return (_jsxs("div", { className: "hover:bg-gray-800/50", children: [_jsxs("div", { role: "button", tabIndex: 0, onClick: () => setExpanded(!expanded), onKeyDown: handleKeyDown, className: "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left", children: [expanded ? (_jsx(ChevronDown, { className: "size-3 shrink-0 text-gray-500" })) : (_jsx(ChevronRight, { className: "size-3 shrink-0 text-gray-500" })), _jsx("span", { className: "font-medium text-gray-200", children: store.datasourceId }), _jsxs("span", { className: "truncate text-gray-500 text-xs", children: [store.alias, " \u00B7 ", store.page] }), _jsxs("span", { className: "shrink-0 text-gray-600 text-xs", children: ["(", store.rowCount, ")"] }), store.lastQueryAt && _jsx("span", { className: "shrink-0 text-gray-600 text-xs", children: formatTime(store.lastQueryAt) }), _jsxs("div", { className: "ml-auto flex shrink-0 items-center gap-1.5", children: [_jsx("button", { type: "button", onClick: handleOpenInPlayground, className: "rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-blue-400", "data-tip": "Open in API Playground", children: _jsx(ExternalLink, { className: "size-3" }) }), store.isLoading && _jsx(StatusBadge, { status: "loading" }), store.isPosting && _jsx(StatusBadge, { status: "pending" }), store.isDirty && (_jsxs("span", { className: "rounded bg-orange-500/20 px-1.5 py-0.5 font-medium text-[10px] text-orange-400", children: ["dirty (", store.dirtyRowCount, ")"] }))] })] }), expanded && (_jsxs("div", { className: "border-gray-700/50 border-t bg-gray-800/30 px-3 py-2 pl-8", children: [_jsxs("div", { className: "space-y-0.5 text-gray-500 text-xs", children: [_jsxs("div", { children: ["Alias: ", _jsx("span", { className: "text-gray-400", children: store.alias }), " | Page:", ' ', _jsx("span", { className: "text-gray-400", children: store.page })] }), _jsxs("div", { children: ["Rows: ", _jsx("span", { className: "text-gray-400", children: store.rowCount })] }), store.lastQueryAt && (_jsxs("div", { children: ["Last query: ", _jsx("span", { className: "text-gray-400", children: formatTime(store.lastQueryAt) })] })), store.lastSaveAt && (_jsxs("div", { children: ["Last save: ", _jsx("span", { className: "text-gray-400", children: formatTime(store.lastSaveAt) })] }))] }), store.query && _jsx(DataInspector, { data: store.query, label: "Query" }), hasInitialRows && (_jsx(DataInspector, { data: store.rows, label: rowsAreDifferent ? `Rows (initial) - ${initialRowCount}` : `Rows (${initialRowCount})` })), hasCurrentRows && rowsAreDifferent && (_jsx(DataInspector, { data: currentRows, label: `Rows (current) - ${currentRowCount}` })), !hasInitialRows && hasCurrentRows && (_jsx(DataInspector, { data: currentRows, label: `Rows (current) - ${currentRowCount}` }))] }))] }));
}
function StoresTab() {
    const snap = useSnapshot(devtoolsStore);
    const stores = Object.values(snap.stores);
    const filteredStores = useFilteredItems(stores.map((s) => ({ ...s, id: s.key })), snap.filter, (s) => `${s.datasourceId} ${s.alias} ${s.page}`);
    if (stores.length === 0) {
        return _jsx("div", { className: "p-4 text-gray-500 text-sm", children: "No active stores" });
    }
    if (filteredStores.length === 0) {
        return _jsxs("div", { className: "p-4 text-gray-500 text-sm", children: ["No stores match filter \"", snap.filter, "\""] });
    }
    return (_jsx("div", { className: "divide-y divide-gray-700", children: filteredStores.map((store) => (_jsx(StoreItem, { store: store }, store.key))) }));
}
function QueriesTab() {
    const snap = useSnapshot(devtoolsStore);
    const queriesSnap = useSnapshot(queryStore);
    const queries = Object.entries(queriesSnap).map(([key, entry]) => {
        const colonIndex = key.indexOf(':');
        const actionName = colonIndex > -1 ? key.slice(0, colonIndex) : key;
        const paramsStr = colonIndex > -1 ? key.slice(colonIndex + 1) : '';
        let params = [];
        try {
            params = paramsStr ? JSON.parse(paramsStr) : [];
        }
        catch {
            params = [paramsStr];
        }
        return {
            id: key,
            key,
            actionName,
            params,
            status: entry.status,
            dataUpdatedAt: entry.dataUpdatedAt,
            error: entry.error,
            data: entry.data,
        };
    });
    const filteredQueries = useFilteredItems(queries, snap.filter, (q) => `${q.actionName} ${JSON.stringify(q.params)}`);
    if (queries.length === 0) {
        return _jsx("div", { className: "p-4 text-gray-500 text-sm", children: "No cached queries" });
    }
    if (filteredQueries.length === 0) {
        return _jsxs("div", { className: "p-4 text-gray-500 text-sm", children: ["No queries match filter \"", snap.filter, "\""] });
    }
    return (_jsx("div", { className: "divide-y divide-gray-700", children: filteredQueries.map((query) => (_jsx(QueryItem, { query: query }, query.key))) }));
}
function QueryItem({ query }) {
    const [expanded, setExpanded] = useState(false);
    return (_jsxs("div", { className: "hover:bg-gray-800/50", children: [_jsxs("button", { type: "button", onClick: () => setExpanded(!expanded), className: "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left", children: [expanded ? (_jsx(ChevronDown, { className: "size-3 shrink-0 text-gray-500" })) : (_jsx(ChevronRight, { className: "size-3 shrink-0 text-gray-500" })), _jsx("span", { className: "font-medium text-gray-200", children: query.actionName }), query.dataUpdatedAt && _jsx("span", { className: "text-gray-600 text-xs", children: formatTime(query.dataUpdatedAt) }), _jsx("div", { className: "ml-auto flex shrink-0 items-center gap-2", children: _jsx(StatusBadge, { status: query.status }) })] }), expanded && (_jsxs("div", { className: "border-gray-700/50 border-t bg-gray-800/30 px-3 py-2 pl-8", children: [_jsxs("div", { className: "space-y-0.5 text-gray-500 text-xs", children: [query.dataUpdatedAt && (_jsxs("div", { children: ["Updated: ", _jsx("span", { className: "text-gray-400", children: formatTime(query.dataUpdatedAt) })] })), query.error && _jsxs("div", { className: "text-red-400", children: ["Error: ", query.error] })] }), query.params.length > 0 && _jsx(DataInspector, { data: query.params, label: "Params" }), query.data !== undefined && _jsx(DataInspector, { data: query.data, label: "Response Data" })] }))] }));
}
function MutationItem({ mutation, slowThreshold }) {
    const [expanded, setExpanded] = useState(false);
    return (_jsxs("div", { className: "hover:bg-gray-800/50", children: [_jsxs("button", { type: "button", onClick: () => setExpanded(!expanded), className: "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left", children: [expanded ? (_jsx(ChevronDown, { className: "size-3 shrink-0 text-gray-500" })) : (_jsx(ChevronRight, { className: "size-3 shrink-0 text-gray-500" })), _jsx("span", { className: "font-medium text-gray-200", children: mutation.name }), _jsx("span", { className: "text-gray-600 text-xs", children: formatTime(mutation.startedAt) }), _jsxs("div", { className: "ml-auto flex shrink-0 items-center gap-2", children: [_jsx(SlowIndicator, { duration: mutation.duration, threshold: slowThreshold }), _jsx(StatusBadge, { status: mutation.status }), _jsx("span", { className: "text-gray-500 text-xs", children: formatDuration(mutation.duration) })] })] }), expanded && (_jsxs("div", { className: "border-gray-700/50 border-t bg-gray-800/30 px-3 py-2 pl-8", children: [_jsxs("div", { className: "space-y-0.5 text-gray-500 text-xs", children: [_jsxs("div", { children: ["Started: ", _jsx("span", { className: "text-gray-400", children: formatTime(mutation.startedAt) })] }), mutation.error && _jsxs("div", { className: "text-red-400", children: ["Error: ", mutation.error] }), mutation.invalidatedQueries && mutation.invalidatedQueries.length > 0 && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(RefreshCw, { className: "size-3" }), "Invalidated: ", mutation.invalidatedQueries.join(', ')] }))] }), mutation.params && _jsx(DataInspector, { data: mutation.params, label: "Params" }), mutation.result !== undefined && _jsx(DataInspector, { data: mutation.result, label: "Result" })] }))] }));
}
function MutationsTab() {
    const snap = useSnapshot(devtoolsStore);
    const mutations = snap.mutations;
    const filteredMutations = useFilteredItems(mutations, snap.filter, (m) => `${m.name} ${JSON.stringify(m.params)}`);
    if (mutations.length === 0) {
        return _jsx("div", { className: "p-4 text-gray-500 text-sm", children: "No mutations recorded" });
    }
    if (filteredMutations.length === 0) {
        return _jsxs("div", { className: "p-4 text-gray-500 text-sm", children: ["No mutations match filter \"", snap.filter, "\""] });
    }
    return (_jsx("div", { className: "divide-y divide-gray-700", children: filteredMutations.map((mutation) => (_jsx(MutationItem, { mutation: mutation, slowThreshold: snap.slowThreshold }, mutation.id))) }));
}
function findNetworkEntryForActivity(entry, networkEntries) {
    if (entry.type === 'network') {
        return networkEntries.find((n) => n.activityId === entry.id);
    }
    return undefined;
}
const activityTypeColors = {
    query: 'text-blue-400',
    mutation: 'text-purple-400',
    'store-query': 'text-cyan-400',
    'store-save': 'text-green-400',
    'cache-hit': 'text-gray-400',
    'cache-invalidate': 'text-orange-400',
    network: 'text-teal-400',
    'route-change': 'text-pink-400',
};
function ActivityTab() {
    const snap = useSnapshot(devtoolsStore);
    const activity = snap.activity;
    const network = snap.network;
    const filteredActivity = useFilteredItems(activity, snap.filter, (a) => `${a.type} ${a.name}`);
    if (activity.length === 0) {
        return _jsx("div", { className: "p-4 text-gray-500 text-sm", children: "No activity recorded" });
    }
    if (filteredActivity.length === 0) {
        return _jsxs("div", { className: "p-4 text-gray-500 text-sm", children: ["No activity matches filter \"", snap.filter, "\""] });
    }
    return (_jsx("div", { className: "divide-y divide-gray-700", children: filteredActivity.map((entry) => {
            const networkEntry = findNetworkEntryForActivity(entry, network);
            const context = networkEntry ? getNetworkContext(networkEntry) : null;
            return (_jsx("div", { className: "p-2 text-xs hover:bg-gray-800/50", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `font-medium ${activityTypeColors[entry.type] || 'text-gray-400'}`, children: entry.type }), networkEntry && _jsx(NetworkTypeBadge, { type: networkEntry.type }), _jsxs("span", { className: "flex-1 truncate text-gray-300", children: [entry.name, context && _jsxs("span", { className: "ml-1 text-cyan-400", children: ["(", context, ")"] })] }), _jsx(SlowIndicator, { duration: entry.duration, threshold: snap.slowThreshold }), _jsx(StatusBadge, { status: entry.status }), _jsx("span", { className: "text-gray-500", children: formatDuration(entry.duration) })] }) }, entry.id));
        }) }));
}
function NetworkTypeBadge({ type }) {
    const colors = {
        api: 'bg-blue-500/20 text-blue-400',
        'server-action': 'bg-purple-500/20 text-purple-400',
        ds: 'bg-green-500/20 text-green-400',
        query: 'bg-yellow-500/20 text-yellow-400',
    };
    return _jsx("span", { className: `rounded px-1.5 py-0.5 font-medium text-[10px] ${colors[type]}`, children: type });
}
function getNetworkContext(entry) {
    if (!entry.requestBody)
        return null;
    // For query requests, the request body is an array where first element is the action name
    if (entry.type === 'query' && Array.isArray(entry.requestBody)) {
        const firstParam = entry.requestBody[0];
        if (typeof firstParam === 'string') {
            return firstParam;
        }
    }
    if (typeof entry.requestBody === 'object' && !Array.isArray(entry.requestBody)) {
        const body = entry.requestBody;
        // For ds requests, show the datasource ID
        if (body.ds && typeof body.ds === 'string') {
            return body.ds;
        }
        // For other requests, show the action name if present
        if (body.action && typeof body.action === 'string') {
            return body.action;
        }
    }
    return null;
}
function NetworkItem({ entry, slowThreshold }) {
    const [expanded, setExpanded] = useState(false);
    const context = getNetworkContext(entry);
    const openInPlayground = useOpenInPlayground();
    const handleOpenInPlayground = (e) => {
        e.stopPropagation();
        if (entry.type === 'ds' && entry.requestBody && typeof entry.requestBody === 'object') {
            const body = entry.requestBody;
            if (body.ds && typeof body.ds === 'string') {
                openInPlayground(body.ds, body.query, body.rows);
            }
        }
    };
    const canOpenInPlayground = entry.type === 'ds' && Boolean(entry.requestBody);
    return (_jsxs("div", { className: "hover:bg-gray-800/50", children: [_jsxs("button", { type: "button", onClick: () => setExpanded(!expanded), className: "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left", children: [expanded ? (_jsx(ChevronDown, { className: "size-3 shrink-0 text-gray-500" })) : (_jsx(ChevronRight, { className: "size-3 shrink-0 text-gray-500" })), _jsx(NetworkTypeBadge, { type: entry.type }), _jsx(MethodBadge, { method: entry.method }), _jsxs("span", { className: "min-w-0 flex-1 truncate font-mono text-gray-200 text-xs", "data-tip": entry.type === 'server-action' ? `Action on ${entry.url}` : entry.url, children: [entry.url.replace(/^https?:\/\/[^/]+/, ''), context && _jsxs("span", { className: "ml-1 text-cyan-400", children: ["(", context, ")"] })] }), _jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [canOpenInPlayground && (_jsx("button", { type: "button", onClick: handleOpenInPlayground, className: "rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-green-400", "data-tip": "Open in API Playground", children: _jsx(ExternalLink, { className: "size-3" }) })), _jsx(SlowIndicator, { duration: entry.duration, threshold: slowThreshold }), entry.statusCode ? _jsx(HttpStatusBadge, { status: entry.statusCode }) : _jsx(StatusBadge, { status: entry.status }), _jsx("span", { className: "text-gray-500 text-xs", children: formatDuration(entry.duration) }), _jsx("span", { className: "text-gray-600 text-xs", children: formatTime(entry.startedAt) })] })] }), expanded && (_jsxs("div", { className: "border-gray-700/50 border-t bg-gray-800/30 px-3 py-2 pl-8", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3 text-gray-500 text-xs", children: [_jsxs("span", { children: ["Started: ", formatTime(entry.startedAt)] }), entry.duration !== undefined && _jsxs("span", { children: ["Duration: ", formatDuration(entry.duration)] }), entry.responseSize !== undefined && entry.responseSize > 0 && (_jsxs("span", { children: ["Size: ", formatBytes(entry.responseSize)] })), entry.type === 'server-action' && entry.actionName && (_jsxs("span", { className: "font-mono text-purple-400/70", "data-tip": `Action ID: ${entry.actionName}`, children: ["Action ID: ", entry.actionName] })), entry.error && _jsxs("span", { className: "text-red-400", children: ["Error: ", entry.error] })] }), entry.requestBody !== undefined && _jsx(DataInspector, { data: entry.requestBody, label: "Request Body" }), entry.responseBody !== undefined && _jsx(DataInspector, { data: entry.responseBody, label: "Response Body" })] }))] }));
}
function NetworkTab() {
    const snap = useSnapshot(devtoolsStore);
    const network = snap.network;
    const filteredNetwork = useFilteredItems(network, snap.filter, (n) => `${n.type} ${n.method} ${n.url} ${n.actionName ?? ''}`);
    if (network.length === 0) {
        return (_jsxs("div", { className: "p-4 text-gray-500 text-sm", children: [_jsx("p", { children: "No network requests recorded" }), _jsxs("p", { className: "mt-2 text-xs", children: ["Tracks ", _jsx("code", { className: "rounded bg-gray-800 px-1", children: "/api/*" }), " routes and server actions."] })] }));
    }
    if (filteredNetwork.length === 0) {
        return _jsxs("div", { className: "p-4 text-gray-500 text-sm", children: ["No requests match filter \"", snap.filter, "\""] });
    }
    return (_jsx("div", { className: "divide-y divide-gray-700", children: filteredNetwork.map((entry) => (_jsx(NetworkItem, { entry: entry, slowThreshold: snap.slowThreshold }, entry.id))) }));
}
function ErrorSourceBadge({ source }) {
    const colors = {
        unhandled: 'bg-red-500/20 text-red-400',
        query: 'bg-blue-500/20 text-blue-400',
        mutation: 'bg-purple-500/20 text-purple-400',
        network: 'bg-teal-500/20 text-teal-400',
        validation: 'bg-orange-500/20 text-orange-400',
        server: 'bg-red-600/20 text-red-300',
        custom: 'bg-gray-500/20 text-gray-400',
    };
    return (_jsx("span", { className: `rounded px-1.5 py-0.5 font-medium text-[10px] ${colors[source] || colors.custom}`, children: source }));
}
function ErrorsTab() {
    const snap = useSnapshot(devtoolsStore);
    const errors = snap.errors;
    const filteredErrors = useFilteredItems(errors, snap.filter, (e) => `${e.source} ${e.message} ${e.url ?? ''}`);
    if (errors.length === 0) {
        return (_jsxs("div", { className: "p-4 text-gray-500 text-sm", children: [_jsx("p", { children: "No errors recorded" }), _jsx("p", { className: "mt-2 text-xs", children: "Errors from queries, mutations, network requests, and unhandled exceptions will appear here." })] }));
    }
    if (filteredErrors.length === 0) {
        return _jsxs("div", { className: "p-4 text-gray-500 text-sm", children: ["No errors match filter \"", snap.filter, "\""] });
    }
    return (_jsx("div", { className: "divide-y divide-gray-700", children: filteredErrors.map((entry) => (_jsxs("div", { className: "p-3 hover:bg-gray-800/50", children: [_jsxs("div", { className: "mb-1 flex items-center gap-2", children: [_jsx(AlertCircle, { className: "size-4 text-red-400" }), _jsx(ErrorSourceBadge, { source: entry.source }), _jsx("span", { className: "flex-1 truncate font-medium text-red-300 text-xs", children: entry.message }), _jsx("span", { className: "text-gray-500 text-xs", children: formatTime(entry.timestamp) })] }), entry.url && (_jsxs("div", { className: "mb-1 text-gray-500 text-xs", children: [_jsx("span", { className: "text-gray-600", children: "URL:" }), " ", entry.url] })), entry.stack && (_jsxs("details", { className: "mt-2", children: [_jsx("summary", { className: "cursor-pointer text-gray-400 text-xs hover:text-gray-200", children: "Stack trace" }), _jsx("pre", { className: "mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-gray-800/50 p-2 font-mono text-[10px] text-gray-400", children: entry.stack })] })), entry.context && _jsx(DataInspector, { data: entry.context, label: "Context" })] }, entry.id))) }));
}
function ConfigRow({ label, value }) {
    if (value === undefined || value === null)
        return null;
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return (_jsxs("div", { className: "flex items-start gap-2 py-1.5", children: [_jsx("span", { className: "min-w-[140px] font-medium text-gray-400 text-xs", children: label }), _jsx("span", { className: "font-mono text-gray-200 text-xs", children: displayValue || _jsx("span", { className: "text-gray-500", children: "-" }) })] }));
}
function ConfigSection({ title, children }) {
    return (_jsxs("div", { className: "border-gray-700 border-b p-3", children: [_jsx("h3", { className: "mb-2 font-semibold text-gray-300 text-sm", children: title }), _jsx("div", { className: "space-y-0.5", children: children })] }));
}
function ConfigTab() {
    const snap = useSnapshot(devtoolsStore);
    const env = snap.environment;
    const config = snap.config;
    const hasConfig = Object.keys(config).length > 0;
    return (_jsxs("div", { className: "divide-y divide-gray-700", children: [_jsxs(ConfigSection, { title: "Environment", children: [_jsx(ConfigRow, { label: "NODE_ENV", value: env.nodeEnv }), _jsx(ConfigRow, { label: "App Version", value: env.appVersion }), _jsx(ConfigRow, { label: "Current Path", value: env.pathname })] }), _jsxs(ConfigSection, { title: "User Session", children: [_jsx(ConfigRow, { label: "User Name", value: env.userName }), _jsx(ConfigRow, { label: "Email", value: env.userEmail }), _jsx(ConfigRow, { label: "Roles", value: env.userRoles })] }), env.env && (_jsxs("div", { className: "p-3", children: [_jsx("h3", { className: "mb-2 font-semibold text-gray-300 text-sm", children: "Client Environment" }), _jsx("div", { className: "font-mono text-xs", children: _jsx(JsonTreeProvider, { children: _jsx(JsonTreeValue, { value: env.env, theme: "dark", defaultExpandedDepth: 2, maxStringPreviewLength: 128, maxArrayItems: 50, maxObjectKeys: 30 }) }) })] })), hasConfig && (_jsxs("div", { className: "p-3", children: [_jsx("h3", { className: "mb-2 font-semibold text-gray-300 text-sm", children: "App Config" }), _jsx("div", { className: "font-mono text-xs", children: _jsx(JsonTreeProvider, { children: _jsx(JsonTreeValue, { value: config, theme: "dark", defaultExpandedDepth: 2, maxStringPreviewLength: 128, maxArrayItems: 50, maxObjectKeys: 30 }) }) })] }))] }));
}
function getClearFunction(tab) {
    switch (tab) {
        case 'activity':
            return clearActivity;
        case 'mutations':
            return clearMutations;
        case 'stores':
            return clearStores;
        case 'network':
            return clearNetwork;
        case 'errors':
            return clearErrors;
        case 'queries':
        case 'config':
            return null; // These can't be cleared
    }
}
export function DevtoolsPanel() {
    const snap = useSnapshot(devtoolsStore);
    const { size, isResizing, isMaximized, handleMouseDown, toggleMaximize } = useResizablePanel();
    // Install fetch interceptor when panel mounts
    useEffect(() => {
        installFetchInterceptor();
    }, []);
    if (!snap.enabled || !snap.isOpen) {
        return null;
    }
    const clearFn = getClearFunction(snap.activeTab);
    return (_jsxs("div", { className: `fixed right-0 bottom-0 z-[9999] flex flex-col bg-gray-900 font-sans shadow-2xl ${isMaximized ? '' : 'border-gray-700 border-t border-l'}`, style: { width: size.width, height: size.height }, children: [!isMaximized && (_jsx("div", { role: "separator", "aria-orientation": "horizontal", "aria-label": "Resize panel", tabIndex: 0, onMouseDown: handleMouseDown, className: `absolute top-0 left-0 z-10 size-4 cursor-nwse-resize ${isResizing ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`, "data-tip": "Drag to resize", children: _jsxs("svg", { width: "16", height: "16", viewBox: "0 0 16 16", className: "text-gray-400", children: [_jsx("path", { d: "M 2 14 L 14 2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }), _jsx("path", { d: "M 2 9 L 9 2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }), _jsx("path", { d: "M 2 4 L 4 2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })] }) })), _jsxs("div", { className: "flex items-center justify-between border-gray-700 border-b bg-gray-800 px-3 py-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "size-2 rounded-full bg-green-500" }), _jsx("span", { className: "font-semibold text-gray-200 text-sm", children: _jsx("span", { className: "tracking-[0.2em]", children: "VENKY" }) })] }), _jsx(EnvironmentBadge, {})] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { type: "button", onClick: exportDebugState, className: "cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-gray-200", "data-tip": "Export Debug State", children: _jsx(Download, { className: "size-4" }) }), _jsx("button", { type: "button", onClick: clearAll, className: "cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-gray-200", "data-tip": "Clear All", children: _jsx(Trash2, { className: "size-4" }) }), clearFn && (_jsx("button", { type: "button", onClick: clearFn, className: "cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-gray-200", "data-tip": "Clear Tab", children: _jsx(Eraser, { className: "size-4" }) })), _jsx("button", { type: "button", onClick: toggleMaximize, className: "cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-gray-200", "data-tip": isMaximized ? 'Restore' : 'Maximize', children: isMaximized ? _jsx(Minimize2, { className: "size-4" }) : _jsx(Maximize2, { className: "size-4" }) }), _jsx("button", { type: "button", onClick: closeDevtools, className: "cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-gray-200", "data-tip": "Close (\u2318\u21E7D)", children: _jsx(X, { className: "size-4" }) })] })] }), _jsxs("div", { className: "flex flex-col gap-2 border-gray-700 border-b bg-gray-850 p-2", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(TabButton, { active: snap.activeTab === 'activity', onClick: () => setActiveTab('activity'), icon: Activity, count: snap.activity.length, children: "Activity" }), _jsx(TabButton, { active: snap.activeTab === 'stores', onClick: () => setActiveTab('stores'), icon: Database, count: Object.keys(snap.stores).length, children: "Stores" }), _jsx(TabButton, { active: snap.activeTab === 'queries', onClick: () => setActiveTab('queries'), icon: Search, children: "Queries" }), _jsx(TabButton, { active: snap.activeTab === 'mutations', onClick: () => setActiveTab('mutations'), icon: Zap, count: snap.mutations.length, children: "Mutations" }), _jsx(TabButton, { active: snap.activeTab === 'network', onClick: () => setActiveTab('network'), icon: Globe, count: snap.network.length, children: "Network" }), _jsx(TabButton, { active: snap.activeTab === 'errors', onClick: () => setActiveTab('errors'), icon: AlertCircle, count: snap.errors.length, children: "Errors" }), _jsx(TabButton, { active: snap.activeTab === 'config', onClick: () => setActiveTab('config'), icon: Settings, children: "Config" })] }), _jsx(SearchFilter, {})] }), _jsxs("div", { className: "scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 flex-1 overflow-auto", children: [snap.activeTab === 'stores' && _jsx(StoresTab, {}), snap.activeTab === 'queries' && _jsx(QueriesTab, {}), snap.activeTab === 'mutations' && _jsx(MutationsTab, {}), snap.activeTab === 'activity' && _jsx(ActivityTab, {}), snap.activeTab === 'network' && _jsx(NetworkTab, {}), snap.activeTab === 'errors' && _jsx(ErrorsTab, {}), snap.activeTab === 'config' && _jsx(ConfigTab, {})] })] }));
}
/**
 * Floating toggle button for devtools.
 * Shows activity count badge when there are pending operations.
 *
 * @example
 * // Add to your layout
 * import { DevtoolsToggle } from '../../../../venky-exports/core/client/index.js';
 *
 * <DevtoolsToggle />
 */
export function DevtoolsToggle() {
    const snap = useSnapshot(devtoolsStore);
    // Hide when disabled or when panel is open
    if (!snap.enabled || snap.isOpen) {
        return null;
    }
    // Count pending activities and errors
    const pendingCount = snap.activity.filter((a) => a.status === 'pending').length;
    const errorCount = snap.errors.length;
    const storeCount = Object.keys(snap.stores).length;
    const queryCount = Object.keys(queryStore).length;
    const tooltip = `VENKY Devtools (⌘⇧D) - ${storeCount} stores, ${queryCount} queries${errorCount > 0 ? `, ${errorCount} errors` : ''}`;
    return (_jsxs("button", { type: "button", onClick: toggleDevtools, className: "group fixed bottom-5 left-[64px] z-[9998] flex size-9 cursor-pointer items-center justify-center rounded-full bg-gray-900 font-sans text-gray-300 shadow-lg ring-1 ring-gray-700 transition-all hover:bg-gray-800 hover:ring-gray-600", "data-tip": tooltip, children: [_jsx(Wrench, { className: "size-4 text-blue-400 transition-transform group-hover:rotate-12" }), pendingCount > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-yellow-500 font-bold text-[10px] text-gray-900", children: pendingCount })), pendingCount === 0 && errorCount > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 font-bold text-[10px] text-white", children: errorCount }))] }));
}
/**
 * Hook to track route changes in Next.js App Router.
 * Must be used within a component that has access to usePathname.
 */
export function useDevtoolsRouteTracking(pathname) {
    const previousPathname = useRef(null);
    useEffect(() => {
        if (!devtoolsStore.enabled || !pathname)
            return;
        // Set initial pathname
        if (previousPathname.current === null) {
            setEnvironmentInfo({ pathname });
            previousPathname.current = pathname;
            return;
        }
        // Log route change if pathname changed
        if (previousPathname.current !== pathname) {
            logRoute(previousPathname.current, pathname);
            previousPathname.current = pathname;
        }
    }, [pathname]);
}
/**
 * Hook to set environment info in devtools.
 * Call this once in your layout with session/env data.
 */
export function useDevtoolsEnvironment(info) {
    useEffect(() => {
        if (!devtoolsStore.enabled)
            return;
        setEnvironmentInfo(info);
    }, [info]);
}
/**
 * Hook to set config info in devtools.
 * Call this once in your layout after fetching server config.
 */
export function useDevtoolsConfig(info) {
    useEffect(() => {
        if (!devtoolsStore.enabled)
            return;
        setConfigInfo(info);
    }, [info]);
}
/**
 * Devtools component - renders the devtools panel.
 * Open via user menu "Debug Console" or keyboard shortcut ⌘⇧D.
 *
 * @example
 * // Add to your root layout
 * import { Devtools } from '../../../../venky-exports/core/client/index.js';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <>
 *       {children}
 *       <Devtools />
 *     </>
 *   );
 * }
 */
export function Devtools() {
    return _jsx(DevtoolsPanel, {});
}
//# sourceMappingURL=DevtoolsPanel.js.map