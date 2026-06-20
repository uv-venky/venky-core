import { useEffect, useRef, useState } from 'react';
import { TableHead, TableRow } from '@/components/ui/table';
import { DropdownMenuField } from '@/components/core/dropdown-menu';
import { EntryEditorValueInput } from '@/components/core/smart-search/EntryEditorValueInput';
import {
  getDefaultOperator,
  getDefaultValue,
  getOptionsForType,
  hasEditor,
  isMultiOperator,
  OPS_ICONS,
  type OPS_KEY_TYPE,
} from '@/components/core/smart-search/operators';
import type { Column } from '@/components/core/smart-search/types';
import type { Store } from '@/lib/core/common/types/Store';
import type { SingleFilter, StringKeyof } from '@/lib/core/common/ds/types/filter';
import type { Table as TableType } from '@tanstack/react-table';
import { EMPTY_ARRAY, isEmpty } from '@/lib/core/common/isEmpty';
import { FileQuestionIcon, SearchIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import clientLogger from '@/lib/core/client/client-logger';
import {
  useIsHeaderFilterDirty,
  useIsHeaderFilterApplied,
  useIsHeaderFiltersHidden,
} from '@/components/core/hooks/useStoreHooks';

interface HeaderFiltersProps<T extends object> {
  table: TableType<T>;
  store: Store<T>;
  columns: Column<T>[];
}

function HeaderFilterInput<T extends object>({ column, store }: { column: Column<T>; store: Store<T> }) {
  const ref = useRef<HTMLInputElement>(null);
  const filter = store.getHeaderFilter(column.key as StringKeyof<T>);
  const op = filter ? Object.keys(filter[column.key] as object)[0] : getDefaultOperator(column);
  const val = filter ? (filter[column.key] as any)[op] : undefined; // getDefaultValue(column.type);
  const [operator, setOperator] = useState(op);
  const [value, setValue] = useState(val);

  const options = getOptionsForType(column.type);
  const Icon = OPS_ICONS[operator as OPS_KEY_TYPE] ?? FileQuestionIcon;
  const isDirty = useIsHeaderFilterDirty(store, column.key);
  const isApplied = useIsHeaderFilterApplied(store, column.key);
  const isAppliedRef = useRef(false);

  useEffect(() => {
    if (!isApplied && isAppliedRef.current) {
      setValue(undefined);
      setOperator(getDefaultOperator(column));
    }
    isAppliedRef.current = isApplied;
  }, [isApplied, column]);

  return (
    <div className="m-1 flex items-center gap-1 rounded-sm border bg-background">
      <DropdownMenuField
        iconTrigger
        options={options}
        value={operator}
        getLabel={(o) => o.label}
        getValue={(o) => o.value}
        onChange={(o) => {
          setOperator(o);
          // check if the operator has an editor
          if (!hasEditor(o)) {
            store.setHeaderFilter({
              [column.key]: { [o]: getDefaultValue(column.type) },
            } as SingleFilter<T>);
          } else {
            let val = value;
            if (isMultiOperator(o)) {
              if (!Array.isArray(val)) {
                if (isEmpty(val)) {
                  val = EMPTY_ARRAY;
                } else {
                  val = [val];
                }
              }
              if (o === 'bn' && Array.isArray(val) && val.length > 2) {
                val = val.slice(0, 2);
              }
            } else if (Array.isArray(val)) {
              if (val.length) {
                val = val[0];
              } else if (column) {
                val = getDefaultValue(column.type);
              } else {
                val = undefined;
              }
            }
            setValue(val);
            if (!isEmpty(val)) {
              store.setHeaderFilter({
                [column.key]: { [o]: val },
              } as SingleFilter<T>);
            }
            setTimeout(() => {
              ref.current?.focus();
            }, 400);
          }
        }}
        dataTestId={`header-operator-${column.key}`}
      >
        <Icon data-tip={operator} className="size-3.5 shrink-0" />
      </DropdownMenuField>
      <div className="flex flex-1 items-center justify-between gap-1">
        {hasEditor(operator) ? (
          <EntryEditorValueInput
            ref={ref}
            column={column}
            operator={operator}
            value={value}
            onChange={(v, done) => {
              if (clientLogger.isDebugEnabled) {
                clientLogger.debug({ message: 'onChange', value: v, done });
              }
              setValue(v);
              store.setHeaderFilter({
                [column.key]: { [operator]: v },
              } as SingleFilter<T>);
              if (done) {
                store.applyHeaderFiltersIfChanged();
              }
            }}
            className="h-full w-full p-0"
            path={[]}
          />
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex items-center">
          {(Array.isArray(value) ? value.length > 0 : !isEmpty(value) || isDirty || isApplied) && (
            <Button
              variant="ghost"
              size="icon"
              data-testid={`header-filter-clear-${column.key}`}
              onClick={() => {
                const op = getDefaultOperator(column);
                setOperator(op);
                setValue(isMultiOperator(op) ? [] : undefined);
                ref.current?.focus();
                store.clearHeaderFilter(column.key);
                store.applyHeaderFiltersIfChanged();
              }}
            >
              <X className="size-3.5" />
            </Button>
          )}
          {isDirty && ((Array.isArray(value) ? value.length > 0 : !isEmpty(value)) || !hasEditor(operator)) && (
            <Button
              variant="ghost"
              size="icon"
              data-testid={`header-filter-apply-${column.key}`}
              onClick={() => {
                store.applyHeaderFiltersIfChanged();
              }}
            >
              <SearchIcon className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TableHeaderFilters<T extends object>({ table, store, columns }: HeaderFiltersProps<T>) {
  const leafColumns = table.getVisibleLeafColumns();
  const isHidden = useIsHeaderFiltersHidden(store);
  if (isHidden) {
    return null;
  }
  return (
    <TableRow className="bg-background">
      {leafColumns.map((col) => {
        const c = columns.find((s) => s.key === col.id);
        return (
          <TableHead key={col.id} style={{ width: `var(--col-${col.id}-size)` }} className="p-0">
            {c ? <HeaderFilterInput column={c} store={store} /> : null}
          </TableHead>
        );
      })}
    </TableRow>
  );
}
