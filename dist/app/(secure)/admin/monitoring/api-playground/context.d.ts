import type { ReactNode } from 'react';
import type { ApiResponse, DataSource } from './types';
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
export declare function ApiTesterProvider({
  children,
}: {
  children: ReactNode;
}): import('react/jsx-runtime').JSX.Element;
export declare function useApiTester(): ApiTesterContextType;
export {};
//# sourceMappingURL=context.d.ts.map
