/* Copyright (c) 2024-present VENKY Corp. */

import { cn } from '@/lib/utils';
import type { CSSProperties, MouseEvent } from 'react';
import { BOTH_SPAN, COL_SPAN, ROW_SPAN } from '@/components/core/pivot/PivotTypes';

export const paddingStyles = {
  compact: 'p-1',
  default: 'p-2',
  roomy: 'p-3',
  spacious: 'p-3',
};

export const fontStyles = {
  compact: 'text-sm',
  default: 'text-base',
  roomy: 'text-lg',
  spacious: 'text-lg',
};

export const alignmentStyles = {
  start: 'text-left',
  end: 'text-right',
  center: 'text-center',
};

const styles = {
  colSpan: 'border-l-0',
  rowSpan: 'border-t-0',
  cell: 'flex items-center border-l border-t box-border whitespace-nowrap overflow-hidden text-ellipsis group/cell',
  alignEnd: 'justify-end',
  bodyTopCell: 'border-t-0',
  topCell: 'border-t',
  bottomCell: 'border-b',
  bottomHeaderCell: 'border-b-2 border-b-solid border-b-neutral-400',
  headerCell: 'overflow-hidden text-ellipsis',
  startCell: 'border-l',
  endCell: 'border-r',
  endFixedCell: 'border-r-2 border-r-solid border-r-neutral-400',
  noBorderTop: 'border-t-0',
  noBorderLeft: 'border-l-0',
  noBorderBottom: 'border-b-0',
  topFooterCell: 'border-t-2 border-t-solid border-t-neutral-400',
  footerCell: '',
  clickable: 'cursor-pointer hover:underline',
};

export function SimplePivotTableCell({
  children,
  columnIndex,
  endColumnIndex,
  endRowIndex,
  hideBodyBottomBorder = false,
  hideBorders = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  removeColumnLines = false,
  removeRowLines = false,
  rowIndex,
  startColumnIndex,
  style,
  type,
  value,
  className,
  dataTestId,
}: {
  children: React.ReactNode;
  columnIndex: number;
  endColumnIndex: number;
  endRowIndex: number;
  hideBodyBottomBorder?: boolean;
  hideBorders: boolean;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  removeColumnLines?: boolean;
  removeRowLines?: boolean;
  rowIndex: number;
  startColumnIndex: number;
  style: CSSProperties;
  type: 'header' | 'body' | 'footer';
  value: string | Array<string>;
  className?: string;
  dataTestId?: string;
}) {
  return (
    <div
      className={cn(
        styles.cell,
        type === 'header' && styles.headerCell,
        type === 'footer' && styles.footerCell,
        startColumnIndex !== 0 && styles.alignEnd,
        type === 'header' && rowIndex === 0 && styles.topCell,
        columnIndex === 0 && styles.startCell,
        (removeColumnLines || (columnIndex === 0 && startColumnIndex !== 0)) && styles.noBorderLeft,
        (removeRowLines || (hideBorders && rowIndex === 0)) && styles.noBorderTop,
        columnIndex === 0 && startColumnIndex === 0 && hideBorders && styles.noBorderLeft,
        type === 'header' && rowIndex === endRowIndex && styles.bottomHeaderCell,
        (value === ROW_SPAN || value === BOTH_SPAN) && styles.rowSpan,
        (value === COL_SPAN || value === BOTH_SPAN) && styles.colSpan,
        columnIndex === endColumnIndex - startColumnIndex &&
          (startColumnIndex === 0 ? styles.endFixedCell : styles.endCell),
        type === 'body' && rowIndex === 0 && styles.bodyTopCell,
        type === 'body' && rowIndex === endRowIndex && styles.bottomCell,
        type === 'body' && rowIndex === endRowIndex && hideBodyBottomBorder && styles.noBorderBottom,
        onClick && styles.clickable,
        type === 'footer' && rowIndex === endRowIndex && styles.bottomCell,
        type === 'footer' && rowIndex === 0 && styles.topFooterCell,
        type === 'footer' && rowIndex === endRowIndex && hideBorders && styles.noBorderBottom,
        className,
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      role="gridcell"
      tabIndex={-1}
      style={style}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}
