import { type Attribute } from '../../../lib/core/common/ds/types/Attribute';
import type { Row } from '../../../lib/core/common/ds/types/filter';
import type { DefaultFunction } from '../../../components/core/excel-upload/types';
export declare function isDateTimeType(type: string): boolean;
export declare function validateRecords<T extends object>({ data, attrs, pkAttrs, dateTimeFormat, dateFormat, maxRows, defaultFunction, fileName, fileType, fileSize, }: {
    data: Record<string, unknown>[];
    attrs: Attribute<T>[];
    pkAttrs: Attribute<T>[];
    dateTimeFormat: string;
    dateFormat: string;
    defaultFunction?: DefaultFunction;
    maxRows: number;
    fileName: string;
    fileType: string;
    fileSize: number;
}): Promise<Row<T>[]>;
//# sourceMappingURL=validateRecords.d.ts.map