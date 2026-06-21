import { jsx as _jsx } from 'react/jsx-runtime';
/* Copyright (c) 2023-present Venky Corp. */
import { useState } from 'react';
import { Combobox } from '../../../components/core/combobox';
export function SelectInput(props) {
  const [open, setOpen] = useState(false);
  if (!props.ref.current) {
    props.ref.current = {
      focus: () => {
        setOpen(true);
      },
    };
  }
  return _jsx(
    Combobox,
    // ref={props.ref}
    {
      // ref={props.ref}
      options: props.column.options,
      getValue: props.column.getOptionValue,
      getLabel: props.column.getOptionLabel,
      onSelect: (item) => props.onChange(item, item != null),
      value: props.value,
      className: 'border-none',
      open: open,
      onOpenChange: setOpen,
      dataTestId: 'select-input',
      disableSortByLabel: props.column.disableSortByLabel,
    },
  );
}
//# sourceMappingURL=SelectInput.js.map
