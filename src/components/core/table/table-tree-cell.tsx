import type { CellContext } from '@tanstack/react-table';
import { Loader2, MinusCircle, PlusCircle } from 'lucide-react';
import type React from 'react';
import { memo } from 'react';
import { useRowValue } from '@/components/core/hooks/useStoreHooks';
import { useIsExpanded, useIsExpanding, useIsStartEnd } from '@/components/core/hooks/useTreeStoreHooks';
import { useCurrentTreeStore } from '@/components/core/page/RowIdProvider';
import Indent from '@/components/core/table/Indent';
import { Cell } from '@/components/core/table/table-cell';
import { assertExists } from '@/components/core/utils/assert';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import type { TreeData } from '@/lib/core/common/types/Store';
import { cn } from '@/lib/utils';

import './tree-cell.css';

const ICON_OPEN = 'open';
const ICON_CLOSE = 'close';

interface TableTreeCellProps<T extends TreeData> extends CellContext<T, unknown> {
  attributeCode: StringKeyof<T>;
  labelAttributeCode: StringKeyof<T>;
  className?: string;
  onClick?: () => void;
  endComponent?: React.ReactNode;
  feedbackMask?: boolean;
}

function TableTreeCell<T extends TreeData>({
  attributeCode,
  labelAttributeCode,
  className,
  row,
  onClick,
  endComponent,
  feedbackMask,
}: TableTreeCellProps<T>) {
  const store = useCurrentTreeStore<T & TreeData>();
  assertExists(store, 'Store not found in TableTreeCell');
  const value = useRowValue(store, row.id, attributeCode);
  let label = useRowValue(store, row.id, labelAttributeCode) ?? '';
  if (typeof label !== 'string') {
    label = String(label);
  }
  const hasChildren = useRowValue(store, row.id, 'hasChildren') ?? false;
  const level = useRowValue(store, row.id, 'level') ?? 0;
  const isExpanded = useIsExpanded(store, row.id);
  const isExpanding = useIsExpanding(store, row.id);
  const [isStart, isEnd] = useIsStartEnd(store, row.id);

  if (value == null) {
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

  function renderSwitcher() {
    if (!hasChildren) {
      return <span className="tree-leaf" />;
    }
    return (
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          if (!store) return;
          e.stopPropagation();
          if (isExpanded) {
            store.collapseRow(row.id);
          } else {
            store.expandRow(row.id);
          }
        }}
        className={cn('tree-expander cursor-pointer', `tree-expander-${isExpanded ? ICON_OPEN : ICON_CLOSE}`)}
      >
        <span className="tree-expander-icon z-10 bg-background text-muted-foreground group-hover/row:bg-background group-data-[state=selected]/row:bg-background">
          {isExpanding ? (
            <Loader2 className="animate-spin" />
          ) : isExpanded ? (
            <MinusCircle className="" />
          ) : (
            <PlusCircle className="" />
          )}
        </span>
      </span>
    );
  }

  return (
    <Cell
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={cn(
        'tree-cell select-none overflow-visible bg-background group-hover/row:bg-background group-data-[state=selected]/row:bg-background',
        {
          [`tree-node-${isExpanded ? 'open' : 'close'}`]: hasChildren,
          'tree-leaf-last': isEnd[level],
        },
        className,
      )}
      dataTip={label}
      attributeCode={attributeCode}
      store={store}
      rowId={row.id}
      feedbackMask={feedbackMask}
    >
      <Indent level={level} isStart={isStart} isEnd={isEnd} />
      {renderSwitcher()}
      <span role="button" tabIndex={0} onClick={onClick} className="ml-2 flex h-full items-center truncate">
        {label}
      </span>
      {endComponent}
    </Cell>
  );
}

export default memo(TableTreeCell) as <T extends TreeData>(props: TableTreeCellProps<T>) => React.ReactNode;
