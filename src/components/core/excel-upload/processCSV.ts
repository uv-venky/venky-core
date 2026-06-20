/* Copyright (c) 2024-present VENKY Corp. */

import Papa from 'papaparse';
import { validateRecords } from '@/components/core/excel-upload/validateRecords';
import type { Attribute } from '@/lib/core/common/ds/types/Attribute';
import type { Row } from '@/lib/core/common/ds/types/filter';
import type { DefaultFunction } from '@/components/core/excel-upload/types';

export async function processCSV<T extends object>({
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
    reader.readAsText(file);
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      /* create workbook */
      try {
        const csvStr: string = e.target?.result as string;
        const data = Papa.parse(csvStr, {
          header: true,
          skipEmptyLines: true,
        }).data as Record<string, unknown>[];

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
