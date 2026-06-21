'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { LazyMonacoEditor } from '../MonacoEditorLazy';
export function PostTab({ selectedDS, postData, setPostData }) {
  return _jsx(LazyMonacoEditor, {
    value: postData,
    datasourceId: selectedDS.id,
    type: 'Post',
    onChange: setPostData,
    disabled: !selectedDS,
  });
}
//# sourceMappingURL=post-tab.js.map
