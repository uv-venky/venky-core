import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { cn } from '../../../lib/utils';
import { format, parseISO } from 'date-fns';
import { CheckSquare, Square } from 'lucide-react';
import {
  useIsRowAttributeDirty,
  useIsRowSelected,
  useRowValue,
  useCellErrors,
} from '../../../components/core/hooks/useStoreHooks';
import { DIRTY_FIELD_INDICATOR_CLASS } from '../../../components/core/utils/dirty-indicator';
import { useCurrentStore } from '../../../components/core/page/RowIdProvider';
import { formatCurrency, formatNumber } from '../../../components/core/utils/formatCurrency';
import { memo } from 'react';
import { Checkbox } from '../../../components/ui/checkbox';
import { assertExists } from '../../../components/core/utils/assert';
import { TableRowSelectionHeaderCell } from '../../../components/core/table/header-cell';
import { maskString, maskDate } from '../../../components/core/utils/demoMask';
const TRUNCATED_VALUE_CLASS = 'min-w-0 flex-1 truncate';
const NUMBER_VALUE_CLASS = 'min-w-0 truncate tabular-nums';
export function DirtyCellIndicator(props) {
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
  return _jsx('div', {
    role: 'button',
    tabIndex: onClick ? 0 : undefined,
    className: cn(
      feedbackMask && 'feedback-mask',
      'relative flex h-full w-full items-center overflow-hidden',
      isDirty && DIRTY_FIELD_INDICATOR_CLASS,
      className,
      errorMsg != null && 'border-red-500 bg-red-50',
    ),
    'data-tip': errorMsg ?? ((dataTip?.length ?? 0) > 20 ? dataTip : undefined),
    'data-tip-error': !!errorMsg,
    'data-tip-delay': errorMsg != null ? 0 : undefined,
    'data-tip-html': dataTipHtml,
    'data-tip-markdown': dataTipMarkdown,
    style: style,
    onClick: onClick,
    children: children,
  });
}
export function Cell({
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
}) {
  return _jsx(DirtyCellIndicator, {
    className: cn('flex cursor-default items-center gap-2 px-2', className),
    dataTip: dataTip,
    dataTipHtml: dataTipHtml,
    dataTipMarkdown: dataTipMarkdown,
    attributeCode: attributeCode,
    store: store,
    rowId: rowId,
    style: style,
    onClick: onClick,
    feedbackMask: feedbackMask,
    children: children,
  });
}
export function TableRowSelectionCell({ className, row, isDisabled }) {
  const store = useCurrentStore();
  assertExists(store, 'Store not found in TableRowSelectionCell');
  const isSelected = useIsRowSelected(store, row.id);
  return _jsx(Checkbox, {
    className: cn('mx-2 cursor-pointer justify-center', className),
    checked: isSelected,
    onCheckedChange: (checked) => {
      if (checked) {
        store.selectRow(row.id);
      } else {
        store.deSelectRow(row.id);
      }
    },
    'aria-label': 'Select row',
    'data-no-dnd': 'true',
    disabled: isDisabled?.(row.id),
  });
}
export function rowSelectionColumnDef(props) {
  return {
    accessorKey: 'select',
    size: 32,
    header: () =>
      props?.hideHeader
        ? _jsx('div', { className: 'ml-4' })
        : _jsx(TableRowSelectionHeaderCell, { className: 'ml-4', isDisabled: props?.isDisabled }),
    cell: ({ row }) => _jsx(TableRowSelectionCell, { className: 'ml-4', row: row, isDisabled: props?.isDisabled }),
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
}) {
  const store = useCurrentStore();
  assertExists(store, 'Store not found in TableCell');
  const value = useRowValue(store, row.id, attributeCode);
  if (value == null && !['Boolean', 'YN', 'TF'].includes(type)) {
    return _jsx(Cell, {
      className: className,
      attributeCode: attributeCode,
      store: store,
      rowId: row.id,
      feedbackMask: feedbackMask,
    });
  }
  switch (type) {
    case 'Date': {
      const formatted = maskDate(format(parseISO(value), dateFormat ? dateFormat : 'MM/dd/yyyy'));
      return _jsx(Cell, {
        className: cn('min-w-0', className),
        dataTip: formatted,
        attributeCode: attributeCode,
        store: store,
        rowId: row.id,
        feedbackMask: feedbackMask,
        children: _jsx('span', { className: TRUNCATED_VALUE_CLASS, children: formatted }),
      });
    }
    case 'Boolean':
      return _jsx(Cell, {
        className: cn('justify-center', className),
        attributeCode: attributeCode,
        store: store,
        rowId: row.id,
        feedbackMask: feedbackMask,
        children: value ? _jsx(CheckSquare, { className: 'size-4' }) : _jsx(Square, { className: 'size-4' }),
      });
    case 'YN':
      return _jsx(Cell, {
        className: cn('justify-center text-muted-foreground', className),
        attributeCode: attributeCode,
        store: store,
        rowId: row.id,
        feedbackMask: feedbackMask,
        children: value === 'Y' ? _jsx(CheckSquare, { className: 'size-4' }) : _jsx(Square, { className: 'size-4' }),
      });
    case 'TF':
      return _jsx(Cell, {
        className: cn('justify-center', className),
        attributeCode: attributeCode,
        store: store,
        rowId: row.id,
        feedbackMask: feedbackMask,
        children: value === 'T' ? _jsx(CheckSquare, { className: 'size-4' }) : _jsx(Square, { className: 'size-4' }),
      });
    case 'Number': {
      let displayValue = '';
      if (currency) {
        displayValue = formatCurrency(value);
      } else if (fractionDigits != null) {
        displayValue = formatNumber(value, fractionDigits);
      } else {
        displayValue = String(value ?? '');
      }
      return _jsxs(Cell, {
        className: cn('min-w-0 justify-end', className),
        dataTip: maskString(displayValue),
        attributeCode: attributeCode,
        store: store,
        rowId: row.id,
        feedbackMask: feedbackMask,
        children: [_jsx('span', { className: NUMBER_VALUE_CLASS, children: maskString(displayValue) }), children],
      });
    }
    case 'Text':
      return _jsxs(Cell, {
        className: cn('min-w-0', className),
        dataTip: maskString(value),
        attributeCode: attributeCode,
        store: store,
        rowId: row.id,
        feedbackMask: feedbackMask,
        children: [_jsx('span', { className: TRUNCATED_VALUE_CLASS, children: maskString(value) }), children],
      });
    case 'TextArray': {
      const display = Array.isArray(value) ? value.join(', ') : '';
      return _jsxs(Cell, {
        className: cn('min-w-0', className),
        dataTip: display,
        attributeCode: attributeCode,
        store: store,
        rowId: row.id,
        feedbackMask: feedbackMask,
        children: [_jsx('span', { className: TRUNCATED_VALUE_CLASS, children: maskString(display) }), children],
      });
    }
    case 'JSON':
    case 'Polygon':
    case 'Vector': {
      const json = JSON.stringify(value);
      return _jsx(Cell, {
        className: cn('min-w-0', className),
        dataTip: maskString(json),
        attributeCode: attributeCode,
        store: store,
        rowId: row.id,
        feedbackMask: feedbackMask,
        children: _jsx('span', { className: TRUNCATED_VALUE_CLASS, children: maskString(json) }),
      });
    }
    default: {
      const display = maskString(String(value));
      return _jsx(Cell, {
        className: cn('min-w-0', className),
        dataTip: display,
        attributeCode: attributeCode,
        store: store,
        rowId: row.id,
        feedbackMask: feedbackMask,
        children: _jsx('span', { className: TRUNCATED_VALUE_CLASS, children: display }),
      });
    }
  }
}
export default memo(TableCell);
//# sourceMappingURL=table-cell.js.map
