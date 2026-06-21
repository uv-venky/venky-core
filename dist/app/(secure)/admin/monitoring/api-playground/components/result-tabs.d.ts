import type { ApiResponse } from '../types';
interface ResultTabsProps {
  resultMode: 'Result' | 'Debug' | 'Headers';
  setResultMode: (mode: 'Result' | 'Debug' | 'Headers') => void;
  response: ApiResponse | null;
  error: string | null;
  headers: Headers | null;
  loading: boolean;
}
export declare function ResultTabs({
  resultMode,
  setResultMode,
  response,
  error,
  headers,
  loading,
}: ResultTabsProps): import('react/jsx-runtime').JSX.Element;
export {};
//# sourceMappingURL=result-tabs.d.ts.map
