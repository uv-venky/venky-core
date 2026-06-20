/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSnapshot } from 'valtio';
import {
  type NetworkType,
  devtoolsStore,
  closeDevtools,
  toggleDevtools,
  setActiveTab,
  setFilter,
  clearActivity,
  clearMutations,
  clearStores,
  clearNetwork,
  clearErrors,
  clearAll,
  exportDebugState,
  installFetchInterceptor,
  logRoute,
  setEnvironmentInfo,
  setConfigInfo,
  type ActivityEntry,
  type MutationEntry,
  type StoreInfo,
  type NetworkEntry,
  type ErrorEntry,
  type DevtoolsTab,
  type EnvironmentInfo,
  type ConfigInfo,
} from './devtools-store';
import { queryStore } from '@/lib/core/client/valtioQueryStore';
import { STORE_CACHE } from '@/lib/core/client/state';
import {
  X,
  Database,
  Search,
  Zap,
  Activity,
  Eraser,
  RefreshCw,
  Wrench,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Globe,
  Filter,
  AlertTriangle,
  AlertCircle,
  Trash2,
  Download,
  Settings,
  ExternalLink,
} from 'lucide-react';
// Framework-agnostic: use window.location for navigation instead of next/navigation
import { type Row, deepEqual } from '@/venky-exports/core/common';
import type { Query } from '@/venky-exports/core/common';
import { JsonTreeProvider, JsonTreeValue } from '@/components/core/common/json-preview';

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
    } catch {
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
    } else {
      // Maximize
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setIsMaximized(true);
    }
  }, [isMaximized]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isMaximized) return; // Don't allow resize when maximized
      e.preventDefault();
      setIsResizing(true);
      startPos.current = { x: e.clientX, y: e.clientY };
      startSize.current = { ...size };
    },
    [size, isMaximized],
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
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

function formatTime(timestamp: string | number | undefined): string {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleTimeString();
}

function formatDuration(ms?: number): string {
  if (ms === undefined) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatBytes(bytes?: number): string {
  if (bytes === undefined) return '-';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function buildPlaygroundUrl(datasourceId: string, query?: unknown, rows?: unknown[]): string {
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
  } else if (rows && Array.isArray(rows)) {
    params.set('tab', 'Post');
    params.set('post', btoa(JSON.stringify(rows, null, 2)));
  }
  // Add timestamp to force re-execution even with same params
  params.set('t', Date.now().toString());
  return `/admin/monitoring/api-playground#${params.toString()}`;
}

function useOpenInPlayground() {
  const pathname = '/admin/monitoring/api-playground';

  return (datasourceId: string, query?: unknown, rows?: unknown[]) => {
    const url = buildPlaygroundUrl(datasourceId, query, rows);
    const hashPart = url.split('#')[1] || '';

    // If already on the playground page, just update the hash (triggers native hashchange event)
    if (window.location.pathname === pathname) {
      window.location.hash = hashPart;
    } else {
      // Navigate to the page (framework-agnostic)
      window.location.href = url;
    }
  };
}

function StatusBadge({ status }: { status: 'pending' | 'loading' | 'success' | 'error' }) {
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    loading: 'bg-blue-500/20 text-blue-400',
    success: 'bg-green-500/20 text-green-400',
    error: 'bg-red-500/20 text-red-400',
  };

  return <span className={`rounded px-2 py-0.5 font-medium text-xs ${colors[status]}`}>{status}</span>;
}

function HttpStatusBadge({ status }: { status?: number }) {
  if (!status) return null;

  let colorClass = 'bg-gray-500/20 text-gray-400';
  if (status >= 200 && status < 300) colorClass = 'bg-green-500/20 text-green-400';
  else if (status >= 300 && status < 400) colorClass = 'bg-blue-500/20 text-blue-400';
  else if (status >= 400 && status < 500) colorClass = 'bg-orange-500/20 text-orange-400';
  else if (status >= 500) colorClass = 'bg-red-500/20 text-red-400';

  return <span className={`rounded px-2 py-0.5 font-medium font-mono text-xs ${colorClass}`}>{status}</span>;
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'text-green-400',
    POST: 'text-blue-400',
    PUT: 'text-orange-400',
    PATCH: 'text-yellow-400',
    DELETE: 'text-red-400',
  };

  return <span className={`font-mono font-semibold text-xs ${colors[method] || 'text-gray-400'}`}>{method}</span>;
}

