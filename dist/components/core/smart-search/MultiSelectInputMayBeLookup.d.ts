import { type Ref } from 'react';
import type { Path } from '../../../components/core/mutX/ImmutableTypes';
import { type SelectColumn } from '../../../components/core/smart-search/types';
interface Props {
    ref: Ref<HTMLInputElement>;
    operator: string;
    onChange: (val: string[], done?: boolean) => void;
    value: string[];
    doNotFocusOnMount?: boolean;
    className?: string;
    path: Path;
}
export declare function MultiSelectInputMayBeLookup<T extends object>({ column, ...rest }: Props & {
    column: SelectColumn<T, any>;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MultiSelectInputMayBeLookup.d.ts.map