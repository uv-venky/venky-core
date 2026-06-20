'use client';

// Import monaco-setup to configure the loader to use local monaco-editor package
import '@/lib/monaco-setup';
import MonacoEditor, { type EditorProps, type OnMount } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { vercelDarkTheme } from '@/lib/monaco-theme';

export function CodeEditor(props: EditorProps) {
  const { resolvedTheme } = useTheme();

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Configure theme (only if editor API is available)
    if (monaco.editor) {
      monaco.editor.defineTheme('vercel-dark', vercelDarkTheme);
      monaco.editor.setTheme(resolvedTheme === 'dark' ? 'vercel-dark' : 'light');
    }

    // Configure JSON language defaults
    const language = props.language || props.defaultLanguage;
    if (language === 'json' && monaco.json) {
      monaco.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: false,
        trailingCommas: 'error',
        schemaValidation: 'error',
      });
    }

    // Configure TypeScript/JavaScript language defaults
    if ((language === 'typescript' || language === 'javascript') && monaco.typescript) {
      const defaults =
        language === 'typescript' ? monaco.typescript.typescriptDefaults : monaco.typescript.javascriptDefaults;

      defaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      defaults.setCompilerOptions({
        target: monaco.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.typescript.JsxEmit.React,
        allowJs: true,
        strict: true,
      });
    }

    if (props.onMount) {
      props.onMount(editor, monaco);
    }
  };

  return (
    <MonacoEditor {...props} onMount={handleEditorMount} theme={resolvedTheme === 'dark' ? 'vercel-dark' : 'light'} />
  );
}
