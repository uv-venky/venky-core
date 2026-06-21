import { type Ref } from 'react';
import type { Column } from '../../../components/core/smart-search/types';
interface Props<T extends object> {
    ref: Ref<HTMLInputElement>;
    onChange: (val: number[]) => void;
    value: number[];
    className?: string;
    column: Column<T>;
}
export declare function MultiNumberInput<T extends object>(props: Props<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MultiNumberInput.d.ts.map