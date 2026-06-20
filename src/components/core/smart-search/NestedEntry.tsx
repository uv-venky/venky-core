/* Copyright (c) 2023-present Venky Corp. */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { DropdownMenuField } from '@/components/core/dropdown-menu';
import useHandleClickOutside from '@/components/core/hooks/useHandleClickOutside';
import useWhyDidYouUpdate from '@/components/core/hooks/useWhyDidYouUpdate';
import { isSamePath, type Path } from '@/components/core/mutX/ImmutableTypes';
import { getIn } from '@/components/core/mutX/ImmutableUtils';
import Entry from '@/components/core/smart-search/Entry';
import EntryEditor from '@/components/core/smart-search/EntryEditor';
import { COMBINER_OPTIONS } from '@/components/core/smart-search/SmartSearchTypes';
import { isComplete, useSmartSearchDispatcher, useSmartSearchState } from '@/components/core/smart-search/context';
import type { Combiner, FilterEntry } from '@/lib/core/common/ds/types/filter';
import { isStickyFilter } from '@/components/core/smart-search/utils';

type Props<T extends object> = {
  path: Path;
  readOnly?: boolean;
  stickyFilters?: (keyof T)[];
};

const LABEL = { anyof: 'Any of', allof: 'All of', noneof: 'None of' };

function NestedEntry<T extends object>(props: Props<T>) {
  const dispatch = useSmartSearchDispatcher<T>();
  const state = useSmartSearchState<T>();
  const [open, setOpen] = useState(false);
  useWhyDidYouUpdate('NestedEntry', props);

  const outerRef = useRef<HTMLDivElement>(null);

  function isEditingIncomplete() {
    if (!state.activePath.length) return false;
    return !isComplete(getIn(state.filters, state.activePath, undefined));
  }

  const showButtons = useCallback(() => {
    if (props.readOnly || !state.editing) return false;
    if (isSamePath(state.activePath, props.path)) return true;
    const parent = [...state.activePath];
    parent.pop();
    return isSamePath(parent, props.path);
  }, [props.readOnly, state.activePath, props.path, state.editing]);

  useHandleClickOutside({
    ref: outerRef,
    onInteractOutside: () => {
      if (isEditingIncomplete()) {
        return;
      }
      dispatch({ type: 'editPath', path: [] });
    },
    shouldExcludeElement: (e) => {
      return e.dataset.smartSearch != null;
    },
    open: isSamePath(state.activePath, props.path),
  });

  useEffect(() => {
    if (showButtons() && state.activeSection === 'combiner') {
      setOpen(true);
    }
  }, [showButtons, state.activeSection]);

  return (
    <div
      role="button"
      tabIndex={-1}
      className={cn(
        'nested flex items-center gap-2 rounded-md border px-1 py-0.5',
        isSamePath(state.activePath, props.path) ? 'ring-2 ring-ring' : '',
      )}
      onClick={(e) => {
        e.stopPropagation();
      }}
      ref={outerRef}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          e.preventDefault();
          if (!open) {
            dispatch({ type: 'escape' });
          }
        }
      }}
    >
      {showButtons() ? (
        <DropdownMenuField
          open={open}
          onOpenChange={setOpen}
          dataTestId="nested-entry-dropdown-menu"
          options={COMBINER_OPTIONS}
          value={props.path[props.path.length - 1] as Combiner}
          getLabel={(o) => o.label}
          getValue={(o) => o.value}
          onChange={(value) => {
            dispatch({
              type: 'setCombiner',
              path: props.path,
              combiner: value as Combiner,
            });
          }}
        />
      ) : (
        <span
          role="button"
          tabIndex={-1}
          data-testid={`nested-entry-${props.path.join('-')}`}
          className={cn({
            'cursor-not-allowed': isEditingIncomplete(),
            'cursor-pointer': !isEditingIncomplete() && !props.readOnly,
          })}
          onClick={(e) => {
            e.stopPropagation();
            if (props.readOnly || isEditingIncomplete()) return;
            dispatch({
              type: 'editPath',
              path: props.path,
              activeSection: 'combiner',
            });
          }}
        >
          {LABEL[props.path[props.path.length - 1] as Combiner]}
        </span>
      )}
      {(getIn(state.filters, props.path, []) as FilterEntry<T>[]).map((filter, index) => {
        return isSamePath([...props.path, index], state.activePath) &&
          !props.readOnly &&
          state.editing &&
          !isStickyFilter(filter, props.stickyFilters) ? (
          <EntryEditor
            // biome-ignore lint/suspicious/noArrayIndexKey: index is ok here
            key={index}
            path={props.path}
            index={index}
            filter={filter}
            activeSection={state.activeSection}
          />
        ) : (
          <Entry
            // biome-ignore lint/suspicious/noArrayIndexKey: index is ok here
            key={index}
            readOnly={props.readOnly}
            path={props.path}
            index={index}
            filter={filter}
            stickyFilters={props.stickyFilters}
            active={isSamePath([...props.path, index], state.activePath)}
          />
        );
      })}
      {showButtons() && (
        <>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              if (isEditingIncomplete()) {
                return;
              }
              dispatch({ type: 'addNestedFilter', path: props.path });
            }}
            className="shrink-0"
            disabled={isEditingIncomplete()}
            variant="ghost"
            size="icon"
            data-tip="Add nested filter"
            data-testid={`add-nested-filter-${props.path.join('-')}`}
          >
            <Plus />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'removeNestedFilter', path: props.path });
            }}
            variant="ghost"
            size="icon"
            data-tip="Remove nested filter"
            data-testid={`remove-nested-filter-${props.path.join('-')}`}
          >
            <X />
          </Button>
        </>
      )}
    </div>
  );
}

export default memo(NestedEntry) as <T extends object>(props: Props<T>) => React.ReactNode;
