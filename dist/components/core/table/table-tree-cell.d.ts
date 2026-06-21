import type { CellContext } from '@tanstack/react-table';
import type React from 'react';
import type { StringKeyof } from '../../../lib/core/common/ds/types/filter';
import type { TreeData } from '../../../lib/core/common/types/Store';
import './tree-cell.css';
interface TableTreeCellProps<T extends TreeData> extends CellContext<T, unknown> {
    attributeCode: StringKeyof<T>;
    labelAttributeCode: StringKeyof<T>;
    className?: string;
    onClick?: () => void;
    endComponent?: React.ReactNode;
    feedbackMask?: boolean;
}
declare const _default: <T extends TreeData>(props: TableTreeCellProps<T>) => React.ReactNode;
export default _default;
//# sourceMappingURL=table-tree-cell.d.ts.map