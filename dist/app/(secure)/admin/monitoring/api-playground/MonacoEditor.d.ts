import '../../../../../lib/monaco-setup';
export default function MonacoEditor({
  value,
  onChange,
  placeholder,
  disabled,
  datasourceId,
  type,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  datasourceId?: string;
  type: 'Query' | 'Post' | 'Result';
}): import('react/jsx-runtime').JSX.Element;
//# sourceMappingURL=MonacoEditor.d.ts.map
