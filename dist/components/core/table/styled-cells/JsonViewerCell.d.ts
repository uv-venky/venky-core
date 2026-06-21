import type { StringKeyof } from '../../../../lib/core/common/ds/types/filter';
import type { CellContext } from '@tanstack/react-table';
export interface JsonViewerCellProps<T extends object> extends CellContext<T, unknown> {
    attributeCode: StringKeyof<T>;
    /** Title shown on the JSON viewer dialog */
    viewerTitle: string;
    className?: string;
    feedbackMask?: boolean;
}
/** Normalize DB/API JSON values (object or JSON string) for tree viewers. */
export declare function normalizeJsonForViewer(raw: unknown): unknown | null;
/**
 * Table cell that opens a tree JSON viewer (JsonPreview) for object/array/primitive or JSON strings.
 */
export declare function JsonViewerCell<T extends object>({ attributeCode, viewerTitle, className, feedbackMask, row, }: JsonViewerCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=JsonViewerCell.d.ts.map