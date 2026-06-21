import { type ComponentProps } from 'react';
interface MonacoEditorProps {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  datasourceId?: string;
  type: 'Query' | 'Post' | 'Result';
}
/**
 * Lazy-loaded Monaco Editor component for API Playground.
 * Use this instead of MonacoEditor for better initial bundle size.
 */
declare const LazyMonacoEditorInner: import('react').LazyExoticComponent<typeof import('./MonacoEditor').default>;
declare function LazyMonacoEditor(
  props: ComponentProps<typeof LazyMonacoEditorInner>,
): import('react/jsx-runtime').JSX.Element;
export { LazyMonacoEditor };
export type { MonacoEditorProps };
//# sourceMappingURL=MonacoEditorLazy.d.ts.map
