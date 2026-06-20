'use client';

import { LazyMonacoEditor } from '../MonacoEditorLazy';
import type { DataSource } from '../types';

interface PostTabProps {
  selectedDS: DataSource;
  postData: string;
  setPostData: (value: string) => void;
}

export function PostTab({ selectedDS, postData, setPostData }: PostTabProps) {
  return (
    <LazyMonacoEditor
      value={postData}
      datasourceId={selectedDS.id}
      type="Post"
      onChange={setPostData}
      disabled={!selectedDS}
    />
  );
}
