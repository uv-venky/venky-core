import type { RefObject } from 'react';
import type { Path } from '../../../components/core/mutX/ImmutableTypes';
import type { Column } from '../../../components/core/smart-search/types';
interface Props<T extends object> {
    ref: RefObject<HTMLInputElement | null>;
    column: Column<T>;
    operator: string;
    onChange: (val: unknown, done?: boolean) => void;
    value: unknown;
    className?: string;
    path: Path;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}
export declare function EntryEditorValueInput<T extends object>(props: Props<T>): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | null;
export {};
//# sourceMappingURL=EntryEditorValueInput.d.ts.map