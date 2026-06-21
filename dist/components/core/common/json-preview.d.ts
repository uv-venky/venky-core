import type { ReactNode } from 'react';
export type JsonTheme = 'light' | 'dark';
export declare function JsonTreeValue({ value, theme, depth, defaultExpandedDepth, maxStringPreviewLength, maxArrayItems, maxObjectKeys, path, }: Readonly<{
    value: unknown;
    theme: JsonTheme;
    depth?: number;
    defaultExpandedDepth?: number;
    maxStringPreviewLength: number;
    maxArrayItems: number;
    maxObjectKeys: number;
    path?: string;
}>): import("react/jsx-runtime").JSX.Element;
/** Provides expand/collapse-all context for JsonTreeValue. Wrap any direct JsonTreeValue usage with this. */
export declare function JsonTreeProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export default function JsonPreview({ value, theme, maxStringPreviewLength, className, showEditorToggle, monacoPanelClassName, }: Readonly<{
    value: unknown;
    theme: JsonTheme;
    maxStringPreviewLength?: number;
    className?: string;
    /** When true, shows a toggle to switch between the tree inspector and read-only Monaco (JSON). */
    showEditorToggle?: boolean;
    /** Classes for the Monaco tab panel (merged with defaults; use for `min-height`/`max-height` overrides). */
    monacoPanelClassName?: string;
}>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=json-preview.d.ts.map