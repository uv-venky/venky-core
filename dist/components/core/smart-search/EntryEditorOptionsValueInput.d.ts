import type { RefObject } from 'react';
import type { Path } from '../../../components/core/mutX/ImmutableTypes';
import type { Column } from '../../../components/core/smart-search/types';
interface Props<T extends object> {
    column: Column<T>;
    ref: RefObject<HTMLButtonElement | null>;
    operator: string;
    value: string;
    className?: string;
    path: Path;
    options: {
        label: string;
        value: string;
    }[];
    onChange: (val: unknown, done?: boolean) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}
export declare function EntryEditorOptionsValueInput<T extends object>(props: Props<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=EntryEditorOptionsValueInput.d.ts.map