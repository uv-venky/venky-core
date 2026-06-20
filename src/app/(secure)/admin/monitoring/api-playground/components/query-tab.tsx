'use client';

import { LazyMonacoEditor } from '../MonacoEditorLazy';
import type { DataSource } from '../types';

interface QueryTabProps {
  selectedDS: DataSource;
  queryData: string;
  setQueryData: (value: string) => void;
}

export function QueryTab({ selectedDS, queryData, setQueryData }: QueryTabProps) {
  return (
    <LazyMonacoEditor
      value={queryData}
      datasourceId={selectedDS.id}
      type="Query"
      onChange={setQueryData}
      disabled={!selectedDS}
    />
  );
}
