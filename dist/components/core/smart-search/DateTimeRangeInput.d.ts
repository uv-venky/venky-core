import type { Ref } from 'react';
import type { Column } from '../../../components/core/smart-search/types';
interface Props<T extends object> {
    column: Column<T>;
    ref: Ref<HTMLInputElement>;
    onChange: (val: string[]) => void;
    value: string[];
    className?: string;
}
export declare function DateTimeRangeInput<T extends object>(props: Props<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DateTimeRangeInput.d.ts.map