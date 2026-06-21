import type { UserList } from '../../../../../../../lib/common/ds/types/core/UserList';
import type { Row } from '../../../../../../../lib/core/common/ds/types/filter';
export type UsersLOVComboboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (values: string[], rows: readonly Row<UserList>[]) => void;
  roleCode: string;
  value?: string[];
  trigger?: React.ReactNode;
};
export default function UsersLOVCombobox({
  open,
  onOpenChange,
  onSelect,
  roleCode,
  value,
  trigger,
}: UsersLOVComboboxProps): import('react/jsx-runtime').JSX.Element;
//# sourceMappingURL=user-lov-combobox.d.ts.map
