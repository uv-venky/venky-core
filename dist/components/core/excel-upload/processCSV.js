/* Copyright (c) 2024-present VENKY Corp. */
import Papa from 'papaparse';
import { validateRecords } from '../../../components/core/excel-upload/validateRecords';
export async function processCSV({ defaultFunction, file, maxRows, attrs, pkAttrs, dateFormat, dateTimeFormat, }) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = async (e) => {
            /* create workbook */
            try {
                const csvStr = e.target?.result;
                const data = Papa.parse(csvStr, {
                    header: true,
                    skipEmptyLines: true,
                }).data;
                const records = await validateRecords({
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
            }
            catch (ex) {
                reject(ex);
            }
        };
    });
}
//# sourceMappingURL=processCSV.js.map