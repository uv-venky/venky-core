import type { Roles } from '../../../../../../../lib/common/ds/types/core/Roles';
import type { Row } from '../../../../../../../lib/core/common/ds/types/filter';
export type RolesLOVComboboxProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (values: string[], rows: readonly Row<Roles>[]) => void;
    userName: string;
    value?: string[];
    trigger?: React.ReactNode;
};
export default function RolesLOVCombobox({ open, onOpenChange, onSelect, userName, value, trigger, }: RolesLOVComboboxProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=role-lov-combobox.d.ts.map