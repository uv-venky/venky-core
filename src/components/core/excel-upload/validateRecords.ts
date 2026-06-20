/* Copyright (c) 2024-present VENKY Corp. */

import { isValid, parse, parseISO, format } from 'date-fns';
import { isWhoAttribute, type Attribute } from '@/lib/core/common/ds/types/Attribute';
import type { Row } from '@/lib/core/common/ds/types/filter';
import { isEmpty } from '@/lib/core/common/isEmpty';
import { isDateType, isNumberType, isStringType } from '@/lib/core/common/ds/types/attribute-utils';
import type { DefaultFunction } from '@/components/core/excel-upload/types';
export function isDateTimeType(type: string): boolean {
  return type === 'DateTime' || type === 'Timestamp' || type === 'datetime';
}

export async function validateRecords<T extends object>({
  data,
  attrs,
  pkAttrs,
  dateTimeFormat,
  dateFormat,
  maxRows,
  defaultFunction,
  fileName,
  fileType,
  fileSize,
}: {
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
}): Promise<Row<T>[]> {
  // Add to your attribute-utils.ts file

  if (data.length > maxRows) {
    throw new Error(`${data.length} rows found in the file! Maximum allowed rows are ${maxRows}!`);
  }

  if (defaultFunction) {
    const result = await defaultFunction({
      records: data,
      fileName,
      fileType,
      fileSize,
    });
    if (result.status === 'SUCCESS') {
      if (Array.isArray(result.result)) {
        data = result.result;
      } else {
        throw new Error(
          `Developer Error: Default function ${defaultFunction} must return an array of records! Instead it returned ${JSON.stringify(
            result.result,
          )}`,
        );
      }
    } else if (result.status === 'ERROR') {
      throw new Error(result.error);
    }
  }

  const records: Record<string, unknown>[] = [];
  const uniqueVals: string[] = [];
  const refDate = new Date();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const record: Record<string, unknown> = { _status: 'I' };
    let pkVal = '';

    for (let j = 0; j < attrs.length; j++) {
      const attr = attrs[j];
      const { name, code, column } = attr;
      let label = name;
      let val = row[name];

      if (val !== undefined) {
        delete row[name];
      } else {
        val = row[code];
        if (val !== undefined) {
          label = code;
          delete row[code];
        } else if (column) {
          val = row[column];
          if (val !== undefined) {
            label = column;
            delete row[column];
          }
        }
      }

      if (typeof val === 'string') {
        val = val.trim();
        if (val === '' || val === 'null' || val === 'NULL') {
          val = undefined;
        }
      }

      if (val !== undefined && val != null) {
        if (pkAttrs.includes(attr)) {
          pkVal = pkVal ? `${pkVal}-${val}` : `${val}`;
        }

        if (isDateType(attr.type)) {
          let date: Date | undefined;
          if (typeof val === 'string') {
            let strVal = val;

            // --- FIX START ---
            // First, try parsing as ISO format
            try {
              // Use a temporary variable.
              // Only assign to 'date' if it's *actually* valid.
              const isoDate = parseISO(strVal);
              if (isValid(isoDate)) {
                date = isoDate;
                val = isoDate;
              }
              // If invalid, 'date' remains undefined, and we fall through
            } catch (_error) {
              // 'date' remains undefined
            }
            // --- FIX END ---

            // If ISO parsing failed (date is still undefined), try custom formats
            if (!date) {
              if (strVal.endsWith('+00')) {
                strVal = strVal.replace('+00', '+00:00');
              }
              date = parse(strVal, dateTimeFormat, refDate);
              if (!date || !isValid(date)) {
                date = parse(strVal, dateFormat, refDate);
              }
              if (date && isValid(date)) {
                val = date;
              }
            }
          }

          if (val instanceof Date) {
            // This is the date you *parsed*
            const parsedDate = val;

            if (isDateTimeType(attr.type as string)) {
              // For DateTime, format using local time
              record[attr.code] = format(parsedDate, 'yyyy-MM-dd HH:mm:ss');
            } else {
              // For Date-only, format using local time
              // This now works because 'parse' created a local midnight date
              record[attr.code] = format(parsedDate, 'yyyy-MM-dd');
            }
          } else {
            throw new Error(
              `Invalid date value '${val}' of type '${typeof val}' for ${label} at row ${i + 1}! Must be a date cell!`,
            );
          }
        } else if (isNumberType(attr.type)) {
          if (typeof val === 'string') {
            const value = Number(val);
            if (!Number.isNaN(value)) {
              val = value;
            }
          }
          if (typeof val === 'number') {
            record[attr.code] = val;
          } else {
            throw new Error(`Invalid number value '${val}' for ${label} at row ${i + 1}!`);
          }
        } else if (attr.type === 'Boolean') {
          if (typeof val === 'boolean') {
            record[attr.code] = val;
          } else if (typeof val === 'number') {
            if (val === 1 || val === 0) {
              record[attr.code] = val !== 0;
            } else {
              throw new Error(
                `Invalid boolean value '${val}' for ${label} at row ${i + 1}! Must be 0 (false) or 1 (true)!`,
              );
            }
          } else if (typeof val === 'string') {
            const lowerVal = val.toLowerCase();
            if (lowerVal === 'true' || lowerVal === 'false') {
              record[attr.code] = lowerVal === 'true';
            } else {
              throw new Error(
                `Invalid boolean value '${val}' for ${label} at row ${i + 1}! Must be "false", "true", "FALSE", or "TRUE"!`,
              );
            }
          } else {
            throw new Error(`Invalid boolean value '${val}' for ${label} at row ${i + 1}! Must be "false" or "true"!`);
          }
        } else if (attr.type === 'YN') {
          if (val === 'Y' || val === 'N') {
            record[attr.code] = val;
          } else {
            throw new Error(`Invalid YN value '${val}' for ${label} at row ${i + 1}! Must be Y or N!`);
          }
        } else if (attr.type === 'TF') {
          if (val === 'T' || val === 'F') {
            record[attr.code] = val;
          } else {
            throw new Error(`Invalid TF value '${val}' for ${label} at row ${i + 1}! Must be T or F!`);
          }
        } else if (typeof val === 'string') {
          if (attr.maxLength && val.length > attr.maxLength) {
            throw new Error(
              `Value '${val}' for ${label} at row ${i + 1} is too long ${
                val.length
              } chars! Maximum length allowed is ${attr.maxLength} chars!`,
            );
          }
          record[attr.code] = val;
        } else if (typeof val === 'number' && isStringType(attr.type)) {
          record[attr.code] = val.toString();
        } else if (typeof val === 'object' && attr.type === 'JSON') {
          record[attr.code] = val;
        } else if (Array.isArray(val) && attr.type === 'TextArray') {
          record[attr.code] = val;
        } else if (
          attr.type === 'Vector' &&
          Array.isArray(val) &&
          val.every((x) => typeof x === 'number' && Number.isFinite(x))
        ) {
          record[attr.code] = val;
        } else {
          throw new Error(
            `Invalid value [${val}] of type '${typeof val}' for ${label} at row ${i + 1}. Expected ${attr.type}!`,
          );
        }
      } else if (!attr.optional && !attr.auto) {
        if (!isWhoAttribute(attr) && isEmpty(attr.defaultValue)) {
          throw new Error(`Missing required value for ${label} at row ${i + 1}!`);
        }
      }
    }

    if (Object.keys(row).length > 0) {
      throw new Error(
        `Invalid column titles ${Object.keys(row).join(', ')} at row ${i + 1}! Allowed column titles are ${attrs
          .map((attr) => attr.code)
          .join(', ')}`,
      );
    }

    if (pkVal) {
      if (uniqueVals.includes(pkVal)) {
        throw new Error(`Duplicate primary key value '${pkVal}' at row ${i + 1}!`);
      }
      uniqueVals.push(pkVal);
    }

    records.push(record);
  }

  return records as Row<T>[];
}
