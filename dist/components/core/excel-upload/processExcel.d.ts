import type { Attribute } from '../../../lib/core/common/ds/types/Attribute';
import type { Row } from '../../../lib/core/common/ds/types/filter';
import type { DefaultFunction } from '../../../components/core/excel-upload/types';
export declare function processExcel<T extends object>({ defaultFunction, file, maxRows, attrs, pkAttrs, dateFormat, dateTimeFormat, }: {
    defaultFunction?: DefaultFunction;
    file: File;
    maxRows: number;
    dateFormat: string;
    dateTimeFormat: string;
    attrs: Attribute<T>[];
    pkAttrs: Attribute<T>[];
}): Promise<Row<T>[]>;
//# sourceMappingURL=processExcel.d.ts.map