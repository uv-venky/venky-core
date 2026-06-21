'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Card } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import { hasMarkdownSyntax, loadMarkdownDeps } from '../../lib/markdown';
// Memoized component renderers
const MemoizedHeading1 = React.memo(({ children, ...props }) => (_jsx("h1", { className: "mb-6 scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl", ...props, children: children })));
MemoizedHeading1.displayName = 'MemoizedHeading1';
const MemoizedHeading2 = React.memo(({ children, ...props }) => (_jsx("h2", { className: "mb-4 scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight", ...props, children: children })));
MemoizedHeading2.displayName = 'MemoizedHeading2';
const MemoizedHeading3 = React.memo(({ children, ...props }) => (_jsx("h3", { className: "mb-3 scroll-m-20 font-semibold text-2xl tracking-tight", ...props, children: children })));
MemoizedHeading3.displayName = 'MemoizedHeading3';
const MemoizedHeading4 = React.memo(({ children, ...props }) => (_jsx("h4", { className: "mb-2 scroll-m-20 font-semibold text-xl tracking-tight", ...props, children: children })));
MemoizedHeading4.displayName = 'MemoizedHeading4';
const MemoizedHeading5 = React.memo(({ children, ...props }) => (_jsx("h5", { className: "mb-2 scroll-m-20 font-semibold text-lg tracking-tight", ...props, children: children })));
MemoizedHeading5.displayName = 'MemoizedHeading5';
const MemoizedHeading6 = React.memo(({ children, ...props }) => (_jsx("h6", { className: "mb-2 scroll-m-20 font-semibold text-base tracking-tight", ...props, children: children })));
MemoizedHeading6.displayName = 'MemoizedHeading6';
const MemoizedParagraph = React.memo(({ children, ...props }) => (_jsx("p", { className: "leading-7 [&:not(:first-child)]:mt-6", ...props, children: children })));
MemoizedParagraph.displayName = 'MemoizedParagraph';
const MemoizedUnorderedList = React.memo(({ children, ...props }) => (_jsx("ul", { className: "my-6 ml-6 list-disc [&>li]:mt-2", ...props, children: children })));
MemoizedUnorderedList.displayName = 'MemoizedUnorderedList';
const MemoizedOrderedList = React.memo(({ children, ...props }) => (_jsx("ol", { className: "my-6 ml-6 list-decimal [&>li]:mt-2", ...props, children: children })));
MemoizedOrderedList.displayName = 'MemoizedOrderedList';
const MemoizedListItem = React.memo(({ children, ...props }) => (_jsx("li", { className: "leading-7", ...props, children: children })));
MemoizedListItem.displayName = 'MemoizedListItem';
const MemoizedBlockquote = React.memo(({ children, ...props }) => (_jsx("blockquote", { className: "mt-6 border-l-2 pl-6 italic", ...props, children: children })));
MemoizedBlockquote.displayName = 'MemoizedBlockquote';
const MemoizedCodeBlock = React.memo(({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    if (!inline && language) {
        return (_jsxs(Card, { className: "my-6 overflow-hidden", children: [_jsx("div", { className: "flex items-center justify-between bg-muted px-4 py-2", children: _jsx(Badge, { variant: "secondary", className: "text-xs", children: language }) }), _jsx("div", { className: "overflow-x-auto", children: _jsx("pre", { className: "overflow-x-auto rounded-b-lg bg-slate-900 p-4 text-slate-100 dark:bg-slate-950", children: _jsx("code", { className: "whitespace-pre font-mono text-sm", ...props, children: String(children).replace(/\n$/, '') }) }) })] }));
    }
    return (_jsx("code", { className: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm", ...props, children: children }));
});
MemoizedCodeBlock.displayName = 'MemoizedCodeBlock';
const MemoizedLink = React.memo(({ children, ...props }) => (_jsx("a", { ...props, className: "font-medium text-primary underline underline-offset-4 hover:text-primary/80", target: "_blank", rel: "noopener noreferrer", children: children })));
MemoizedLink.displayName = 'MemoizedLink';
const MemoizedImage = React.memo(({ src, alt }) => (_jsx("div", { className: "my-6", children: _jsx("img", { src: typeof src === 'string' ? src : '/placeholder.svg', alt: alt ?? '', width: 512, height: 512, className: "rounded-lg border shadow-sm" }) })));
MemoizedImage.displayName = 'MemoizedImage';
const MemoizedTable = React.memo(({ children, ...props }) => (_jsx("div", { className: "my-6 w-full overflow-y-auto", children: _jsx("table", { className: "w-full border-collapse border border-border", ...props, children: children }) })));
MemoizedTable.displayName = 'MemoizedTable';
const MemoizedTableHead = React.memo(({ children, ...props }) => (_jsx("thead", { className: "bg-muted", ...props, children: children })));
MemoizedTableHead.displayName = 'MemoizedTableHead';
const MemoizedTableBody = React.memo(({ children, ...props }) => (_jsx("tbody", { ...props, children: children })));
MemoizedTableBody.displayName = 'MemoizedTableBody';
const MemoizedTableRow = React.memo(({ children, ...props }) => (_jsx("tr", { className: "border-border border-b", ...props, children: children })));
MemoizedTableRow.displayName = 'MemoizedTableRow';
const MemoizedTableHeader = React.memo(({ children, ...props }) => (_jsx("th", { className: "border border-border px-4 py-2 text-left font-bold", ...props, children: children })));
MemoizedTableHeader.displayName = 'MemoizedTableHeader';
const MemoizedTableData = React.memo(({ children, ...props }) => (_jsx("td", { className: "border border-border px-4 py-2", ...props, children: children })));
MemoizedTableData.displayName = 'MemoizedTableData';
const MemoizedHorizontalRule = React.memo(({ ...props }) => (_jsx(Separator, { className: "my-8", ...props })));
MemoizedHorizontalRule.displayName = 'MemoizedHorizontalRule';
const MemoizedStrong = React.memo(({ children, ...props }) => (_jsx("strong", { className: "font-semibold", ...props, children: children })));
MemoizedStrong.displayName = 'MemoizedStrong';
const MemoizedEmphasis = React.memo(({ children, ...props }) => (_jsx("em", { className: "italic", ...props, children: children })));
MemoizedEmphasis.displayName = 'MemoizedEmphasis';
const memoizedComponents = {
    h1: MemoizedHeading1,
    h2: MemoizedHeading2,
    h3: MemoizedHeading3,
    h4: MemoizedHeading4,
    h5: MemoizedHeading5,
    h6: MemoizedHeading6,
    p: MemoizedParagraph,
    ul: MemoizedUnorderedList,
    ol: MemoizedOrderedList,
    li: MemoizedListItem,
    blockquote: MemoizedBlockquote,
    code: MemoizedCodeBlock,
    a: MemoizedLink,
    img: MemoizedImage,
    table: MemoizedTable,
    thead: MemoizedTableHead,
    tbody: MemoizedTableBody,
    tr: MemoizedTableRow,
    th: MemoizedTableHeader,
    td: MemoizedTableData,
    hr: MemoizedHorizontalRule,
    strong: MemoizedStrong,
    em: MemoizedEmphasis,
};
const MarkdownDisplayComponent = ({ content, className }) => {
    const [deps, setDeps] = React.useState(null);
    const needsMarkdown = hasMarkdownSyntax(content);
    React.useEffect(() => {
        if (!needsMarkdown)
            return;
        let cancelled = false;
        loadMarkdownDeps().then((resolved) => {
            if (!cancelled) {
                setDeps(resolved);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [needsMarkdown]);
    if (!needsMarkdown) {
        return _jsx("div", { className: cn('prose prose-slate dark:prose-invert max-w-none', className), children: content });
    }
    if (!deps) {
        return _jsx("div", { className: cn('prose prose-slate dark:prose-invert invisible max-w-none', className), children: content });
    }
    const { ReactMarkdown, remarkGfm } = deps;
    return (_jsx("div", { className: cn('prose prose-slate dark:prose-invert max-w-none', className), children: _jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], components: memoizedComponents, children: content }) }));
};
export const MarkdownDisplay = React.memo(MarkdownDisplayComponent);
MarkdownDisplay.displayName = 'MarkdownDisplay';
//# sourceMappingURL=markdown-display.js.map