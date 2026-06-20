'use client';

import { createContext, useContext, useReducer, useMemo, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ApiResponse, DataSource } from './types';
import { get_json_default_value } from '@/app/api/ds-json-schema/json-schema-utils';
import { WHO_ATTRIBUTES } from './components/datasource-tab';
import { useURLBase64State } from '@/components/core/hooks/useURLBase64State';
import { useURLStringState } from '@/components/core/hooks/useURLStringState';
import { showError } from '@/components/core/common/Notification';
import { getErrorMessage, isErrorResponse } from '@/lib/core/common/error';
import { getTrackId } from '@/lib/core/client/state';
import { useLatest } from '@/components/core/hooks/useLatest';
import { applyHeaderModifiers } from '@/lib/core/client/header-plugin';
import { useLoadingControl } from '@/lib/core/client/loading-tracker';

const DEFAULT_QUERY_DATA = `{
  "filter": [],
  "select": [],
  "limit": 10,
  "offset": 0
}`;

const DEFAULT_POST_DATA = `[
  {
    "name": "Test Item",
    "description": "Test description"
  }
]`;

interface ApiTesterState {
  dataSources: DataSource[];
  selectedDS?: DataSource;
  queryMode: 'Query' | 'Post' | 'DS';
  resultMode: 'Result' | 'Debug' | 'Headers';
  role: string | null;
  queryData: string;
  postData: string;
  response: ApiResponse | null;
  loading: boolean;
  error: string | null;
  headers: Headers | null;
}

type ApiTesterAction =
  | { type: 'SET_DATA_SOURCES'; dataSources: DataSource[] }
  | { type: 'SET_SELECTED_DS'; ds: DataSource | undefined; initial?: boolean }
  | { type: 'SET_QUERY_MODE'; mode: 'Query' | 'Post' | 'DS' }
  | { type: 'SET_RESULT_MODE'; mode: 'Result' | 'Debug' | 'Headers' }
  | { type: 'SET_ROLE'; role: string | null }
  | { type: 'SET_QUERY_DATA'; data: string }
  | { type: 'SET_POST_DATA'; data: string }
  | { type: 'SET_RESPONSE'; response: ApiResponse | null }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_HEADERS'; headers: Headers | null };

function defaultQueryData(ds: DataSource) {
  return JSON.stringify(
    {
      filter: [],
      select: ds.attributes.filter((attr) => attr.select ?? true).map((attr) => attr.code),
      limit: 10,
      offset: 0,
      sort: {},
    },
    null,
    2,
  );
}

function defaultPostData(ds: DataSource) {
  return JSON.stringify(
    [
      ds.attributes
        .filter((attr) => (attr.insert ?? true) && !WHO_ATTRIBUTES.includes(attr.code))
        .reduce(
          (acc, attr) => {
            acc[attr.code] = get_json_default_value(attr);
            return acc;
          },
          {} as Record<string, any>,
        ),
    ],
    null,
    2,
  );
}

function apiTesterReducer(state: ApiTesterState, action: ApiTesterAction): ApiTesterState {
  switch (action.type) {
    case 'SET_DATA_SOURCES':
      return { ...state, dataSources: action.dataSources };
    case 'SET_SELECTED_DS': {
      if (!action.ds) {
        return {
          ...state,
          selectedDS: undefined,
          queryData: DEFAULT_QUERY_DATA,
          postData: DEFAULT_POST_DATA,
          response: null,
          error: null,
          headers: null,
          resultMode: 'Result',
        };
      }
      let queryData = state.queryData;
      let postData = state.postData;

      if (!action.initial || queryData === DEFAULT_QUERY_DATA) {
        queryData = defaultQueryData(action.ds);
      }

      if (!action.initial || postData === DEFAULT_POST_DATA) {
        postData = defaultPostData(action.ds);
      }

      return {
        ...state,
        selectedDS: action.ds,
        queryData,
        postData,
        response: null,
        error: null,
        headers: null,
        resultMode: 'Result',
      };
    }
    case 'SET_QUERY_MODE':
      return { ...state, queryMode: action.mode };
    case 'SET_RESULT_MODE':
      return { ...state, resultMode: action.mode };
    case 'SET_ROLE':
      return { ...state, role: action.role };
    case 'SET_QUERY_DATA':
      return { ...state, queryData: action.data };
    case 'SET_POST_DATA':
      return { ...state, postData: action.data };
    case 'SET_RESPONSE':
      return { ...state, response: action.response };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_HEADERS':
      return { ...state, headers: action.headers };
    default:
      return state;
  }
}

