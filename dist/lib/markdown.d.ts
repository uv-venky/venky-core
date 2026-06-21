import type React from 'react';
import type { StreamdownProps } from 'streamdown';
/**
 * Lightweight regex that detects common markdown syntax in a string.
 * Matches: headings, list items, blockquotes, fenced code blocks,
 * inline code, markdown links, pipe tables, bold, strikethrough,
 * and horizontal rules.
 */
export declare const MARKDOWN_RE: RegExp;
/**
 * Returns `true` when `content` contains patterns that warrant
 * full markdown rendering rather than plain-text display.
 */
export declare function hasMarkdownSyntax(content: string): boolean;
export type StreamdownComponent = React.MemoExoticComponent<(props: StreamdownProps) => React.JSX.Element>;
/**
 * Returns a module-level cached promise that resolves to the `Streamdown`
 * component. Subsequent calls return the same promise, avoiding redundant
 * React state updates across component instances.
 */
export declare function loadStreamdown(): Promise<StreamdownComponent>;
export interface MarkdownDeps {
    ReactMarkdown: React.ComponentType<any>;
    remarkGfm: unknown;
}
/**
 * Returns a module-level cached promise that resolves to
 * `{ ReactMarkdown, remarkGfm }`. Same caching rationale as above.
 */
export declare function loadMarkdownDeps(): Promise<MarkdownDeps>;
//# sourceMappingURL=markdown.d.ts.map