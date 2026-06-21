import { type Ref } from 'react';
import type { Path } from '../../../components/core/mutX/ImmutableTypes';
import type { SelectOptionsColumn } from '../../../components/core/smart-search/types';
interface Props<T extends object> {
    column: SelectOptionsColumn<T, any>;
    ref: Ref<HTMLInputElement>;
    operator: string;
    onChange: (val: string[], done?: boolean) => void;
    value: string[];
    doNotFocusOnMount?: boolean;
    className?: string;
    path: Path;
}
export declare function MultiSelectInput<T extends object>(props: Props<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MultiSelectInput.d.ts.map