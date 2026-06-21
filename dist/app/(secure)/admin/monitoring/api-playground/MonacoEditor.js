import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { showError } from '../../../../../components/core/common/Notification';
import { isErrorResponse } from '../../../../../lib/core/common/error';
// Import monaco-setup to configure the loader to use local monaco-editor package
import '../../../../../lib/monaco-setup';
import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import useAutoSizer from '../../../../../components/core/hooks/useAutoSizer';
import useTheme from '../../../../../components/core/hooks/useTheme';
export default function MonacoEditor({ value, onChange, placeholder, disabled, datasourceId, type = 'Query' }) {
  const [_editor, setEditor] = useState(null);
  const [monaco, setMonaco] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const { height, width, Container } = useAutoSizer();
  const { theme } = useTheme();
  useEffect(() => {
    if (!monaco?.json || !datasourceId) return;
    const fetchSchema = async () => {
      const res = await fetch('/api/ds-json-schema', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ ds: datasourceId, type }),
      });
      const resp = await res.json();
      if (isErrorResponse(resp)) {
        showError(resp.message);
        return;
      }
      monaco.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: false,
        schemas: [
          {
            uri: 'http://json-schema.org/draft-07/schema#',
            fileMatch: ['*'],
            schema: JSON.parse(resp.schema),
          },
        ],
      });
    };
    fetchSchema();
  }, [monaco, datasourceId, type]);
  const handleEditorDidMount = (editor, monaco) => {
    setEditor(editor);
    setMonaco(monaco);
    // Configure JSON language defaults for better editing experience
    if (monaco.json) {
      monaco.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: false,
        trailingCommas: 'error',
        schemaValidation: 'error',
      });
    }
    // Set initial value
    if (!value?.trim()) {
      editor.setValue(placeholder || '{\n  \n}');
    }
    // Handle validation
    const validateModel = () => {
      try {
        JSON.parse(editor.getValue());
        setIsValid(true);
      } catch (_e) {
        // console.error('Error parsing JSON', e);
        setIsValid(false);
      }
    };
    editor.onDidChangeModelContent(validateModel);
    validateModel();
  };
  const handleEditorChange = (value) => {
    if (value !== undefined) {
      onChange?.(value);
    }
  };
  return _jsxs(Container, {
    className: 'relative h-full w-full',
    children: [
      _jsx(Editor, {
        height: height,
        width: width,
        language: 'json',
        theme: theme === 'dark' ? 'vs-dark' : 'vs-light',
        value: value,
        onChange: handleEditorChange,
        onMount: handleEditorDidMount,
        options: {
          readOnly: disabled,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          lineNumbers: 'on',
          roundedSelection: false,
          automaticLayout: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          wordBasedSuggestions: 'currentDocument',
          parameterHints: {
            enabled: true,
          },
          hover: {
            enabled: true,
          },
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: false,
          trimAutoWhitespace: true,
          largeFileOptimizations: true,
        },
      }),
      !isValid &&
        !disabled &&
        _jsx('div', {
          className: 'absolute right-2 bottom-2 rounded bg-red-500 px-2 py-1 text-white text-xs',
          children: 'Invalid JSON',
        }),
    ],
  });
}
//# sourceMappingURL=MonacoEditor.js.map
