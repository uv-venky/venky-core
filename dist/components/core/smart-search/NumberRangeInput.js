import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/* Copyright (c) 2023-present Venky Corp. */
import { cn } from '../../../lib/utils';
import assert from '../../../components/core/utils/assert';
import { Separator } from '../../../components/ui/separator';
import { Input } from '../../../components/ui/input';
export function NumberRangeInput(props) {
  const value = () => {
    assert(Array.isArray(props.value) && props.value.length <= 2, "NumberRangeInput's value must be an array");
    return props.value;
  };
  return _jsxs('div', {
    className: cn('relative flex flex-nowrap items-center gap-2 bg-paper pl-1', props.className),
    children: [
      _jsx(Input, {
        ref: props.ref,
        className: cn(
          'w-full flex-1 rounded-none border-none p-0 [appearance:textfield] focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          props.inputClass,
        ),
        style: { lineHeight: '20px', width: '80px' },
        type: 'number',
        'data-testid': 'number-range-input-from',
        onInput: (e) => {
          const [, to] = value();
          const val = e.currentTarget.value;
          props.onChange([Number(val), to]);
        },
        value: value()[0] ?? '',
      }),
      _jsx(Separator, { orientation: 'vertical', className: 'min-h-6' }),
      _jsx(Input, {
        className: cn(
          'w-full flex-1 rounded-none border-none p-0 [appearance:textfield] focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          props.inputClass,
        ),
        style: { lineHeight: '20px', width: '80px' },
        type: 'number',
        'data-testid': 'number-range-input-to',
        onInput: (e) => {
          const [from] = value();
          const val = e.currentTarget.value;
          props.onChange([from, Number(val)]);
        },
        value: value()[1] ?? '',
      }),
    ],
  });
}
//# sourceMappingURL=NumberRangeInput.js.map
