import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/* Copyright (c) 2023-present Venky Corp. */
import { Separator } from '../../../components/ui/separator';
import { cn } from '../../../lib/utils';
import { format, parseISO } from 'date-fns';
import assert from '../../../components/core/utils/assert';
import { DateInput } from '../../../components/core/date-field';
export function DateRangeInput(props) {
  const value = () => {
    assert(Array.isArray(props.value) && props.value.length <= 2, "DateRangeInput's value must be an array");
    return props.value;
  };
  return _jsxs('div', {
    className: 'flex flex-nowrap items-center gap-1 divide-x bg-paper pl-1',
    children: [
      _jsx(DateInput, {
        dataTestId: 'date-input-from',
        ref: props.ref,
        className: cn(
          'h-full w-full border-none focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0',
          props.className,
        ),
        onChange: (from) => {
          const [, to] = value();
          props.onValueChange([from ?? '', to]);
        },
        value: value()[0] ? format(parseISO(value()[0]), `yyyy-MM-dd`) : '',
      }),
      _jsx(Separator, { orientation: 'vertical', className: 'min-h-6' }),
      _jsx(DateInput, {
        dataTestId: 'date-input-to',
        className: cn(
          'h-full w-full border-none focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0',
          props.className,
        ),
        onChange: (to) => {
          // Don't pass usingPicker as done - the native date picker fires onChange
          // when navigating months or selecting dates, but the user isn't done yet.
          const [from] = value();
          props.onValueChange([from, to ?? '']);
        },
        value: value()[1] ? format(parseISO(value()[1]), `yyyy-MM-dd`) : '',
      }),
    ],
  });
}
//# sourceMappingURL=DateRangeInput.js.map
