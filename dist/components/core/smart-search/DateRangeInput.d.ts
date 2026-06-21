import type { RefObject } from 'react';
import type { Column } from '../../../components/core/smart-search/types';
interface Props<T extends object> {
    column: Column<T>;
    ref: RefObject<HTMLInputElement | null>;
    onValueChange: (val: string[], done?: boolean) => void;
    value: string[];
    className?: string;
}
export declare function DateRangeInput<T extends object>(props: Props<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DateRangeInput.d.ts.map