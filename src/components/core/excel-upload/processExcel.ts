/* Copyright (c) 2024-present VENKY Corp. */

import { read, utils, type WorkBook, type WorkSheet } from 'xlsx';
import { validateRecords } from '@/components/core/excel-upload/validateRecords';
import type { Attribute } from '@/lib/core/common/ds/types/Attribute';
import type { Row } from '@/lib/core/common/ds/types/filter';
import type { DefaultFunction } from '@/components/core/excel-upload/types';

export async function processExcel<T extends object>({
  defaultFunction,
  file,
  maxRows,
  attrs,
  pkAttrs,
  dateFormat,
  dateTimeFormat,
}: {
  defaultFunction?: DefaultFunction;
  file: File;
  maxRows: number;
  dateFormat: string;
  dateTimeFormat: string;
  attrs: Attribute<T>[];
  pkAttrs: Attribute<T>[];
}): Promise<Row<T>[]> {
  return new Promise((resolve, reject) => {
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      /* create workbook */
      try {
        const binaryStr: string = e.target?.result as string;
        const wb: WorkBook = read(binaryStr, {
          type: 'binary',
          cellDates: true,
        });

        /* selected the first sheet */
        const wsName: string = wb.SheetNames[0];
        const ws: WorkSheet = wb.Sheets[wsName];

        /* save data */
        const data = utils.sheet_to_json(ws) as Record<string, unknown>[]; // to get 2d array pass 2nd parameter as object {header: 1}
        // Data will be logged in array format containing objects

        const records: Row<T>[] = await validateRecords({
          data,
          attrs,
          pkAttrs,
          dateTimeFormat,
          dateFormat,
          maxRows,
          defaultFunction,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
        resolve(records);
      } catch (ex) {
        reject(ex);
      }
    };
  });
}
