/* Copyright (c) 2023-present Venky Corp. */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StringFilter } from '@/lib/core/common/ds/types/StringFilter';
import { type FilterEntry, isSingleFilter } from '@/lib/core/common/ds/types/filter';
import { EMPTY_ARRAY, keys } from '@/lib/core/common/isEmpty';
import { CaseSensitive, FileQuestionIcon, X } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { DropdownMenuField } from '@/components/core/dropdown-menu';
import useHandleClickOutside from '@/components/core/hooks/useHandleClickOutside';
import useWhyDidYouUpdate from '@/components/core/hooks/useWhyDidYouUpdate';
import type { Path } from '@/components/core/mutX/ImmutableTypes';
import ColumnList from '@/components/core/smart-search/ColumnList';
import { EntryEditorValueInput } from '@/components/core/smart-search/EntryEditorValueInput';
import { useSmartSearchColumns, useSmartSearchDispatcher } from '@/components/core/smart-search/context';
import {
  CASE_SENSITIVE_OPS,
  getOptionsForType,
  OPS_ICONS,
  type OPS_KEY_TYPE,
} from '@/components/core/smart-search/operators';
import type { Column } from '@/components/core/smart-search/types';
import type { ActiveSection } from '@/components/core/smart-search/SmartSearchTypes';

type Props<T> = {
  filter: FilterEntry<T>;
  index: number;
  path: Path;
  activeSection?: ActiveSection;
  stickyFilters?: (keyof T)[];
};

function EntryEditor<T extends object>(props: Props<T>) {
  useWhyDidYouUpdate('EntryEditor', props);
  const { activeSection, filter, index, path, stickyFilters } = props;
  // console.log('EntryEditor', JSON.stringify(path), index);
  const columns = useSmartSearchColumns();
  const dispatch = useSmartSearchDispatcher<T>();
  const inputRef = useRef<HTMLInputElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const [openOperator, setOpenOperator] = useState(false);
  const [openField, setOpenField] = useState(false);
  const [openValue, setOpenValue] = useState(false);

  const attributeCode = useMemo(() => {
    const [key] = keys(filter);
    return key;
  }, [filter]);

  const column = useMemo((): Column<T> | undefined => {
    return columns.find((c) => c.key === attributeCode);
  }, [columns, attributeCode]);

  const operatorOptions = useMemo(() => {
    if (!column) return EMPTY_ARRAY;
    return getOptionsForType(column.type);
  }, [column]);

  const operator = useMemo(() => {
    if (!column) return '';
    if (['allof', 'anyof', 'noneof'].includes(attributeCode)) return '';
    const [key] = keys((filter[attributeCode] as StringFilter) ?? {});
    return key;
  }, [column, attributeCode, filter]);

  const showMatchCase = useMemo(() => {
    if (!operator) return false;
    return column?.type === 'Text' && CASE_SENSITIVE_OPS.includes(operator);
  }, [operator, column]);

  const value = useMemo(() => {
    const attr = attributeCode;
    if (!attr) return undefined;
    const ed = filter;
    if (!isSingleFilter(ed)) return undefined;
    const [key] = keys(ed[attr]);
    // @ts-expect-error filter[attr] is ok
    return key ? ed[attr][key] : undefined;
  }, [filter, attributeCode]);

  const ignoreCase =
    filter && attributeCode && filter[attributeCode] && 'ignoreCase' in filter[attributeCode]
      ? filter[attributeCode].ignoreCase
      : false;

  useEffect(() => {
    if (!attributeCode || activeSection) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    setOpenValue(true);
  }, [attributeCode, activeSection]);

  useHandleClickOutside({
    ref: outerRef,
    onInteractOutside: () => {
      dispatch({ type: 'onClickOutside' });
    },
    shouldExcludeElement: (e) => {
      return e.dataset.smartSearch != null;
    },
  });

  useEffect(() => {
    if (activeSection) {
      switch (activeSection) {
        case 'field':
          setOpenField(true);
          break;
        case 'operator':
          setOpenOperator(true);
          break;
        case 'value':
          inputRef.current?.focus();
          setOpenValue(true);
          break;
      }
    }
  }, [activeSection]);

  return (
    <div
      role="button"
      ref={outerRef}
      className="editor flex max-w-full content-start items-center justify-start gap-1 overflow-hidden whitespace-nowrap rounded-full bg-default text-sm ring-2 ring-ring"
      onClick={(e) => {
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          e.preventDefault();
          if (!openField && !openOperator) {
            dispatch({ type: 'escape' });
          }
        }
      }}
    >
      <ColumnList
        stickyFilters={stickyFilters}
        attributeCode={attributeCode}
        index={index}
        path={path}
        open={openField}
        onOpenChange={setOpenField}
      />
      {attributeCode && (
        <>
          <DropdownMenuField
            dataTestId={`operator-dropdown-menu`}
            open={openOperator}
            onOpenChange={setOpenOperator}
            options={operatorOptions}
            value={operator}
            getLabel={(o) => {
              const Icon = OPS_ICONS[o.value as OPS_KEY_TYPE] ?? FileQuestionIcon;
              return (
                <>
                  {o.label} <Icon className="size-3.5" />
                </>
              );
            }}
            getValue={(o) => o.value}
            onChange={(option) => {
              if (!column) return;
              dispatch({
                type: 'setOperator',
                path,
                index,
                operator: option,
                column,
                value,
              });
            }}
            startIcon={
              showMatchCase && (
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="match-case-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!column) return;
                    dispatch({
                      type: 'setMatchCase',
                      ignoreCase: !ignoreCase,
                      column,
                      path,
                      index,
                    });
                  }}
                  className={cn(
                    'shrink-0',
                    ignoreCase
                      ? 'text-blue-600 hover:text-blue-700'
                      : 'text-muted-foreground hover:text-muted-foreground',
                  )}
                  data-tip={ignoreCase ? 'Match Case' : 'Ignore Case'}
                >
                  <CaseSensitive />
                </Button>
              )
            }
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const el = inputRef.current;
              if (!el) return;
              el.focus();
            }}
          />
          {column && operator && (
            <EntryEditorValueInput
              open={openValue}
              onOpenChange={setOpenValue}
              column={column}
              ref={inputRef}
              operator={operator}
              onChange={(value, done) => {
                dispatch({
                  type: 'setValue',
                  path,
                  index,
                  operator,
                  value,
                  column,
                  ignoreCase,
                  done,
                });
              }}
              value={value}
              path={path}
            />
          )}
        </>
      )}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: 'removeFilter', path: [...path, index] });
        }}
        variant="ghost"
        size="icon"
        className="shrink-0"
        data-tip="Remove filter"
        data-testid="remove-filter-button"
      >
        <X />
      </Button>
    </div>
  );
}

export default memo(EntryEditor) as <T extends object>(props: Props<T>) => React.ReactNode;
