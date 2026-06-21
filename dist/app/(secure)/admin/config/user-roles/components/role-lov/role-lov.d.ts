import type { Roles } from '../../../../../../../lib/common/ds/types/core/Roles';
import type { Row } from '../../../../../../../lib/core/common/ds/types/filter';
export type RolesLOVProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (values: string[], rows: readonly Row<Roles>[]) => void;
  userName: string;
};
export default function RolesLOV({
  open,
  onOpenChange,
  onSelect,
  userName,
}: RolesLOVProps): import('react/jsx-runtime').JSX.Element;
//# sourceMappingURL=role-lov.d.ts.map
