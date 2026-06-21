import { type ComponentProps } from 'react';
import type { SQLEditorProps } from './SQLEditor';
/**
 * Lazy-loaded SQL Editor component.
 * Use this instead of SQLEditor for better initial bundle size.
 */
declare const LazySQLEditorInner: import("react").LazyExoticComponent<typeof import("./SQLEditor").default>;
declare function LazySQLEditor(props: ComponentProps<typeof LazySQLEditorInner>): import("react/jsx-runtime").JSX.Element;
export { LazySQLEditor };
export type { SQLEditorProps };
//# sourceMappingURL=SQLEditorLazy.d.ts.map