import { Input } from '@/components/ui/input';
import type { Store } from '@/lib/core/common/types/Store';
import { cn } from '@/lib/utils';
import type { CellContext } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import {
  useCellErrors,
  useCurrentRowId,
  useDBRows,
  useIsStoreLoading,
  useRowValue,
  useValue,
  useValueSetter,
} from '@/components/core/hooks/useStoreHooks';
import { ComboboxField } from '@/components/core/combobox';
import TableCell, { DirtyCellIndicator } from '@/components/core/table/table-cell';
import { DateInput } from '@/components/core/date-field';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import { normalizeTextFieldWhitespace } from '@/lib/core/common/normalizeTextFieldWhitespace';
import { isValid, parse } from 'date-fns';

export type pasteDataType = 'Text' | 'Number' | 'Date';

const toISO = (date: string) => {
  const isoDate = parse(date, 'MM/dd/yyyy', new Date());
  if (isValid(isoDate)) {
    isoDate.setHours(12, 0, 0, 0);
    return isoDate.toISOString();
  }
  return null;
};

export async function onDataPaste<T extends object, K extends StringKeyof<T>>(
  data: string,
  store: Store<T>,
  dataType: pasteDataType,
  attributeCode: K,
) {
  const pastedValues = data.trim().split(/\r\n|\n|\r/);
  if (pastedValues.length === 0) {
    return;
  }
  const allRowIds = store.rowIds();
  const currentRowId = store.currentRowId();
  const startIndex = allRowIds.indexOf(currentRowId ?? '');
  if (startIndex === -1) {
    console.error('Current row ID not found.');
    return;
  }

  for (const [index, value] of pastedValues.entries()) {
    const targetRowIndex = startIndex + index;
    let targetRowId: string | undefined;

    let parsedValue: any = value;
    switch (dataType) {
      case 'Number':
        parsedValue = Number.isNaN(Number(value)) ? 0 : Number(value);
        break;
      case 'Date':
        parsedValue = toISO(value);
        break;
    }

    const partialRecord = {
      [attributeCode]: parsedValue,
    } as Partial<T>;

    if (targetRowIndex < allRowIds.length) {
      targetRowId = allRowIds[targetRowIndex];
      store.updateRow(targetRowId, partialRecord);
    } else {
      targetRowId = await store.createNew({
        partialRecord,
        addOnTop: false,
      });
    }
    //fetchDetailsAndUpdateRow(targetRowId??'', value);
  }
}

export function EditableNumberCell(
  props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    currency?: boolean;
    store: Store<any>;
    onPaste?: (data: any, dataType: pasteDataType) => void;
    doValidate?: (value: string | undefined) => void;
    feedbackMask?: boolean;
  } & CellContext<any, unknown>,
) {
  const { row, store, disabled, feedbackMask } = props;
  const currentRowId = useCurrentRowId(store);
  const rowId = row.id;
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (focused && currentRowId !== rowId) {
      setFocused(false);
    }
  }, [focused, currentRowId, rowId]);

  if (currentRowId !== rowId || disabled) {
    return (
      <div
        className="h-full w-full"
        onClickCapture={() => {
          setFocused(true);
        }}
      >
        <TableCell {...props} type="Number" className="cursor-text" />
      </div>
    );
  }

  return <NumberInputCell {...props} autoFocus={focused} feedbackMask={feedbackMask} />;
}

function NumberInputCell(
  props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    autoFocus?: boolean;
    store: Store<any>;
    onPaste?: (data: any, dataType: pasteDataType) => void;
    doValidate?: (value: string | undefined) => void;
    feedbackMask?: boolean;
  } & CellContext<any, unknown>,
) {
  const { attributeCode, className, disabled, store, autoFocus, row, onPaste, doValidate, feedbackMask } = props;
  const value = useRowValue(store, row.id, attributeCode);
  const onChange = useValueSetter(store, attributeCode);
  const errorMsg = useCellErrors(store, row.id, attributeCode);

  return (
    <DirtyCellIndicator rowId={row.id} store={store} attributeCode={attributeCode} feedbackMask={feedbackMask}>
      <Input
        type="number"
        value={value ?? ''}
        className={cn(
          'relative h-full rounded-none bg-background px-2 py-0 text-right',
          className,
          errorMsg != null && 'border-red-500 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500',
        )}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (Number.isNaN(value)) {
            return;
          }
          doValidate?.(e.target.value);
          onChange(value);
        }}
        disabled={disabled}
        autoFocus={autoFocus}
        onFocus={(e) => {
          e.target.select();
        }}
        onPaste={
          onPaste
            ? (value) => {
                value.preventDefault();
                onPaste(value.clipboardData.getData('text/plain'), 'Number');
              }
            : undefined
        }
      />
    </DirtyCellIndicator>
  );
}

