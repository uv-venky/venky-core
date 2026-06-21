import type { Ref } from 'react';
import type { Column } from '../../../components/core/smart-search/types';
interface Props<T extends object> {
    column: Column<T>;
    ref: Ref<HTMLInputElement>;
    onChange: (val: number[]) => void;
    value: number[];
    className?: string;
    inputClass?: string;
}
export declare function NumberRangeInput<T extends object>(props: Props<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=NumberRangeInput.d.ts.map