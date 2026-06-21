import { type ComponentProps } from 'react';
import type { EditorProps } from '@monaco-editor/react';
/**
 * Lazy-loaded Monaco Code Editor component.
 * Use this instead of CodeEditor for better initial bundle size.
 */
declare const LazyCodeEditorInner: import("react").LazyExoticComponent<typeof import("./code-editor").CodeEditor>;
export declare function LazyCodeEditor(props: ComponentProps<typeof LazyCodeEditorInner>): import("react/jsx-runtime").JSX.Element;
export type { EditorProps };
//# sourceMappingURL=code-editor-lazy.d.ts.map