export function EditableTextCell(
  props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    store: Store<any>;
    onPaste?: (data: any, dataType: pasteDataType) => void;
    doValidate?: (value: string | undefined) => void;
    feedbackMask?: boolean;
  } & CellContext<any, unknown>,
) {
  const { row, store, disabled, feedbackMask } = props;
  const currentRowId = useCurrentRowId(store);
  const rowId = row.id;
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (focused && currentRowId !== rowId) {
      setFocused(false);
    }
  }, [focused, currentRowId, rowId]);

  if (currentRowId !== rowId || disabled) {
    return (
      <div
        className="h-full w-full"
        onClickCapture={() => {
          setFocused(true);
        }}
      >
        <TableCell {...props} type="Text" />
      </div>
    );
  }

  return <TextInputCell {...props} autoFocus={focused} feedbackMask={feedbackMask} />;
}

function TextInputCell(
  props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    autoFocus?: boolean;
    store: Store<any>;
    onPaste?: (data: any, dataType: pasteDataType) => void;
    doValidate?: (value: string | undefined) => void;
    feedbackMask?: boolean;
  } & CellContext<any, unknown>,
) {
  const { attributeCode, className, disabled, store, autoFocus, row, onPaste, doValidate, feedbackMask } = props;
  const value = useValue(store, attributeCode);
  const onChange = useValueSetter(store, attributeCode);
  const errorMsg = useCellErrors(store, row.id, attributeCode);

  return (
    <DirtyCellIndicator rowId={row.id} store={store} attributeCode={attributeCode} feedbackMask={feedbackMask}>
      <Input
        type="text"
        value={value ?? ''}
        className={cn(
          'h-full rounded-none bg-background px-2 py-0',
          className,
          errorMsg != null && 'border-red-500 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500',
        )}
        onChange={(e) => {
          onChange(e.target.value);
          doValidate?.(e.target.value);
        }}
        disabled={disabled}
        autoFocus={autoFocus}
        onFocus={(e) => {
          e.target.select();
        }}
        onBlur={() => {
          const normalized = normalizeTextFieldWhitespace(value === '' ? undefined : value);
          if (normalized !== value) {
            onChange(normalized);
            doValidate?.(normalized);
          }
        }}
        onPaste={
          onPaste
            ? (pasteEv) => {
                pasteEv.preventDefault();
                onPaste(pasteEv.clipboardData.getData('text/plain'), 'Text');
              }
            : undefined
        }
      />
    </DirtyCellIndicator>
  );
}

export function EditableComboboxInputCell(
  props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    label: string;
    store: Store<any>;
    optionsStore: Store<any>;
    getLabel: (option: any) => string;
    getOptionValue: (option: any) => string;
    doValidate?: (value: string | undefined) => void;
    feedbackMask?: boolean;
  } & CellContext<any, unknown>,
) {
  const { row, store, disabled, feedbackMask } = props;
  const currentRowId = useCurrentRowId(store);
  const rowId = row.id;
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (focused && currentRowId !== rowId) {
      setFocused(false);
    }
  }, [focused, currentRowId, rowId]);

  if (currentRowId !== rowId || disabled) {
    return (
      <div
        className="h-full w-full"
        onClickCapture={() => {
          setFocused(true);
        }}
      >
        <TableCell {...props} type="Text" />
      </div>
    );
  }

  return <ComboboxInputCell {...props} feedbackMask={feedbackMask} />;
}

function ComboboxInputCell(
  props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    label: string;
    store: Store<any>;
    optionsStore: Store<any>;
    getLabel: (option: any) => string;
    getOptionValue: (option: any) => string;
    feedbackMask?: boolean;
  } & CellContext<any, unknown>,
) {
  const {
    attributeCode,
    className,
    disabled,
    store,
    optionsStore,
    row,
    label,
    getLabel,
    getOptionValue,
    feedbackMask,
  } = props;
  const value = useValue(store, attributeCode);
  const onChange = useValueSetter(store, attributeCode);
  const isPlanLoading = useIsStoreLoading(optionsStore);
  const comboboxOptions = useDBRows(optionsStore);

  return (
    <DirtyCellIndicator rowId={row.id} store={store} attributeCode={attributeCode} feedbackMask={feedbackMask}>
      <ComboboxField
        className={cn('h-full w-full bg-background px-2 py-0', className)}
        value={value}
        options={comboboxOptions}
        getValue={getOptionValue}
        getLabel={getLabel}
        onSelect={(optionValue: any) => {
          onChange(optionValue);
        }}
        placeholder={`Select a ${label}...`}
        searchPlaceholder={`Search for a ${label}...`}
        emptyText={`No ${label}s found`}
        isLoading={isPlanLoading}
        disabled={disabled}
      />
    </DirtyCellIndicator>
  );
}

