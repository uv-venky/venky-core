'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { LazyMonacoEditor } from '../MonacoEditorLazy';
export function QueryTab({ selectedDS, queryData, setQueryData }) {
    return (_jsx(LazyMonacoEditor, { value: queryData, datasourceId: selectedDS.id, type: "Query", onChange: setQueryData, disabled: !selectedDS }));
}
//# sourceMappingURL=query-tab.js.map