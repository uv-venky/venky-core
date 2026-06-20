'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { hasMarkdownSyntax, loadMarkdownDeps, type MarkdownDeps } from '@/lib/markdown';

interface MarkdownDisplayProps {
  content: string;
  className?: string;
}

// Memoized component renderers
const MemoizedHeading1 = React.memo(({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1 className="mb-6 scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl" {...props}>
    {children}
  </h1>
));
MemoizedHeading1.displayName = 'MemoizedHeading1';

const MemoizedHeading2 = React.memo(({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className="mb-4 scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight" {...props}>
    {children}
  </h2>
));
MemoizedHeading2.displayName = 'MemoizedHeading2';

const MemoizedHeading3 = React.memo(({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className="mb-3 scroll-m-20 font-semibold text-2xl tracking-tight" {...props}>
    {children}
  </h3>
));
MemoizedHeading3.displayName = 'MemoizedHeading3';

const MemoizedHeading4 = React.memo(({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h4 className="mb-2 scroll-m-20 font-semibold text-xl tracking-tight" {...props}>
    {children}
  </h4>
));
MemoizedHeading4.displayName = 'MemoizedHeading4';

const MemoizedHeading5 = React.memo(({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h5 className="mb-2 scroll-m-20 font-semibold text-lg tracking-tight" {...props}>
    {children}
  </h5>
));
MemoizedHeading5.displayName = 'MemoizedHeading5';

const MemoizedHeading6 = React.memo(({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h6 className="mb-2 scroll-m-20 font-semibold text-base tracking-tight" {...props}>
    {children}
  </h6>
));
MemoizedHeading6.displayName = 'MemoizedHeading6';

const MemoizedParagraph = React.memo(({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className="leading-7 [&:not(:first-child)]:mt-6" {...props}>
    {children}
  </p>
));
MemoizedParagraph.displayName = 'MemoizedParagraph';

const MemoizedUnorderedList = React.memo(({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props}>
    {children}
  </ul>
));
MemoizedUnorderedList.displayName = 'MemoizedUnorderedList';

const MemoizedOrderedList = React.memo(({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
  <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props}>
    {children}
  </ol>
));
MemoizedOrderedList.displayName = 'MemoizedOrderedList';

const MemoizedListItem = React.memo(({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li className="leading-7" {...props}>
    {children}
  </li>
));
MemoizedListItem.displayName = 'MemoizedListItem';

const MemoizedBlockquote = React.memo(({ children, ...props }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
  <blockquote className="mt-6 border-l-2 pl-6 italic" {...props}>
    {children}
  </blockquote>
));
MemoizedBlockquote.displayName = 'MemoizedBlockquote';

const MemoizedCodeBlock = React.memo(
  ({
    node,
    inline,
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement> & {
    node?: any;
    inline?: boolean;
  }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    if (!inline && language) {
      return (
        <Card className="my-6 overflow-hidden">
          <div className="flex items-center justify-between bg-muted px-4 py-2">
            <Badge variant="secondary" className="text-xs">
              {language}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <pre className="overflow-x-auto rounded-b-lg bg-slate-900 p-4 text-slate-100 dark:bg-slate-950">
              <code className="whitespace-pre font-mono text-sm" {...props}>
                {String(children).replace(/\n$/, '')}
              </code>
            </pre>
          </div>
        </Card>
      );
    }

    return (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm" {...props}>
        {children}
      </code>
    );
  },
);
MemoizedCodeBlock.displayName = 'MemoizedCodeBlock';

const MemoizedLink = React.memo(({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a
    {...props}
    className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
));
MemoizedLink.displayName = 'MemoizedLink';

const MemoizedImage = React.memo(({ src, alt }: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <div className="my-6">
    {/* biome-ignore lint/performance/noImgElement: framework-agnostic, no next/image */}
    <img
      src={typeof src === 'string' ? src : '/placeholder.svg'}
      alt={alt ?? ''}
      width={512}
      height={512}
      className="rounded-lg border shadow-sm"
    />
  </div>
));
MemoizedImage.displayName = 'MemoizedImage';

const MemoizedTable = React.memo(({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div className="my-6 w-full overflow-y-auto">
    <table className="w-full border-collapse border border-border" {...props}>
      {children}
    </table>
  </div>
));
MemoizedTable.displayName = 'MemoizedTable';

const MemoizedTableHead = React.memo(({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className="bg-muted" {...props}>
    {children}
  </thead>
));
MemoizedTableHead.displayName = 'MemoizedTableHead';

const MemoizedTableBody = React.memo(({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody {...props}>{children}</tbody>
));
MemoizedTableBody.displayName = 'MemoizedTableBody';

const MemoizedTableRow = React.memo(({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className="border-border border-b" {...props}>
    {children}
  </tr>
));
MemoizedTableRow.displayName = 'MemoizedTableRow';

const MemoizedTableHeader = React.memo(({ children, ...props }: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
  <th className="border border-border px-4 py-2 text-left font-bold" {...props}>
    {children}
  </th>
));
MemoizedTableHeader.displayName = 'MemoizedTableHeader';

const MemoizedTableData = React.memo(({ children, ...props }: React.TdHTMLAttributes<HTMLTableDataCellElement>) => (
  <td className="border border-border px-4 py-2" {...props}>
    {children}
  </td>
));
MemoizedTableData.displayName = 'MemoizedTableData';

const MemoizedHorizontalRule = React.memo(({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
  <Separator className="my-8" {...props} />
));
MemoizedHorizontalRule.displayName = 'MemoizedHorizontalRule';

const MemoizedStrong = React.memo(({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <strong className="font-semibold" {...props}>
    {children}
  </strong>
));
MemoizedStrong.displayName = 'MemoizedStrong';

const MemoizedEmphasis = React.memo(({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <em className="italic" {...props}>
    {children}
  </em>
));
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

const MarkdownDisplayComponent = ({ content, className }: MarkdownDisplayProps) => {
  const [deps, setDeps] = React.useState<MarkdownDeps | null>(null);
  const needsMarkdown = hasMarkdownSyntax(content);

  React.useEffect(() => {
    if (!needsMarkdown) return;
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
    return <div className={cn('prose prose-slate dark:prose-invert max-w-none', className)}>{content}</div>;
  }
  if (!deps) {
    return <div className={cn('prose prose-slate dark:prose-invert invisible max-w-none', className)}>{content}</div>;
  }

  const { ReactMarkdown, remarkGfm } = deps;
  return (
    <div className={cn('prose prose-slate dark:prose-invert max-w-none', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={memoizedComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const MarkdownDisplay = React.memo(MarkdownDisplayComponent);
MarkdownDisplay.displayName = 'MarkdownDisplay';
