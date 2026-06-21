// ---------- Markdown detection ----------
/**
 * Lightweight regex that detects common markdown syntax in a string.
 * Matches: headings, list items, blockquotes, fenced code blocks,
 * inline code, markdown links, pipe tables, bold, strikethrough,
 * and horizontal rules.
 */
export const MARKDOWN_RE =
  /(^|\n)\s{0,3}(#{1,6}\s|[-*+]\s|\d+\.\s|> |([-*_])\3{2,}\s*($|\n))|```|`[^`]+`|\[[^\]]+\]\([^)]+\)|\|[\s:]*-{2,}[\s:]*\||\*\*[^*]+\*\*|~~[^~]+~~/;
/**
 * Returns `true` when `content` contains patterns that warrant
 * full markdown rendering rather than plain-text display.
 */
export function hasMarkdownSyntax(content) {
  return MARKDOWN_RE.test(content);
}
let streamdownPromise = null;
/**
 * Returns a module-level cached promise that resolves to the `Streamdown`
 * component. Subsequent calls return the same promise, avoiding redundant
 * React state updates across component instances.
 */
export function loadStreamdown() {
  if (!streamdownPromise) {
    const mod = 'streamdown';
    streamdownPromise = import(/* @vite-ignore */ mod).then((m) => m.Streamdown);
  }
  return streamdownPromise;
}
let markdownDepsPromise = null;
/**
 * Returns a module-level cached promise that resolves to
 * `{ ReactMarkdown, remarkGfm }`. Same caching rationale as above.
 */
export function loadMarkdownDeps() {
  if (!markdownDepsPromise) {
    const reactMarkdownModule = 'react-markdown';
    const remarkGfmModule = 'remark-gfm';
    markdownDepsPromise = Promise.all([
      import(/* @vite-ignore */ reactMarkdownModule),
      import(/* @vite-ignore */ remarkGfmModule),
    ]).then(([{ default: ReactMarkdown }, { default: remarkGfm }]) => ({
      ReactMarkdown,
      remarkGfm,
    }));
  }
  return markdownDepsPromise;
}
//# sourceMappingURL=markdown.js.map
