import type { AttributeType } from '@/lib/core/common/ds/types/AttributeType';
import { cn } from '@/lib/utils';
import type { AccessorKeyColumnDef, CellContext, Row } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { CheckSquare, Square } from 'lucide-react';
import {
  useIsRowAttributeDirty,
  useIsRowSelected,
  useRowValue,
  useCellErrors,
} from '@/components/core/hooks/useStoreHooks';
import { DIRTY_FIELD_INDICATOR_CLASS } from '@/components/core/utils/dirty-indicator';
import { useCurrentStore } from '@/components/core/page/RowIdProvider';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import type { Store } from '@/lib/core/common/types/Store';
import { formatCurrency, formatNumber } from '@/components/core/utils/formatCurrency';
import { memo, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { assertExists } from '@/components/core/utils/assert';
import { TableRowSelectionHeaderCell } from '@/components/core/table/header-cell';
import { maskString, maskDate } from '@/components/core/utils/demoMask';

const TRUNCATED_VALUE_CLASS = 'min-w-0 flex-1 truncate';
const NUMBER_VALUE_CLASS = 'min-w-0 truncate tabular-nums';

export type DirtyCellIndicatorProps<T extends object> = {
  attributeCode: StringKeyof<T>;
  className?: string;
  store: Store<T>;
  rowId: string;
  children: ReactNode;
  dataTip?: string;
  dataTipHtml?: boolean;
  dataTipMarkdown?: boolean;
  style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  feedbackMask?: boolean;
};

export function DirtyCellIndicator<T extends object>(props: DirtyCellIndicatorProps<T>) {
  const {
    attributeCode,
    className,
    children,
    store,
    rowId,
    dataTip,
    dataTipHtml,
    dataTipMarkdown,
    style,
    onClick,
    feedbackMask,
  } = props;
  const isDirty = useIsRowAttributeDirty(store, rowId, attributeCode);
  const errorMsg = useCellErrors(store, rowId, attributeCode);

  return (
    <div
      role="button"
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        feedbackMask && 'feedback-mask',
        'relative flex h-full w-full items-center overflow-hidden',
        isDirty && DIRTY_FIELD_INDICATOR_CLASS,
        className,
        errorMsg != null && 'border-red-500 bg-red-50',
      )}
      data-tip={errorMsg ?? ((dataTip?.length ?? 0) > 20 ? dataTip : undefined)}
      data-tip-error={!!errorMsg}
      data-tip-delay={errorMsg != null ? 0 : undefined}
      data-tip-html={dataTipHtml}
      data-tip-markdown={dataTipMarkdown}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function Cell<T extends object>({
  className,
  children,
  dataTip,
  dataTipHtml,
  dataTipMarkdown,
  attributeCode,
  store,
  rowId,
  style,
  onClick,
  feedbackMask,
}: {
  className?: string;
  children?: ReactNode;
  dataTip?: string;
  dataTipHtml?: boolean;
  dataTipMarkdown?: boolean;
  attributeCode: StringKeyof<T>;
  store: Store<T>;
  rowId: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  feedbackMask?: boolean;
}) {
  return (
    <DirtyCellIndicator
      className={cn('flex cursor-default items-center gap-2 px-2', className)}
      dataTip={dataTip}
      dataTipHtml={dataTipHtml}
      dataTipMarkdown={dataTipMarkdown}
      attributeCode={attributeCode}
      store={store}
      rowId={rowId}
      style={style}
      onClick={onClick}
      feedbackMask={feedbackMask}
    >
      {children}
    </DirtyCellIndicator>
  );
}

export function TableRowSelectionCell({
  className,
  row,
  isDisabled,
}: {
  className?: string;
  row: Row<any>;
  isDisabled?: (rowId: string) => boolean;
}) {
  const store = useCurrentStore<any>();
  assertExists(store, 'Store not found in TableRowSelectionCell');
  const isSelected = useIsRowSelected(store, row.id);
  return (
    <Checkbox
      className={cn('mx-2 cursor-pointer justify-center', className)}
      checked={isSelected}
      onCheckedChange={(checked) => {
        if (checked) {
          store.selectRow(row.id);
        } else {
          store.deSelectRow(row.id);
        }
      }}
      aria-label="Select row"
      data-no-dnd="true"
      disabled={isDisabled?.(row.id)}
    />
  );
}

export function rowSelectionColumnDef<T extends object>(props?: {
  isDisabled?: (rowId: string) => boolean;
  hideHeader?: boolean;
}): AccessorKeyColumnDef<T> {
  return {
    accessorKey: 'select',
    size: 32,
    header: () =>
      props?.hideHeader ? (
        <div className="ml-4" />
      ) : (
        <TableRowSelectionHeaderCell className="ml-4" isDisabled={props?.isDisabled} />
      ),
    cell: ({ row }) => <TableRowSelectionCell className="ml-4" row={row} isDisabled={props?.isDisabled} />,
    enableSorting: false,
    enableResizing: false,
  };
}

function TableCell({
  type,
  attributeCode,
  className,
  row,
  currency,
  fractionDigits,
  dateFormat,
  children,
  feedbackMask,
}: {
  type: AttributeType;
  attributeCode: string;
  className?: string;
  currency?: boolean;
  fractionDigits?: number;
  dateFormat?: string;
  children?: ReactNode;
  feedbackMask?: boolean;
} & CellContext<any, unknown>) {
  const store = useCurrentStore<any>();
  assertExists(store, 'Store not found in TableCell');
  const value = useRowValue(store, row.id, attributeCode);
  if (value == null && !['Boolean', 'YN', 'TF'].includes(type)) {
    return (
      <Cell
        className={className}
        attributeCode={attributeCode}
        store={store}
        rowId={row.id}
        feedbackMask={feedbackMask}
      />
    );
  }
  switch (type) {
    case 'Date': {
      const formatted = maskDate(format(parseISO(value as string), dateFormat ? dateFormat : 'MM/dd/yyyy'));
      return (
        <Cell
          className={cn('min-w-0', className)}
          dataTip={formatted}
          attributeCode={attributeCode}
          store={store}
          rowId={row.id}
          feedbackMask={feedbackMask}
        >
          <span className={TRUNCATED_VALUE_CLASS}>{formatted}</span>
        </Cell>
      );
    }
    case 'Boolean':
      return (
        <Cell
          className={cn('justify-center', className)}
          attributeCode={attributeCode}
          store={store}
          rowId={row.id}
          feedbackMask={feedbackMask}
        >
          {value ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
        </Cell>
      );
    case 'YN':
      return (
        <Cell
          className={cn('justify-center text-muted-foreground', className)}
          attributeCode={attributeCode}
          store={store}
          rowId={row.id}
          feedbackMask={feedbackMask}
        >
          {value === 'Y' ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
        </Cell>
      );
    case 'TF':
      return (
        <Cell
          className={cn('justify-center', className)}
          attributeCode={attributeCode}
          store={store}
          rowId={row.id}
          feedbackMask={feedbackMask}
        >
          {value === 'T' ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
        </Cell>
      );
    case 'Number': {
      let displayValue = '';
      if (currency) {
        displayValue = formatCurrency(value as number);
      } else if (fractionDigits != null) {
        displayValue = formatNumber(value as number, fractionDigits);
      } else {
        displayValue = String(value ?? '');
      }
      return (
        <Cell
          className={cn('min-w-0 justify-end', className)}
          dataTip={maskString(displayValue)}
          attributeCode={attributeCode}
          store={store}
          rowId={row.id}
          feedbackMask={feedbackMask}
        >
          <span className={NUMBER_VALUE_CLASS}>{maskString(displayValue)}</span>
          {children}
        </Cell>
      );
    }
    case 'Text':
      return (
        <Cell
          className={cn('min-w-0', className)}
          dataTip={maskString(value as string)}
          attributeCode={attributeCode}
          store={store}
          rowId={row.id}
          feedbackMask={feedbackMask}
        >
          <span className={TRUNCATED_VALUE_CLASS}>{maskString(value as string)}</span>
          {children}
        </Cell>
      );
    case 'TextArray': {
      const display = Array.isArray(value) ? (value as string[]).join(', ') : '';
      return (
        <Cell
          className={cn('min-w-0', className)}
          dataTip={display}
          attributeCode={attributeCode}
          store={store}
          rowId={row.id}
          feedbackMask={feedbackMask}
        >
          <span className={TRUNCATED_VALUE_CLASS}>{maskString(display)}</span>
          {children}
        </Cell>
      );
    }
    case 'JSON':
    case 'Polygon':
    case 'Vector': {
      const json = JSON.stringify(value);
      return (
        <Cell
          className={cn('min-w-0', className)}
          dataTip={maskString(json)}
          attributeCode={attributeCode}
          store={store}
          rowId={row.id}
          feedbackMask={feedbackMask}
        >
          <span className={TRUNCATED_VALUE_CLASS}>{maskString(json)}</span>
        </Cell>
      );
    }
    default: {
      const display = maskString(String(value));
      return (
        <Cell
          className={cn('min-w-0', className)}
          dataTip={display}
          attributeCode={attributeCode}
          store={store}
          rowId={row.id}
          feedbackMask={feedbackMask}
        >
          <span className={TRUNCATED_VALUE_CLASS}>{display}</span>
        </Cell>
      );
    }
  }
}

export default memo(TableCell);
