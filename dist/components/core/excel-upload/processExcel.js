/* Copyright (c) 2024-present VENKY Corp. */
import { read, utils } from 'xlsx';
import { validateRecords } from '../../../components/core/excel-upload/validateRecords';
export async function processExcel({ defaultFunction, file, maxRows, attrs, pkAttrs, dateFormat, dateTimeFormat, }) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = async (e) => {
            /* create workbook */
            try {
                const binaryStr = e.target?.result;
                const wb = read(binaryStr, {
                    type: 'binary',
                    cellDates: true,
                });
                /* selected the first sheet */
                const wsName = wb.SheetNames[0];
                const ws = wb.Sheets[wsName];
                /* save data */
                const data = utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}
                // Data will be logged in array format containing objects
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
//# sourceMappingURL=processExcel.js.map