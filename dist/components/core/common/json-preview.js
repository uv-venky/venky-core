'use client';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { LazyCodeEditor } from '../../../components/ui/code-editor-lazy';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { cn } from '../../../lib/utils';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
const VIEW_MODES = { Tree: 'tree', Editor: 'editor' };
function stringifyJsonForEditor(value) {
    try {
        return JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2);
    }
    catch {
        try {
            return JSON.stringify(value, null, 2);
        }
        catch {
            return `Unable to format as JSON (${String(value)}).`;
        }
    }
}
/** Overlay Tree | Editor pills: labels + trays hidden until tray hover/focus-within (`group/json-toggle` on TabsList). */
const JSON_PREVIEW_TOGGLE_TRIGGER_CLASS = cn('h-7 bg-transparent px-2 text-xs shadow-none transition-[background-color,color,box-shadow,backdrop-filter]', 'hover:bg-transparent', 
// Override tabs.tsx `data-[state=active]:text-foreground` so idle active tab stays invisible until overlay reveal.
'text-transparent data-[state=active]:text-transparent data-[state=inactive]:text-transparent', 'group-hover/json-toggle:data-[state=inactive]:text-muted-foreground group-focus-within/json-toggle:data-[state=inactive]:text-muted-foreground', 'group-hover/json-toggle:data-[state=active]:text-foreground group-focus-within/json-toggle:data-[state=active]:text-foreground', 'data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:shadow-none', 'group-hover/json-toggle:data-[state=active]:bg-background/40 group-hover/json-toggle:data-[state=active]:font-semibold group-hover/json-toggle:data-[state=active]:ring-1 group-hover/json-toggle:data-[state=active]:ring-border/40 group-hover/json-toggle:data-[state=active]:backdrop-blur-sm dark:group-hover/json-toggle:data-[state=active]:bg-background/25 dark:group-hover/json-toggle:data-[state=active]:ring-border/50', 'group-focus-within/json-toggle:data-[state=active]:bg-background/40 group-focus-within/json-toggle:data-[state=active]:font-semibold group-focus-within/json-toggle:data-[state=active]:ring-1 group-focus-within/json-toggle:data-[state=active]:ring-border/40 group-focus-within/json-toggle:data-[state=active]:backdrop-blur-sm dark:group-focus-within/json-toggle:data-[state=active]:bg-background/25 dark:group-focus-within/json-toggle:data-[state=active]:ring-border/50');
const MAX_ITEMS = 50;
const MAX_KEYS = 50;
/** Items/keys revealed per click on “… N more” for arrays and objects. */
const ARRAY_OBJECT_PAGE_STEP = 20;
const DEFAULT_MAX_STRING_PREVIEW_LENGTH = 300;
function cx(...classes) {
    return classes.filter(Boolean).join(' ');
}
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isExpandable(value) {
    return Array.isArray(value) || isPlainObject(value);
}
const JsonTreeContext = createContext(null);
function useJsonTreeContext() {
    const [expandedSet, setExpandedSet] = useState(() => new Set());
    const [collapsedSet, setCollapsedSet] = useState(() => new Set());
    const isExpanded = useCallback((path, depth, depthDefault) => {
        if (collapsedSet.has(path))
            return false;
        if (expandedSet.has(path))
            return true;
        return depth < depthDefault;
    }, [expandedSet, collapsedSet]);
    const setExpanded = useCallback((path, expanded) => {
        if (expanded) {
            setExpandedSet((prev) => new Set(prev).add(path));
            setCollapsedSet((prev) => {
                const next = new Set(prev);
                next.delete(path);
                return next;
            });
        }
        else {
            setCollapsedSet((prev) => new Set(prev).add(path));
            setExpandedSet((prev) => {
                const next = new Set(prev);
                next.delete(path);
                return next;
            });
        }
    }, []);
    const expandAllAt = useCallback((childPaths) => {
        setExpandedSet((prev) => {
            const next = new Set(prev);
            for (const p of childPaths)
                next.add(p);
            return next;
        });
        setCollapsedSet((prev) => {
            const next = new Set(prev);
            for (const p of childPaths)
                next.delete(p);
            return next;
        });
    }, []);
    const collapseAllAt = useCallback((childPaths) => {
        setCollapsedSet((prev) => {
            const next = new Set(prev);
            for (const p of childPaths)
                next.add(p);
            return next;
        });
        setExpandedSet((prev) => {
            const next = new Set(prev);
            for (const p of childPaths)
                next.delete(p);
            return next;
        });
    }, []);
    return useMemo(() => ({ isExpanded, setExpanded, expandAllAt, collapseAllAt }), [isExpanded, setExpanded, expandAllAt, collapseAllAt]);
}
function pathJoin(parentPath, segment) {
    return parentPath ? `${parentPath}.${segment}` : String(segment);
}
/** Collect all expandable paths in the subtree (recursive) for expand/collapse all. */
function collectExpandablePathsRecursive(value, basePath, maxArrayItems, maxObjectKeys) {
    if (Array.isArray(value)) {
        const visible = value.slice(0, maxArrayItems);
        const paths = [];
        for (let i = 0; i < visible.length; i++) {
            const p = pathJoin(basePath, i);
            const item = visible[i];
            if (isExpandable(item)) {
                paths.push(p);
                paths.push(...collectExpandablePathsRecursive(item, p, maxArrayItems, maxObjectKeys));
            }
        }
        return paths;
    }
    if (isPlainObject(value)) {
        const entries = Object.entries(value).slice(0, maxObjectKeys);
        const paths = [];
        for (const [key, item] of entries) {
            const p = pathJoin(basePath, key);
            if (isExpandable(item)) {
                paths.push(p);
                paths.push(...collectExpandablePathsRecursive(item, p, maxArrayItems, maxObjectKeys));
            }
        }
        return paths;
    }
    return [];
}
function JsonStringValue({ value, maxStringPreviewLength, theme, }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = value.length > maxStringPreviewLength;
    const showFull = !isLong || expanded;
    if (showFull) {
        return (_jsxs("span", { className: "inline-flex flex-wrap items-baseline gap-1", children: [_jsxs("span", { className: theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700', children: ["\"", value, "\""] }), isLong && (_jsxs("button", { type: "button", onClick: () => setExpanded(false), className: cx('inline-flex items-center gap-0.5 whitespace-nowrap rounded border px-1.5 py-0.5 font-medium text-[11px] leading-4', theme === 'dark'
                        ? 'border-zinc-600 bg-zinc-800 text-sky-300 hover:bg-zinc-700'
                        : 'border-zinc-300 bg-zinc-100 text-sky-700 hover:bg-zinc-200'), "aria-label": "Show less", children: [_jsx(ChevronUp, { className: "size-3 shrink-0" }), "Show less"] }))] }));
    }
    return (_jsxs("span", { className: "inline-flex flex-wrap items-baseline gap-1", children: [_jsxs("span", { className: theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700', children: ["\"", value.slice(0, maxStringPreviewLength), "...\""] }), _jsxs("button", { type: "button", onClick: () => setExpanded(true), className: cx('inline-flex items-center gap-0.5 whitespace-nowrap rounded border px-1.5 py-0.5 font-medium text-[11px] leading-4', theme === 'dark'
                    ? 'border-zinc-600 bg-zinc-800 text-sky-300 hover:bg-zinc-700'
                    : 'border-zinc-300 bg-zinc-100 text-sky-700 hover:bg-zinc-200'), "aria-label": `Show full string (${value.length} characters)`, children: [_jsx(ChevronDown, { className: "size-3 shrink-0" }), "Show more (", value.length, ")"] })] }));
}
function JsonArrayTreeBranch({ value, theme, depth, defaultExpandedDepth, maxStringPreviewLength, maxArrayItems, maxObjectKeys, path, expanded, setExpanded, }) {
    const ctx = useContext(JsonTreeContext);
    const [arrayShowCount, setArrayShowCount] = useState(maxArrayItems);
    const visible = value.slice(0, arrayShowCount);
    const expandableDescendantPaths = collectExpandablePathsRecursive(value.slice(0, arrayShowCount), path, maxArrayItems, maxObjectKeys);
    const arrayHiddenCount = value.length - arrayShowCount;
    return (_jsxs("div", { className: "inline", children: [_jsxs("span", { className: "inline-flex flex-wrap items-center gap-1", children: [_jsxs("button", { type: "button", onClick: () => setExpanded(!expanded), className: cx('inline-flex items-center gap-1', theme === 'dark' ? 'text-zinc-300 hover:text-zinc-100' : 'text-zinc-700 hover:text-zinc-900'), children: [expanded ? _jsx(ChevronDown, { className: "size-3" }) : _jsx(ChevronRight, { className: "size-3" }), _jsxs("span", { className: theme === 'dark' ? 'text-violet-300' : 'text-violet-700', children: ["[", value.length, "]"] })] }), ctx && expandableDescendantPaths.length > 0 && (_jsxs("span", { className: cx('text-[11px]', theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'), children: [_jsx("button", { type: "button", onClick: () => ctx.expandAllAt([path, ...expandableDescendantPaths]), className: "hover:underline", children: "Expand all" }), _jsx("span", { className: "mx-0.5", children: "\u00B7" }), _jsx("button", { type: "button", onClick: () => ctx.collapseAllAt([path, ...expandableDescendantPaths]), className: "hover:underline", children: "Collapse all" })] }))] }), expanded && (_jsxs("div", { className: cx('ml-2 border-l pl-2', theme === 'dark' ? 'border-zinc-700' : 'border-zinc-300'), children: [visible.map((item, index) => {
                        const childPath = pathJoin(path, index);
                        return (_jsxs("div", { className: "flex gap-1", children: [_jsxs("span", { className: "text-zinc-500", children: [index, ":"] }), _jsx(JsonTreeValue, { value: item, path: childPath, depth: depth + 1, theme: theme, defaultExpandedDepth: defaultExpandedDepth, maxStringPreviewLength: maxStringPreviewLength, maxArrayItems: maxArrayItems, maxObjectKeys: maxObjectKeys })] }, index));
                    }), arrayHiddenCount > 0 && (_jsxs("button", { type: "button", onClick: () => setArrayShowCount((c) => Math.min(c + ARRAY_OBJECT_PAGE_STEP, value.length)), className: cx('block w-full text-left font-mono text-[12px] leading-5', theme === 'dark'
                            ? 'text-zinc-500 hover:text-zinc-300 hover:underline'
                            : 'text-zinc-500 hover:text-zinc-700 hover:underline'), "aria-label": `Show up to ${Math.min(ARRAY_OBJECT_PAGE_STEP, arrayHiddenCount)} more items, ${arrayHiddenCount} hidden`, children: ["... ", arrayHiddenCount, " more items"] }))] }))] }));
}
function JsonObjectTreeBranch({ entries, theme, depth, defaultExpandedDepth, maxStringPreviewLength, maxArrayItems, maxObjectKeys, path, expanded, setExpanded, }) {
    const ctx = useContext(JsonTreeContext);
    const [objectShowCount, setObjectShowCount] = useState(maxObjectKeys);
    const visible = entries.slice(0, objectShowCount);
    const partialObject = Object.fromEntries(visible);
    const expandableDescendantPaths = collectExpandablePathsRecursive(partialObject, path, maxArrayItems, maxObjectKeys);
    const objectHiddenCount = entries.length - objectShowCount;
    return (_jsxs("div", { className: "inline", children: [_jsxs("span", { className: "inline-flex flex-wrap items-center gap-1", children: [_jsxs("button", { type: "button", onClick: () => setExpanded(!expanded), className: cx('inline-flex items-center gap-1', theme === 'dark' ? 'text-zinc-300 hover:text-zinc-100' : 'text-zinc-700 hover:text-zinc-900'), children: [expanded ? _jsx(ChevronDown, { className: "size-3" }) : _jsx(ChevronRight, { className: "size-3" }), _jsxs("span", { className: theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700', children: ['{', entries.length, '}'] })] }), ctx && expandableDescendantPaths.length > 0 && (_jsxs("span", { className: cx('text-[11px]', theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'), children: [_jsx("button", { type: "button", onClick: () => ctx.expandAllAt([path, ...expandableDescendantPaths]), className: "hover:underline", children: "Expand all" }), _jsx("span", { className: "mx-0.5", children: "\u00B7" }), _jsx("button", { type: "button", onClick: () => ctx.collapseAllAt([path, ...expandableDescendantPaths]), className: "hover:underline", children: "Collapse all" })] }))] }), expanded && (_jsxs("div", { className: cx('ml-2 border-l pl-2', theme === 'dark' ? 'border-zinc-700' : 'border-zinc-300'), children: [visible.map(([key, innerValue]) => {
                        const childPath = pathJoin(path, key);
                        return (_jsxs("div", { className: "flex gap-1", children: [_jsxs("span", { className: theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700', children: [key, ":"] }), _jsx(JsonTreeValue, { value: innerValue, path: childPath, depth: depth + 1, theme: theme, defaultExpandedDepth: defaultExpandedDepth, maxStringPreviewLength: maxStringPreviewLength, maxArrayItems: maxArrayItems, maxObjectKeys: maxObjectKeys })] }, key));
                    }), objectHiddenCount > 0 && (_jsxs("button", { type: "button", onClick: () => setObjectShowCount((c) => Math.min(c + ARRAY_OBJECT_PAGE_STEP, entries.length)), className: cx('block w-full text-left font-mono text-[12px] leading-5', theme === 'dark'
                            ? 'text-zinc-500 hover:text-zinc-300 hover:underline'
                            : 'text-zinc-500 hover:text-zinc-700 hover:underline'), "aria-label": `Show up to ${Math.min(ARRAY_OBJECT_PAGE_STEP, objectHiddenCount)} more keys, ${objectHiddenCount} hidden`, children: ["... ", objectHiddenCount, " more keys"] }))] }))] }));
}
export function JsonTreeValue({ value, theme, depth = 0, defaultExpandedDepth = 1, maxStringPreviewLength, maxArrayItems, maxObjectKeys, path = '', }) {
    const ctx = useContext(JsonTreeContext);
    const [localExpanded, setLocalExpanded] = useState(depth < defaultExpandedDepth);
    const expanded = ctx ? ctx.isExpanded(path, depth, defaultExpandedDepth) : localExpanded;
    const setExpanded = ctx ? (next) => ctx.setExpanded(path, next) : setLocalExpanded;
    if (value === null) {
        return _jsx("span", { className: theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500', children: "null" });
    }
    if (value === undefined) {
        return _jsx("span", { className: theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500', children: "undefined" });
    }
    if (typeof value === 'boolean') {
        return _jsx("span", { className: theme === 'dark' ? 'text-amber-300' : 'text-amber-700', children: String(value) });
    }
    if (typeof value === 'number') {
        return _jsx("span", { className: theme === 'dark' ? 'text-blue-300' : 'text-blue-700', children: value });
    }
    if (typeof value === 'string') {
        return _jsx(JsonStringValue, { value: value, maxStringPreviewLength: maxStringPreviewLength, theme: theme });
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return _jsx("span", { className: theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500', children: "[]" });
        }
        return (_jsx(JsonArrayTreeBranch, { value: value, theme: theme, depth: depth, defaultExpandedDepth: defaultExpandedDepth, maxStringPreviewLength: maxStringPreviewLength, maxArrayItems: maxArrayItems, maxObjectKeys: maxObjectKeys, path: path, expanded: expanded, setExpanded: setExpanded }));
    }
    if (isPlainObject(value)) {
        const entries = Object.entries(value);
        if (entries.length === 0) {
            return _jsx("span", { className: theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500', children: '{}' });
        }
        return (_jsx(JsonObjectTreeBranch, { entries: entries, theme: theme, depth: depth, defaultExpandedDepth: defaultExpandedDepth, maxStringPreviewLength: maxStringPreviewLength, maxArrayItems: maxArrayItems, maxObjectKeys: maxObjectKeys, path: path, expanded: expanded, setExpanded: setExpanded }));
    }
    return _jsx("span", { className: theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700', children: String(value) });
}
const DEFAULT_EXPANDED_DEPTH = 1;
/** Provides expand/collapse-all context for JsonTreeValue. Wrap any direct JsonTreeValue usage with this. */
export function JsonTreeProvider({ children }) {
    const value = useJsonTreeContext();
    return _jsx(JsonTreeContext.Provider, { value: value, children: children });
}
export default function JsonPreview({ value, theme, maxStringPreviewLength = DEFAULT_MAX_STRING_PREVIEW_LENGTH, className, showEditorToggle = true, monacoPanelClassName, }) {
    const normalized = useMemo(() => value ?? {}, [value]);
    const formattedJson = useMemo(() => stringifyJsonForEditor(normalized), [normalized]);
    const treeContext = useJsonTreeContext();
    const [viewMode, setViewMode] = useState(VIEW_MODES.Tree);
    return (_jsx("div", { className: cn('relative flex max-h-[60vh] min-h-0 w-full flex-1 flex-col overflow-hidden rounded-md border p-0', theme === 'dark' ? 'border-zinc-700 bg-zinc-900/50 text-zinc-100' : 'border-zinc-200 bg-zinc-50 text-zinc-900', className), children: showEditorToggle ? (_jsxs(Tabs, { value: viewMode, className: "flex h-full min-h-0 flex-1 flex-col gap-0", onValueChange: (value) => {
                if (value === VIEW_MODES.Tree || value === VIEW_MODES.Editor) {
                    setViewMode(value);
                }
            }, children: [_jsx("div", { className: "pointer-events-none absolute top-2 right-2 z-10", children: _jsxs(TabsList, { className: cn('group/json-toggle pointer-events-auto h-9 shrink-0 p-1 transition-[background-color,box-shadow,backdrop-filter]', 'bg-transparent shadow-none ring-0 ring-transparent backdrop-blur-0', 'hover:bg-muted/85 hover:shadow-sm hover:ring-1 hover:ring-border/50 hover:backdrop-blur-sm', 'focus-within:bg-muted/85 focus-within:shadow-sm focus-within:ring-1 focus-within:ring-border/50 focus-within:backdrop-blur-sm'), children: [_jsx(TabsTrigger, { value: VIEW_MODES.Tree, className: JSON_PREVIEW_TOGGLE_TRIGGER_CLASS, children: "Tree" }), _jsx(TabsTrigger, { value: VIEW_MODES.Editor, className: JSON_PREVIEW_TOGGLE_TRIGGER_CLASS, children: "Editor" })] }) }), _jsx(TabsContent, { value: VIEW_MODES.Tree, className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 mt-0 min-h-0 flex-1 overflow-auto font-mono text-[12px] leading-5", children: _jsx(JsonTreeContext.Provider, { value: treeContext, children: _jsx(JsonTreeValue, { value: normalized, path: "", theme: theme, defaultExpandedDepth: DEFAULT_EXPANDED_DEPTH, maxStringPreviewLength: maxStringPreviewLength, maxArrayItems: MAX_ITEMS, maxObjectKeys: MAX_KEYS }) }) }), _jsx(TabsContent, { value: VIEW_MODES.Editor, className: cn('mt-0 flex min-h-0 w-full flex-1 flex-col overflow-hidden p-3 data-[state=inactive]:hidden', monacoPanelClassName), children: _jsx("div", { className: "flex min-h-0 min-w-0 flex-1 flex-col", children: _jsx(LazyCodeEditor, { height: "100%", width: "100%", defaultLanguage: "json", value: formattedJson, options: {
                                readOnly: true,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                automaticLayout: true,
                            } }) }) })] })) : (_jsx("div", { className: cx('scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 min-h-0 flex-1 overflow-auto font-mono text-[12px] leading-5'), children: _jsx(JsonTreeContext.Provider, { value: treeContext, children: _jsx(JsonTreeValue, { value: normalized, path: "", theme: theme, defaultExpandedDepth: DEFAULT_EXPANDED_DEPTH, maxStringPreviewLength: maxStringPreviewLength, maxArrayItems: MAX_ITEMS, maxObjectKeys: MAX_KEYS }) }) })) }));
}
//# sourceMappingURL=json-preview.js.map