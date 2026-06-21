import type { UserList } from '../../../../../../../lib/common/ds/types/core/UserList';
import type { Row } from '../../../../../../../lib/core/common/ds/types/filter';
export type UsersLOVProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (values: string[], rows: readonly Row<UserList>[]) => void;
    roleCode: string;
};
export default function UsersLOV({ open, onOpenChange, onSelect, roleCode }: UsersLOVProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=user-lov.d.ts.map