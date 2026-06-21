import { type RefObject } from 'react';
import type { Path } from '../../../components/core/mutX/ImmutableTypes';
import { type SelectColumn } from '../../../components/core/smart-search/types';
interface Props {
    operator: string;
    onChange: (val?: string, done?: boolean) => void;
    value: string;
    doNotFocusOnMount?: boolean;
    className?: string;
    path: Path;
    ref: RefObject<HTMLInputElement | null>;
}
export declare function SelectInputMayBeLookup<T extends object>({ column, ...rest }: Props & {
    column: SelectColumn<T, any>;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SelectInputMayBeLookup.d.ts.map