interface ApiTesterDispatch {
  setDataSources: (dataSources: DataSource[]) => void;
  setSelectedDS: (ds: DataSource | undefined, initial?: boolean) => void;
  setQueryMode: (mode: 'Query' | 'Post' | 'DS') => void;
  setResultMode: (mode: 'Result' | 'Debug' | 'Headers') => void;
  setRole: (role: string | null) => void;
  setQueryData: (data: string) => void;
  setPostData: (data: string) => void;
  setResponse: (response: ApiResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHeaders: (headers: Headers | null) => void;
}

interface ApiTesterContextType {
  state: ApiTesterState;
  dispatch: ApiTesterDispatch;
  executeQuery: () => Promise<void>;
}

const ApiTesterContext = createContext<ApiTesterContextType | undefined>(undefined);

function validateQueryMode(v: string): v is 'Query' | 'Post' | 'DS' {
  return ['Query', 'Post', 'DS'].includes(v);
}

function validateResultMode(v: string): v is 'Result' | 'Debug' | 'Headers' {
  return ['Result', 'Debug', 'Headers'].includes(v);
}

export function ApiTesterProvider({ children }: { children: ReactNode }) {
  const [urlQueryMode, setUrlQueryMode] = useURLStringState<'Query' | 'Post' | 'DS'>('tab', 'Query', validateQueryMode);
  const [urlResultMode, setUrlResultMode] = useURLStringState<'Result' | 'Debug' | 'Headers'>(
    'result',
    'Result',
    validateResultMode,
  );
  const [urlDs, setUrlDs] = useURLStringState<string>('ds', '');
  const [urlQueryData, setUrlQueryData] = useURLBase64State('query', DEFAULT_QUERY_DATA);
  const [urlPostData, setUrlPostData] = useURLBase64State('post', DEFAULT_POST_DATA);

  const [urlTimestamp] = useURLStringState<string>('t', ''); // Trigger from devtools
  const { increment, decrement } = useLoadingControl();

  const initialState: ApiTesterState = {
    dataSources: [],
    selectedDS: undefined,
    queryMode: urlQueryMode,
    resultMode: urlResultMode,
    role: null,
    queryData: urlQueryData,
    postData: urlPostData,
    response: null,
    loading: false,
    error: null,
    headers: null,
  };
  const doExecuteQueryOnLoad = useRef(urlQueryMode === 'Query' && urlQueryData !== DEFAULT_QUERY_DATA);
  const prevUrlQueryDataRef = useRef(urlQueryData);
  const prevUrlPostDataRef = useRef(urlPostData);
  const prevUrlDsRef = useRef(urlDs);
  const prevUrlTimestampRef = useRef(urlTimestamp);

  const [state, baseDispatch] = useReducer(apiTesterReducer, initialState);

  const dispatch: ApiTesterDispatch = useMemo(
    () => ({
      setDataSources: (dataSources: DataSource[]) => baseDispatch({ type: 'SET_DATA_SOURCES', dataSources }),
      setSelectedDS: (ds: DataSource | undefined, initial?: boolean) => {
        if (!ds) {
          showError('Data source not found');
        }
        setUrlDs(ds?.id ?? '');
        baseDispatch({ type: 'SET_SELECTED_DS', ds, initial });
      },
      setQueryMode: (mode: 'Query' | 'Post' | 'DS') => {
        setUrlQueryMode(mode);
        baseDispatch({ type: 'SET_QUERY_MODE', mode });
      },
      setResultMode: (mode: 'Result' | 'Debug' | 'Headers') => {
        setUrlResultMode(mode);
        baseDispatch({ type: 'SET_RESULT_MODE', mode });
      },
      setRole: (role: string | null) => baseDispatch({ type: 'SET_ROLE', role }),
      setQueryData: (data: string) => {
        setUrlQueryData(data);
        baseDispatch({ type: 'SET_QUERY_DATA', data });
      },
      setPostData: (data: string) => {
        setUrlPostData(data);
        baseDispatch({ type: 'SET_POST_DATA', data });
      },
      setResponse: (response: ApiResponse | null) => baseDispatch({ type: 'SET_RESPONSE', response }),
      setLoading: (loading: boolean) => baseDispatch({ type: 'SET_LOADING', loading }),
      setError: (error: string | null) => baseDispatch({ type: 'SET_ERROR', error }),
      setHeaders: (headers: Headers | null) => baseDispatch({ type: 'SET_HEADERS', headers }),
    }),
    [setUrlDs, setUrlQueryMode, setUrlResultMode, setUrlQueryData, setUrlPostData],
  );

  const latestState = useLatest(state);

  useEffect(() => {
    if (latestState.current.queryMode !== urlQueryMode) {
      baseDispatch({ type: 'SET_QUERY_MODE', mode: urlQueryMode });
    }
  }, [urlQueryMode, latestState]);

  // Detect URL changes (e.g., from devtools "Open in Playground") and trigger re-execution
  useEffect(() => {
    const urlQueryChanged = prevUrlQueryDataRef.current !== urlQueryData;
    const urlPostChanged = prevUrlPostDataRef.current !== urlPostData;
    const urlDsChanged = prevUrlDsRef.current !== urlDs;
    const timestampChanged = prevUrlTimestampRef.current !== urlTimestamp && urlTimestamp !== '';

    if (
      (urlQueryChanged || urlDsChanged || timestampChanged) &&
      urlQueryMode === 'Query' &&
      urlQueryData !== DEFAULT_QUERY_DATA
    ) {
      doExecuteQueryOnLoad.current = true;

      // Update state from URL if different from current state
      if ((urlQueryChanged || timestampChanged) && latestState.current.queryData !== urlQueryData) {
        baseDispatch({ type: 'SET_QUERY_DATA', data: urlQueryData });
      }
      if ((urlDsChanged || timestampChanged) && latestState.current.selectedDS?.id !== urlDs) {
        const ds = state.dataSources.find((d) => d.id === urlDs);
        if (ds) {
          baseDispatch({ type: 'SET_SELECTED_DS', ds, initial: true /* to avoid default query data */ });
        }
      }
    }

    if (
      (urlPostChanged || urlDsChanged || timestampChanged) &&
      urlQueryMode === 'Post' &&
      urlPostData !== DEFAULT_POST_DATA
    ) {
      doExecuteQueryOnLoad.current = true;

      // Update state from URL if different from current state
      if ((urlPostChanged || timestampChanged) && latestState.current.queryData !== urlPostData) {
        baseDispatch({ type: 'SET_POST_DATA', data: urlPostData });
      }
      if ((urlDsChanged || timestampChanged) && latestState.current.selectedDS?.id !== urlDs) {
        const ds = state.dataSources.find((d) => d.id === urlDs);
        if (ds) {
          baseDispatch({ type: 'SET_SELECTED_DS', ds, initial: true /* to avoid default query data */ });
        }
      }
    }

    prevUrlQueryDataRef.current = urlQueryData;
    prevUrlPostDataRef.current = urlPostData;
    prevUrlDsRef.current = urlDs;
    prevUrlTimestampRef.current = urlTimestamp;
  }, [urlQueryData, urlPostData, urlDs, urlQueryMode, urlTimestamp, state.dataSources, latestState]);

  const executeQuery = useCallback(async () => {
    if (!latestState.current.selectedDS || !latestState.current.queryData?.trim()) {
      dispatch.setError('Please select a data source and provide query data');
      return;
    }
    increment(`ds:${latestState.current.selectedDS.id}`);
    dispatch.setLoading(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      headers['X-Track-Id'] = getTrackId();
      applyHeaderModifiers(headers);

      const payload = {
        ds: latestState.current.selectedDS.id,
        query: JSON.parse(latestState.current.queryData),
        debug: true,
      };

      const response = await fetch('/api/ds', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      dispatch.setHeaders(response.headers);

      const result = await response.json();
      if (isErrorResponse(result)) {
        dispatch.setError(result.message);
      } else {
        dispatch.setError(null);
      }
      dispatch.setResponse(result);
    } catch (err) {
      dispatch.setError(err instanceof Error ? err.message : 'Failed to execute query');
      dispatch.setResponse(null);
    } finally {
      dispatch.setLoading(false);
      decrement();
    }
  }, [latestState, dispatch, increment, decrement]);

  useEffect(() => {
    const loadDataSources = async () => {
      try {
        increment('ds:list');
        const response = await fetch('/api/ds/list', {
          credentials: 'include',
          method: 'GET',
        });
        if (response.ok) {
          const data = await response.json();
          dispatch.setDataSources(data.dataSources || []);
          // Read DS directly from URL to avoid SSR/hydration timing issues
          const targetDs =
            typeof window !== 'undefined' ? new URLSearchParams(window.location.hash.slice(1)).get('ds') : null;
          if (targetDs) {
            const ds = data.dataSources.find((d: DataSource) => d.id === targetDs) ?? data.dataSources[0];
            dispatch.setSelectedDS(ds, true);
          } else {
            dispatch.setSelectedDS(data.dataSources[0]);
          }
        }
      } catch (err) {
        showError(getErrorMessage(err));
      } finally {
        decrement();
      }
    };
    loadDataSources();
  }, [dispatch, increment, decrement]);

  useEffect(() => {
    if (state.selectedDS && state.queryData && doExecuteQueryOnLoad.current) {
      executeQuery();
      doExecuteQueryOnLoad.current = false;
    }
  }, [state.selectedDS, state.queryData, executeQuery]);

  const value = useMemo(() => ({ state, dispatch, executeQuery }), [state, dispatch, executeQuery]);

  return <ApiTesterContext.Provider value={value}>{children}</ApiTesterContext.Provider>;
}

export function useApiTester() {
  const ctx = useContext(ApiTesterContext);
  if (!ctx) {
    throw new Error('useApiTester must be used within ApiTesterProvider');
  }
  return ctx;
}