function SlowIndicator({ duration, threshold }: { duration?: number; threshold: number }) {
  if (!duration || duration < threshold) return null;

  return (
    <span className="flex items-center gap-0.5 text-orange-400" data-tip={`Slow operation (>${threshold}ms)`}>
      <AlertTriangle className="size-3" />
    </span>
  );
}

function CopyButton({ data }: { data: unknown }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-gray-300"
      data-tip="Copy to clipboard"
    >
      {copied ? <Check className="size-3 text-green-400" /> : <Copy className="size-3" />}
    </button>
  );
}

function DataInspector({ data, label }: { data: unknown; label?: string }) {
  const [expanded, setExpanded] = useState(false);

  if (data === undefined || data === null) return null;

  return (
    <div className="mt-2 rounded bg-gray-800/50 text-xs">
      <div className="flex w-full items-center justify-between p-2 text-gray-400">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex flex-1 items-center gap-1 text-left hover:text-gray-200"
        >
          {expanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
          {label || 'Data'}
        </button>
        <CopyButton data={data} />
      </div>
      {expanded && (
        <div className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 max-h-48 overflow-auto border-gray-700 border-t p-2 font-mono text-[11px]">
          <JsonTreeProvider>
            <JsonTreeValue
              value={data}
              theme="dark"
              defaultExpandedDepth={2}
              maxStringPreviewLength={128}
              maxArrayItems={50}
              maxObjectKeys={30}
            />
          </JsonTreeProvider>
        </div>
      )}
    </div>
  );
}

function SearchFilter() {
  const snap = useSnapshot(devtoolsStore);

  return (
    <div className="relative">
      <Filter className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        value={snap.filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter..."
        className="w-full rounded border border-gray-700 bg-gray-800 py-1.5 pr-2 pl-7 text-gray-200 text-xs placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
      />
      {snap.filter && (
        <button
          type="button"
          onClick={() => setFilter('')}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}

function EnvironmentBadge() {
  const snap = useSnapshot(devtoolsStore);
  const env = snap.environment;

  const envColor = env.nodeEnv === 'production' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400';

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`rounded px-1.5 py-0.5 font-medium ${envColor}`}>{env.nodeEnv}</span>
      {env.appVersion && <span className="text-gray-500">v{env.appVersion}</span>}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  icon: Icon,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-1.5 rounded px-3 py-1.5 font-medium text-sm transition-colors ${
        active ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
      }`}
    >
      <Icon className="size-4" />
      {children}
      {count !== undefined && count > 0 && (
        <span className="ml-1 rounded-full bg-gray-700 px-1.5 py-0.5 font-medium text-[10px] text-gray-300">
          {count}
        </span>
      )}
    </button>
  );
}

function useFilteredItems<T extends { id: string }>(
  items: T[],
  filter: string,
  getSearchText: (item: T) => string,
): T[] {
  return useMemo(() => {
    if (!filter.trim()) return items;
    const lowerFilter = filter.toLowerCase();
    return items.filter((item) => getSearchText(item).toLowerCase().includes(lowerFilter));
  }, [items, filter, getSearchText]);
}

function StoreItem({ store }: { store: StoreInfo & { id: string } }) {
  const [expanded, setExpanded] = useState(false);
  const openInPlayground = useOpenInPlayground();

  // Get current rows from store instance when expanded
  const currentRows = useMemo(() => {
    if (!expanded) return null;
    const storeInstance = STORE_CACHE.get(store.key);
    if (!storeInstance || storeInstance.destroyed) return null;
    return storeInstance.list() as Row<any>[];
  }, [expanded, store.key]);

  const handleOpenInPlayground = (e: React.MouseEvent) => {
    e.stopPropagation();
    openInPlayground(store.datasourceId, store.query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  return (
    <div className="hover:bg-gray-800/50">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={handleKeyDown}
        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left"
      >
        {expanded ? (
          <ChevronDown className="size-3 shrink-0 text-gray-500" />
        ) : (
          <ChevronRight className="size-3 shrink-0 text-gray-500" />
        )}
        <span className="font-medium text-gray-200">{store.datasourceId}</span>
        <span className="truncate text-gray-500 text-xs">
          {store.alias} · {store.page}
        </span>
        <span className="shrink-0 text-gray-600 text-xs">({store.rowCount})</span>
        {store.lastQueryAt && <span className="shrink-0 text-gray-600 text-xs">{formatTime(store.lastQueryAt)}</span>}
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={handleOpenInPlayground}
            className="rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-blue-400"
            data-tip="Open in API Playground"
          >
            <ExternalLink className="size-3" />
          </button>
          {store.isLoading && <StatusBadge status="loading" />}
          {store.isPosting && <StatusBadge status="pending" />}
          {store.isDirty && (
            <span className="rounded bg-orange-500/20 px-1.5 py-0.5 font-medium text-[10px] text-orange-400">
              dirty ({store.dirtyRowCount})
            </span>
          )}
        </div>
      </div>
      {expanded && (
        <div className="border-gray-700/50 border-t bg-gray-800/30 px-3 py-2 pl-8">
          <div className="space-y-0.5 text-gray-500 text-xs">
            <div>
              Alias: <span className="text-gray-400">{store.alias}</span> | Page:{' '}
              <span className="text-gray-400">{store.page}</span>
            </div>
            <div>
              Rows: <span className="text-gray-400">{store.rowCount}</span>
            </div>
            {store.lastQueryAt && (
              <div>
                Last query: <span className="text-gray-400">{formatTime(store.lastQueryAt)}</span>
              </div>
            )}
            {store.lastSaveAt && (
              <div>
                Last save: <span className="text-gray-400">{formatTime(store.lastSaveAt)}</span>
              </div>
            )}
          </div>
          {store.query && <DataInspector data={store.query} label="Query" />}
          {hasInitialRows && (
            <DataInspector
              data={store.rows}
              label={rowsAreDifferent ? `Rows (initial) - ${initialRowCount}` : `Rows (${initialRowCount})`}
            />
          )}
          {hasCurrentRows && rowsAreDifferent && (
            <DataInspector data={currentRows} label={`Rows (current) - ${currentRowCount}`} />
          )}
          {!hasInitialRows && hasCurrentRows && (
            <DataInspector data={currentRows} label={`Rows (current) - ${currentRowCount}`} />
          )}
        </div>
      )}
    </div>
  );
}

function StoresTab() {
  const snap = useSnapshot(devtoolsStore);
  const stores = Object.values(snap.stores) as StoreInfo[];
  const filteredStores = useFilteredItems(
    stores.map((s) => ({ ...s, id: s.key })),
    snap.filter,
    (s) => `${s.datasourceId} ${s.alias} ${s.page}`,
  );

  if (stores.length === 0) {
    return <div className="p-4 text-gray-500 text-sm">No active stores</div>;
  }

  if (filteredStores.length === 0) {
    return <div className="p-4 text-gray-500 text-sm">No stores match filter "{snap.filter}"</div>;
  }

  return (
    <div className="divide-y divide-gray-700">
      {filteredStores.map((store) => (
        <StoreItem key={store.key} store={store} />
      ))}
    </div>
  );
}

function QueriesTab() {
  const snap = useSnapshot(devtoolsStore);
  const queriesSnap = useSnapshot(queryStore);

  const queries = Object.entries(queriesSnap).map(([key, entry]) => {
    const colonIndex = key.indexOf(':');
    const actionName = colonIndex > -1 ? key.slice(0, colonIndex) : key;
    const paramsStr = colonIndex > -1 ? key.slice(colonIndex + 1) : '';
    let params: unknown[] = [];
    try {
      params = paramsStr ? JSON.parse(paramsStr) : [];
    } catch {
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
    return <div className="p-4 text-gray-500 text-sm">No cached queries</div>;
  }

  if (filteredQueries.length === 0) {
    return <div className="p-4 text-gray-500 text-sm">No queries match filter "{snap.filter}"</div>;
  }

  return (
    <div className="divide-y divide-gray-700">
      {filteredQueries.map((query) => (
        <QueryItem key={query.key} query={query} />
      ))}
    </div>
  );
}

interface QueryItemData {
  key: string;
  actionName: string;
  params: unknown[];
  status: 'loading' | 'success' | 'error';
  dataUpdatedAt?: number;
  error?: string;
  data?: unknown;
}

function QueryItem({ query }: { query: QueryItemData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="hover:bg-gray-800/50">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left"
      >
        {expanded ? (
          <ChevronDown className="size-3 shrink-0 text-gray-500" />
        ) : (
          <ChevronRight className="size-3 shrink-0 text-gray-500" />
        )}
        <span className="font-medium text-gray-200">{query.actionName}</span>
        {query.dataUpdatedAt && <span className="text-gray-600 text-xs">{formatTime(query.dataUpdatedAt)}</span>}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <StatusBadge status={query.status} />
        </div>
      </button>
      {expanded && (
        <div className="border-gray-700/50 border-t bg-gray-800/30 px-3 py-2 pl-8">
          <div className="space-y-0.5 text-gray-500 text-xs">
            {query.dataUpdatedAt && (
              <div>
                Updated: <span className="text-gray-400">{formatTime(query.dataUpdatedAt)}</span>
              </div>
            )}
            {query.error && <div className="text-red-400">Error: {query.error}</div>}
          </div>
          {query.params.length > 0 && <DataInspector data={query.params} label="Params" />}
          {query.data !== undefined && <DataInspector data={query.data} label="Response Data" />}
        </div>
      )}
    </div>
  );
}

function MutationItem({ mutation, slowThreshold }: { mutation: MutationEntry; slowThreshold: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="hover:bg-gray-800/50">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left"
      >
        {expanded ? (
          <ChevronDown className="size-3 shrink-0 text-gray-500" />
        ) : (
          <ChevronRight className="size-3 shrink-0 text-gray-500" />
        )}
        <span className="font-medium text-gray-200">{mutation.name}</span>
        <span className="text-gray-600 text-xs">{formatTime(mutation.startedAt)}</span>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <SlowIndicator duration={mutation.duration} threshold={slowThreshold} />
          <StatusBadge status={mutation.status} />
          <span className="text-gray-500 text-xs">{formatDuration(mutation.duration)}</span>
        </div>
      </button>
      {expanded && (
        <div className="border-gray-700/50 border-t bg-gray-800/30 px-3 py-2 pl-8">
          <div className="space-y-0.5 text-gray-500 text-xs">
            <div>
              Started: <span className="text-gray-400">{formatTime(mutation.startedAt)}</span>
            </div>
            {mutation.error && <div className="text-red-400">Error: {mutation.error}</div>}
            {mutation.invalidatedQueries && mutation.invalidatedQueries.length > 0 && (
              <div className="flex items-center gap-1">
                <RefreshCw className="size-3" />
                Invalidated: {mutation.invalidatedQueries.join(', ')}
              </div>
            )}
          </div>
          {mutation.params && <DataInspector data={mutation.params} label="Params" />}
          {mutation.result !== undefined && <DataInspector data={mutation.result} label="Result" />}
        </div>
      )}
    </div>
  );
}

function MutationsTab() {
  const snap = useSnapshot(devtoolsStore);
  const mutations = snap.mutations as MutationEntry[];
  const filteredMutations = useFilteredItems(mutations, snap.filter, (m) => `${m.name} ${JSON.stringify(m.params)}`);

  if (mutations.length === 0) {
    return <div className="p-4 text-gray-500 text-sm">No mutations recorded</div>;
  }

  if (filteredMutations.length === 0) {
    return <div className="p-4 text-gray-500 text-sm">No mutations match filter "{snap.filter}"</div>;
  }

  return (
    <div className="divide-y divide-gray-700">
      {filteredMutations.map((mutation) => (
        <MutationItem key={mutation.id} mutation={mutation} slowThreshold={snap.slowThreshold} />
      ))}
    </div>
  );
}

function findNetworkEntryForActivity(entry: ActivityEntry, networkEntries: NetworkEntry[]): NetworkEntry | undefined {
  if (entry.type === 'network') {
    return networkEntries.find((n) => n.activityId === entry.id);
  }
  return undefined;
}

const activityTypeColors: Record<string, string> = {
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
  const activity = snap.activity as ActivityEntry[];
  const network = snap.network as NetworkEntry[];
  const filteredActivity = useFilteredItems(activity, snap.filter, (a) => `${a.type} ${a.name}`);

  if (activity.length === 0) {
    return <div className="p-4 text-gray-500 text-sm">No activity recorded</div>;
  }

  if (filteredActivity.length === 0) {
    return <div className="p-4 text-gray-500 text-sm">No activity matches filter "{snap.filter}"</div>;
  }

  return (
    <div className="divide-y divide-gray-700">
      {filteredActivity.map((entry) => {
        const networkEntry = findNetworkEntryForActivity(entry, network);
        const context = networkEntry ? getNetworkContext(networkEntry) : null;
        return (
          <div key={entry.id} className="p-2 text-xs hover:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${activityTypeColors[entry.type] || 'text-gray-400'}`}>{entry.type}</span>
              {networkEntry && <NetworkTypeBadge type={networkEntry.type} />}
              <span className="flex-1 truncate text-gray-300">
                {entry.name}
                {context && <span className="ml-1 text-cyan-400">({context})</span>}
              </span>
              <SlowIndicator duration={entry.duration} threshold={snap.slowThreshold} />
              <StatusBadge status={entry.status} />
              <span className="text-gray-500">{formatDuration(entry.duration)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NetworkTypeBadge({ type }: { type: NetworkType }) {
  const colors: Record<NetworkType, string> = {
    api: 'bg-blue-500/20 text-blue-400',
    'server-action': 'bg-purple-500/20 text-purple-400',
    ds: 'bg-green-500/20 text-green-400',
    query: 'bg-yellow-500/20 text-yellow-400',
  };

  return <span className={`rounded px-1.5 py-0.5 font-medium text-[10px] ${colors[type]}`}>{type}</span>;
}

function getNetworkContext(entry: NetworkEntry): string | null {
  if (!entry.requestBody) return null;

  // For query requests, the request body is an array where first element is the action name
  if (entry.type === 'query' && Array.isArray(entry.requestBody)) {
    const firstParam = entry.requestBody[0];
    if (typeof firstParam === 'string') {
      return firstParam;
    }
  }

  if (typeof entry.requestBody === 'object' && !Array.isArray(entry.requestBody)) {
    const body = entry.requestBody as Record<string, unknown>;
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

function NetworkItem({ entry, slowThreshold }: { entry: NetworkEntry; slowThreshold: number }) {
  const [expanded, setExpanded] = useState(false);
  const context = getNetworkContext(entry);
  const openInPlayground = useOpenInPlayground();

  const handleOpenInPlayground = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (entry.type === 'ds' && entry.requestBody && typeof entry.requestBody === 'object') {
      const body = entry.requestBody as { ds: string; query?: Query<any>; rows?: Row<any>[] };
      if (body.ds && typeof body.ds === 'string') {
        openInPlayground(body.ds, body.query, body.rows);
      }
    }
  };

  const canOpenInPlayground = entry.type === 'ds' && Boolean(entry.requestBody);

  return (
    <div className="hover:bg-gray-800/50">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left"
      >
        {expanded ? (
          <ChevronDown className="size-3 shrink-0 text-gray-500" />
        ) : (
          <ChevronRight className="size-3 shrink-0 text-gray-500" />
        )}
        <NetworkTypeBadge type={entry.type} />
        <MethodBadge method={entry.method} />
        <span
          className="min-w-0 flex-1 truncate font-mono text-gray-200 text-xs"
          data-tip={entry.type === 'server-action' ? `Action on ${entry.url}` : entry.url}
        >
          {entry.url.replace(/^https?:\/\/[^/]+/, '')}
          {context && <span className="ml-1 text-cyan-400">({context})</span>}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {canOpenInPlayground && (
            <button
              type="button"
              onClick={handleOpenInPlayground}
              className="rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-green-400"
              data-tip="Open in API Playground"
            >
              <ExternalLink className="size-3" />
            </button>
          )}
          <SlowIndicator duration={entry.duration} threshold={slowThreshold} />
          {entry.statusCode ? <HttpStatusBadge status={entry.statusCode} /> : <StatusBadge status={entry.status} />}
          <span className="text-gray-500 text-xs">{formatDuration(entry.duration)}</span>
          <span className="text-gray-600 text-xs">{formatTime(entry.startedAt)}</span>
        </div>
      </button>
      {expanded && (
        <div className="border-gray-700/50 border-t bg-gray-800/30 px-3 py-2 pl-8">
          <div className="flex flex-wrap items-center gap-3 text-gray-500 text-xs">
            <span>Started: {formatTime(entry.startedAt)}</span>
            {entry.duration !== undefined && <span>Duration: {formatDuration(entry.duration)}</span>}
            {entry.responseSize !== undefined && entry.responseSize > 0 && (
              <span>Size: {formatBytes(entry.responseSize)}</span>
            )}
            {entry.type === 'server-action' && entry.actionName && (
              <span className="font-mono text-purple-400/70" data-tip={`Action ID: ${entry.actionName}`}>
                Action ID: {entry.actionName}
              </span>
            )}
            {entry.error && <span className="text-red-400">Error: {entry.error}</span>}
          </div>
          {entry.requestBody !== undefined && <DataInspector data={entry.requestBody} label="Request Body" />}
          {entry.responseBody !== undefined && <DataInspector data={entry.responseBody} label="Response Body" />}
        </div>
      )}
    </div>
  );
}

function NetworkTab() {
  const snap = useSnapshot(devtoolsStore);
  const network = snap.network as NetworkEntry[];
  const filteredNetwork = useFilteredItems(
    network,
    snap.filter,
    (n) => `${n.type} ${n.method} ${n.url} ${n.actionName ?? ''}`,
  );

  if (network.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        <p>No network requests recorded</p>
        <p className="mt-2 text-xs">
          Tracks <code className="rounded bg-gray-800 px-1">/api/*</code> routes and server actions.
        </p>
      </div>
    );
  }

  if (filteredNetwork.length === 0) {
    return <div className="p-4 text-gray-500 text-sm">No requests match filter "{snap.filter}"</div>;
  }

  return (
    <div className="divide-y divide-gray-700">
      {filteredNetwork.map((entry) => (
        <NetworkItem key={entry.id} entry={entry} slowThreshold={snap.slowThreshold} />
      ))}
    </div>
  );
}

function ErrorSourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    unhandled: 'bg-red-500/20 text-red-400',
    query: 'bg-blue-500/20 text-blue-400',
    mutation: 'bg-purple-500/20 text-purple-400',
    network: 'bg-teal-500/20 text-teal-400',
    validation: 'bg-orange-500/20 text-orange-400',
    server: 'bg-red-600/20 text-red-300',
    custom: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <span className={`rounded px-1.5 py-0.5 font-medium text-[10px] ${colors[source] || colors.custom}`}>{source}</span>
  );
}

function ErrorsTab() {
  const snap = useSnapshot(devtoolsStore);
  const errors = snap.errors as ErrorEntry[];
  const filteredErrors = useFilteredItems(errors, snap.filter, (e) => `${e.source} ${e.message} ${e.url ?? ''}`);

  if (errors.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        <p>No errors recorded</p>
        <p className="mt-2 text-xs">
          Errors from queries, mutations, network requests, and unhandled exceptions will appear here.
        </p>
      </div>
    );
  }

  if (filteredErrors.length === 0) {
    return <div className="p-4 text-gray-500 text-sm">No errors match filter "{snap.filter}"</div>;
  }

  return (
    <div className="divide-y divide-gray-700">
      {filteredErrors.map((entry) => (
        <div key={entry.id} className="p-3 hover:bg-gray-800/50">
          <div className="mb-1 flex items-center gap-2">
            <AlertCircle className="size-4 text-red-400" />
            <ErrorSourceBadge source={entry.source} />
            <span className="flex-1 truncate font-medium text-red-300 text-xs">{entry.message}</span>
            <span className="text-gray-500 text-xs">{formatTime(entry.timestamp)}</span>
          </div>
          {entry.url && (
            <div className="mb-1 text-gray-500 text-xs">
              <span className="text-gray-600">URL:</span> {entry.url}
            </div>
          )}
          {entry.stack && (
            <details className="mt-2">
              <summary className="cursor-pointer text-gray-400 text-xs hover:text-gray-200">Stack trace</summary>
              <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-gray-800/50 p-2 font-mono text-[10px] text-gray-400">
                {entry.stack}
              </pre>
            </details>
          )}
          {entry.context && <DataInspector data={entry.context} label="Context" />}
        </div>
      ))}
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value?: string | string[] | null }) {
  if (value === undefined || value === null) return null;

  const displayValue = Array.isArray(value) ? value.join(', ') : value;

  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="min-w-[140px] font-medium text-gray-400 text-xs">{label}</span>
      <span className="font-mono text-gray-200 text-xs">
        {displayValue || <span className="text-gray-500">-</span>}
      </span>
    </div>
  );
}

function ConfigSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-gray-700 border-b p-3">
      <h3 className="mb-2 font-semibold text-gray-300 text-sm">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function ConfigTab() {
  const snap = useSnapshot(devtoolsStore);
  const env = snap.environment as EnvironmentInfo;
  const config = snap.config as ConfigInfo;
  const hasConfig = Object.keys(config).length > 0;

  return (
    <div className="divide-y divide-gray-700">
      <ConfigSection title="Environment">
        <ConfigRow label="NODE_ENV" value={env.nodeEnv} />
        <ConfigRow label="App Version" value={env.appVersion} />
        <ConfigRow label="Current Path" value={env.pathname} />
      </ConfigSection>

      <ConfigSection title="User Session">
        <ConfigRow label="User Name" value={env.userName} />
        <ConfigRow label="Email" value={env.userEmail} />
        <ConfigRow label="Roles" value={env.userRoles} />
      </ConfigSection>

      {env.env && (
        <div className="p-3">
          <h3 className="mb-2 font-semibold text-gray-300 text-sm">Client Environment</h3>
          <div className="font-mono text-xs">
            <JsonTreeProvider>
              <JsonTreeValue
                value={env.env}
                theme="dark"
                defaultExpandedDepth={2}
                maxStringPreviewLength={128}
                maxArrayItems={50}
                maxObjectKeys={30}
              />
            </JsonTreeProvider>
          </div>
        </div>
      )}

      {hasConfig && (
        <div className="p-3">
          <h3 className="mb-2 font-semibold text-gray-300 text-sm">App Config</h3>
          <div className="font-mono text-xs">
            <JsonTreeProvider>
              <JsonTreeValue
                value={config}
                theme="dark"
                defaultExpandedDepth={2}
                maxStringPreviewLength={128}
                maxArrayItems={50}
                maxObjectKeys={30}
              />
            </JsonTreeProvider>
          </div>
        </div>
      )}
    </div>
  );
}

function getClearFunction(tab: DevtoolsTab): (() => void) | null {
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

  return (
    <div
      className={`fixed right-0 bottom-0 z-[9999] flex flex-col bg-gray-900 font-sans shadow-2xl ${isMaximized ? '' : 'border-gray-700 border-t border-l'}`}
      style={{ width: size.width, height: size.height }}
    >
      {/* Resize Handle - hidden when maximized */}
      {!isMaximized && (
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize panel"
          tabIndex={0}
          onMouseDown={handleMouseDown}
          className={`absolute top-0 left-0 z-10 size-4 cursor-nwse-resize ${isResizing ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
          data-tip="Drag to resize"
        >
          {/* Corner resize grip lines pointing outward */}
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-gray-400">
            <path d="M 2 14 L 14 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 2 9 L 9 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 2 4 L 4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-gray-700 border-b bg-gray-800 px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-green-500" />
            <span className="font-semibold text-gray-200 text-sm">
              <span className="tracking-[0.2em]">VENKY</span>
            </span>
          </div>
          <EnvironmentBadge />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={exportDebugState}
            className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            data-tip="Export Debug State"
          >
            <Download className="size-4" />
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            data-tip="Clear All"
          >
            <Trash2 className="size-4" />
          </button>
          {clearFn && (
            <button
              type="button"
              onClick={clearFn}
              className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              data-tip="Clear Tab"
            >
              <Eraser className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={toggleMaximize}
            className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            data-tip={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
          <button
            type="button"
            onClick={closeDevtools}
            className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            data-tip="Close (⌘⇧D)"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Tabs and Filter */}
      <div className="flex flex-col gap-2 border-gray-700 border-b bg-gray-850 p-2">
        <div className="flex items-center gap-1">
          <TabButton
            active={snap.activeTab === 'activity'}
            onClick={() => setActiveTab('activity')}
            icon={Activity}
            count={snap.activity.length}
          >
            Activity
          </TabButton>
          <TabButton
            active={snap.activeTab === 'stores'}
            onClick={() => setActiveTab('stores')}
            icon={Database}
            count={Object.keys(snap.stores).length}
          >
            Stores
          </TabButton>
          <TabButton active={snap.activeTab === 'queries'} onClick={() => setActiveTab('queries')} icon={Search}>
            Queries
          </TabButton>
          <TabButton
            active={snap.activeTab === 'mutations'}
            onClick={() => setActiveTab('mutations')}
            icon={Zap}
            count={snap.mutations.length}
          >
            Mutations
          </TabButton>
          <TabButton
            active={snap.activeTab === 'network'}
            onClick={() => setActiveTab('network')}
            icon={Globe}
            count={snap.network.length}
          >
            Network
          </TabButton>
          <TabButton
            active={snap.activeTab === 'errors'}
            onClick={() => setActiveTab('errors')}
            icon={AlertCircle}
            count={snap.errors.length}
          >
            Errors
          </TabButton>
          <TabButton active={snap.activeTab === 'config'} onClick={() => setActiveTab('config')} icon={Settings}>
            Config
          </TabButton>
        </div>
        <SearchFilter />
      </div>

      {/* Content */}
      <div className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 flex-1 overflow-auto">
        {snap.activeTab === 'stores' && <StoresTab />}
        {snap.activeTab === 'queries' && <QueriesTab />}
        {snap.activeTab === 'mutations' && <MutationsTab />}
        {snap.activeTab === 'activity' && <ActivityTab />}
        {snap.activeTab === 'network' && <NetworkTab />}
        {snap.activeTab === 'errors' && <ErrorsTab />}
        {snap.activeTab === 'config' && <ConfigTab />}
      </div>
    </div>
  );
}

/**
 * Floating toggle button for devtools.
 * Shows activity count badge when there are pending operations.
 *
 * @example
 * // Add to your layout
 * import { DevtoolsToggle } from 'venky-core/client';
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

  return (
    <button
      type="button"
      onClick={toggleDevtools}
      className="group fixed bottom-5 left-[64px] z-[9998] flex size-9 cursor-pointer items-center justify-center rounded-full bg-gray-900 font-sans text-gray-300 shadow-lg ring-1 ring-gray-700 transition-all hover:bg-gray-800 hover:ring-gray-600"
      data-tip={tooltip}
    >
      <Wrench className="size-4 text-blue-400 transition-transform group-hover:rotate-12" />

      {/* Pending badge (yellow) */}
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-yellow-500 font-bold text-[10px] text-gray-900">
          {pendingCount}
        </span>
      )}

      {/* Error badge (red) - shows when no pending but has errors */}
      {pendingCount === 0 && errorCount > 0 && (
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 font-bold text-[10px] text-white">
          {errorCount}
        </span>
      )}
    </button>
  );
}

/**
 * Hook to track route changes in Next.js App Router.
 * Must be used within a component that has access to usePathname.
 */
export function useDevtoolsRouteTracking(pathname: string | null): void {
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    if (!devtoolsStore.enabled || !pathname) return;

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
export function useDevtoolsEnvironment(info: Partial<EnvironmentInfo>): void {
  useEffect(() => {
    if (!devtoolsStore.enabled) return;
    setEnvironmentInfo(info);
  }, [info]);
}

/**
 * Hook to set config info in devtools.
 * Call this once in your layout after fetching server config.
 */
export function useDevtoolsConfig(info: Partial<ConfigInfo>): void {
  useEffect(() => {
    if (!devtoolsStore.enabled) return;
    setConfigInfo(info);
  }, [info]);
}

/**
 * Devtools component - renders the devtools panel.
 * Open via user menu "Debug Console" or keyboard shortcut ⌘⇧D.
 *
 * @example
 * // Add to your root layout
 * import { Devtools } from 'venky-core/client';
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
  return <DevtoolsPanel />;
}
