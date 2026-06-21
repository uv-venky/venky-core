import '../../../../lib/monaco-setup';
import type { editor } from 'monaco-editor';
export interface SQLEditorProps {
    value: string;
    onChange: (value: string) => void;
    handleEditorDidMount: (editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => void;
}
export default function SQLEditor({ value, onChange, handleEditorDidMount }: SQLEditorProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SQLEditor.d.ts.map