export function EditableYNCell(
  props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    store: Store<any>;
    handleClick?: () => void;
  } & CellContext<any, unknown>,
) {
  const { row, store, attributeCode, disabled, handleClick } = props;
  const rowId = row.id;
  const value = useValue(store, attributeCode);

  return (
    <div
      className={cn('h-full w-full', !disabled && 'cursor-pointer')}
      onClickCapture={() => {
        if (disabled) {
          return;
        }
        store.setValue(attributeCode, value === 'Y' ? 'N' : 'Y', rowId);
        handleClick?.();
      }}
    >
      <TableCell {...props} type="YN" />
    </div>
  );
}

export function EditableBooleanCell(
  props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    store: Store<any>;
  } & CellContext<any, unknown>,
) {
  const { row, store, attributeCode, disabled } = props;
  const rowId = row.id;
  const value = useValue(store, attributeCode);

  return (
    <div
      className={cn('h-full w-full', !disabled && 'cursor-pointer')}
      onClickCapture={() => {
        if (disabled) {
          return;
        }
        store.setValue(attributeCode, !value, rowId);
      }}
    >
      <TableCell {...props} type="Boolean" />
    </div>
  );
}

export function EditableTFCell(
  props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    store: Store<any>;
  } & CellContext<any, unknown>,
) {
  const { row, store, attributeCode, disabled } = props;
  const rowId = row.id;
  const value = useValue(store, attributeCode);

  return (
    <div
      className={cn('h-full w-full', !disabled && 'cursor-pointer')}
      onClickCapture={() => {
        if (disabled) {
          return;
        }
        store.setValue(attributeCode, value === 'T' ? 'F' : 'T', rowId);
      }}
    >
      <TableCell {...props} type="TF" />
    </div>
  );
}

export function EditableDateCell(
  props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    store: Store<any>;
    min?: string;
    max?: string;
    onPaste?: (data: any, dataType: pasteDataType) => void;
    doValidate?: (value: string | undefined) => void;
    feedbackMask?: boolean;
  } & CellContext<any, unknown>,
) {
  const { row, store, disabled, feedbackMask } = props;
  const currentRowId = useCurrentRowId(store);
  const rowId = row.id;
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (focused && currentRowId !== rowId) {
      setFocused(false);
    }
  }, [focused, currentRowId, rowId]);

  if (currentRowId !== rowId || disabled) {
    return (
      <div
        className="h-full w-full"
        onClickCapture={() => {
          setFocused(true);
        }}
      >
        <TableCell {...props} type="Date" />
      </div>
    );
  }

  return <DateInputCell {...props} autoFocus={focused} feedbackMask={feedbackMask} />;
}

function DateInputCell(
  props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    autoFocus?: boolean;
    store: Store<any>;
    min?: string;
    max?: string;
    onPaste?: (data: any, dataType: pasteDataType) => void;
    doValidate?: (value: string | undefined) => void;
    feedbackMask?: boolean;
  } & CellContext<any, unknown>,
) {
  const { attributeCode, className, disabled, store, autoFocus, row, min, max, onPaste, doValidate, feedbackMask } =
    props;
  const value = useValue(store, attributeCode);
  const onChange = useValueSetter(store, attributeCode);
  const errorMsg = useCellErrors(store, row.id, attributeCode);

  return (
    <DirtyCellIndicator rowId={row.id} store={store} attributeCode={attributeCode} feedbackMask={feedbackMask}>
      <DateInput
        value={value ?? ''}
        className={cn(
          'h-full rounded-none bg-background px-2 py-0',
          className,
          errorMsg != null && 'border-red-500 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500',
        )}
        onChange={(value) => {
          doValidate?.(value);
          onChange(value);
        }}
        disabled={disabled}
        autoFocus={autoFocus}
        min={min}
        max={max}
        onPaste={onPaste}
      />
    </DirtyCellIndicator>
  );
}
