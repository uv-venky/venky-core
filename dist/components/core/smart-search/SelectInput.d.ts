import { type RefObject } from 'react';
import type { Path } from '../../../components/core/mutX/ImmutableTypes';
import type { SelectOptionsColumn } from '../../../components/core/smart-search/types';
interface Props<T extends object> {
    column: SelectOptionsColumn<T, any>;
    operator: string;
    onChange: (val?: string, done?: boolean) => void;
    value: string;
    doNotFocusOnMount?: boolean;
    className?: string;
    path: Path;
    ref: RefObject<HTMLInputElement | null>;
}
export declare function SelectInput<T extends object>(props: Props<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SelectInput.d.ts.map