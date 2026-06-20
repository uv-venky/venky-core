import type { DATE_OPS_KEY_TYPE } from '@/components/core/smart-search/operators';
import { formatISO, parseISO } from 'date-fns';
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subDays,
} from 'date-fns';
import {
  isNestedFilter,
  splitFilter,
  type Combiner,
  type FilterEntry,
  type Filters,
  type Row,
  type SchemaMember,
} from '@/lib/core/common/ds/types/filter';
import { isEmpty, isNotEmpty, isNull, keys } from '@/lib/core/common/isEmpty';
import type { Store } from '@/lib/core/common/types/Store';
import clientLogger from '@/lib/core/client/client-logger';
import type { Attribute } from '@/lib/core/common/ds/types/Attribute';
import type { AttributeType } from '@/lib/core/common/ds/types/AttributeType';

/** Align local filter dispatch with QueryBuilder.appendToWhereClause / addFilterToWhereClause. */
function resolveFilterType<T extends object>(attribute: Attribute<T>): AttributeType {
  const { type } = attribute;
  if (type.startsWith('Enum:')) {
    return 'Text';
  }
  if (type === 'Reference' && attribute.ref) {
    const refType = attribute.ref.type;
    if (refType === 'Number') return 'Number';
    if (refType === 'Boolean') return 'Boolean';
    if (refType === 'UUID') return 'UUID';
    if (refType === 'Text' || refType === 'YN' || refType === 'TF' || refType === 'Reference') return 'Text';
    if (refType.startsWith('Enum:')) return 'Text';
  }
  return type;
}

export const getFixedDate = (op: DATE_OPS_KEY_TYPE): Date | null => {
  const date = new Date();
  if (op === 'today') {
    return date;
  }
  if (op === 'yesterday') {
    return subDays(date, 1);
  }
  if (op === 'tomorrow') {
    return addDays(date, 1);
  }
  return null;
};

export const getFixedRange = (op: DATE_OPS_KEY_TYPE): [Date | null, Date | null] => {
  const date = new Date();
  if (op === 'last7days') {
    return [startOfDay(subDays(date, 6)), endOfDay(date)];
  }
  if (op === 'last14days') {
    return [startOfDay(subDays(date, 13)), endOfDay(date)];
  }
  if (op === 'last28days') {
    return [startOfDay(subDays(date, 27)), endOfDay(date)];
  }
  if (op === 'next7days') {
    return [startOfDay(date), endOfDay(addDays(startOfDay(date), 6))];
  }
  if (op === 'next14days') {
    return [startOfDay(date), endOfDay(addDays(startOfDay(date), 13))];
  }
  if (op === 'next28days') {
    return [startOfDay(date), endOfDay(addDays(startOfDay(date), 27))];
  }
  if (op === 'thisweek') {
    return [startOfWeek(date), endOfWeek(date)];
  }
  if (op === 'thismonth') {
    return [startOfMonth(date), endOfMonth(date)];
  }
  if (op === 'thisquarter') {
    return [startOfQuarter(date), endOfQuarter(date)];
  }
  if (op === 'thisyear') {
    return [startOfYear(date), endOfYear(date)];
  }
  return [null, null];
};

export type FilterFunctionType = <T extends object>(
  filters: Filters<T>,
  attributes: Attribute<T>[],
  record: Row<T>,
) => boolean;
export const combinerMap: {
  [key in Combiner]: FilterFunctionType;
} = {
  anyof: (filters, attributes, record) => {
    for (let i = 0; i < filters.length; i++) {
      if (applyFilter(filters[i], attributes, record)) {
        return true;
      }
    }
    return false;
  },
  allof: (filters, attributes, record) => {
    for (let i = 0; i < filters.length; i++) {
      if (!applyFilter(filters[i], attributes, record)) {
        return false;
      }
    }
    return true;
  },
  noneof: (filters, attributes, record) => {
    for (let i = 0; i < filters.length; i++) {
      if (applyFilter(filters[i], attributes, record)) {
        return false;
      }
    }
    return true;
  },
};

export const hasAll = (str1: string, strs: string[]) => {
  for (let i = 0; i < strs.length; i++) {
    if (!str1.includes(strs[i] as string)) {
      return false;
    }
  }
  return true;
};

export const hasAny = (str1: string, strs: string[]) => {
  for (let i = 0; i < strs.length; i++) {
    if (str1.includes(strs[i] as string)) {
      return true;
    }
  }
  return false;
};

const hasNone = (str1: string, strs: string[], ignoreCase?: boolean) => {
  for (let i = 0; i < strs.length; i++) {
    const needle = strs[i] as string;
    if (ignoreCase) {
      if (str1.toLowerCase().includes(needle.toLowerCase())) return false;
    } else if (str1.includes(needle)) {
      return false;
    }
  }
  return true;
};

export function applyFilters<T extends object>(
  filters: Filters<T>,
  combiner: Combiner,
  attributes: Attribute<T>[],
  record: Row<T>,
): boolean {
  return combinerMap[combiner](filters, attributes, record);
}

function applyFilter<T extends Record<string, any>>(
  filter: FilterEntry<T>,
  attributes: Attribute<T>[],
  record: Row<T>,
): boolean {
  let val = false;
  let range = [];
  if (isNestedFilter(filter)) {
    const combiner: Combiner = Object.keys(filter)[0] as Combiner;
    return applyFilters(filter[combiner] as Filters<T>, combiner, attributes, record);
  }

  const { attributeCode, value: filterValue, operator, ignoreCase } = splitFilter(filter);

  const attribute = attributes.find((a) => a.code === attributeCode);
  if (!attribute) {
    return false;
  }
  if (isEmpty(record[attributeCode])) {
    return operator === 'empty' || operator === 'null';
  }
  const key = attribute.code;
  let value = filterValue;
  const filterType = resolveFilterType(attribute);

  switch (filterType) {
    case 'Text':
    case 'UUID':
    case 'Reference': {
      if (Array.isArray(value)) {
        value = value as string[];
      } else {
        value = value as string;
      }
      const recordValue = record[key] as string;
      switch (operator) {
        case 'empty':
          val = isEmpty(record[key]);
          break;
        case 'notempty':
          val = isNotEmpty(record[key]);
          break;
        case 'is':
          if (!ignoreCase) {
            val = recordValue === value;
          } else {
            val = recordValue.toLowerCase() === (value as string).toLowerCase();
          }
          break;
        case 'not':
          if (!ignoreCase) {
            val = recordValue !== value;
          } else {
            val = recordValue.toLowerCase() !== (value as string).toLowerCase();
          }
          break;
        case 'like':
          if (!ignoreCase) {
            val = recordValue.includes(value as string);
          } else {
            val = recordValue.toLowerCase().includes((value as string).toLowerCase());
          }
          break;
        case 'nct':
          if (!ignoreCase) {
            val = !recordValue.includes(value as string);
          } else {
            val = !recordValue.toLowerCase().includes((value as string).toLowerCase());
          }
          break;
        case 'sw':
          if (!ignoreCase) {
            val = recordValue.startsWith(value as string);
          } else {
            val = recordValue.toLowerCase().startsWith((value as string).toLowerCase());
          }
          break;
        case 'ew':
          if (!ignoreCase) {
            val = recordValue.endsWith(value as string);
          } else {
            val = recordValue.toLowerCase().endsWith((value as string).toLowerCase());
          }
          break;
        case 'in':
          if (!ignoreCase) {
            val = (value as string[]).includes(recordValue);
          } else {
            val = (value as string[]).map((v) => v.toLowerCase()).includes(recordValue.toLowerCase());
          }
          break;
        case 'nin':
          if (!ignoreCase) {
            val = !(value as string[]).includes(recordValue);
          } else {
            val = !(value as string[]).map((v) => v.toLowerCase()).includes(recordValue.toLowerCase());
          }
          break;
        case 'hasall':
          val = hasAll(recordValue, value as string[]);
          break;
        case 'hasany':
          val = hasAny(recordValue, value as string[]);
          break;
        case 'notany':
          val = hasNone(recordValue, value as string[], ignoreCase);
          break;
        case 'slt':
          val = ignoreCase
            ? recordValue.toLowerCase() < (value as string).toLowerCase()
            : recordValue < (value as string);
          break;
        case 'sgt':
          val = ignoreCase
            ? recordValue.toLowerCase() > (value as string).toLowerCase()
            : recordValue > (value as string);
          break;
        case 'isafter':
          val = recordValue > (value as string);
          break;
        case 'isbefore':
          val = recordValue < (value as string);
          break;
        default:
          throw new Error('not handled');
      }
      break;
    }
    case 'Number':
      switch (operator) {
        case 'null':
          val = isEmpty(record[key]);
          break;
        case 'notnull':
          val = isNotEmpty(record[key]);
          break;
        case 'eq':
        case 'is':
          val = record[key] === value;
          break;
        case 'ne':
        case 'not':
          val = record[key] !== value;
          break;
        case 'gt':
          val = (record[key] as number) > (value as number);
          break;
        case 'lt':
          val = (record[key] as number) < (value as number);
          break;
        case 'gte':
          val = (record[key] as number) >= (value as number);
          break;
        case 'lte':
          val = (record[key] as number) <= (value as number);
          break;
        case 'bn':
          val =
            (record[key] as number) >= (value as number[])?.[0] && (record[key] as number) <= (value as number[])?.[1];
          break;
        case 'in':
          val = (value as number[]).includes(record[key] as number);
          break;
        case 'nin':
          val = !(value as number[]).includes(record[key] as number);
          break;
        default:
          throw new Error('not handled');
      }
      break;
    case 'Date': {
      const recordDate = parseISO(record[key] as string);
      switch (operator) {
        case 'empty':
          val = isEmpty(record[key]);
          break;
        case 'notempty':
          val = isNotEmpty(record[key]);
          break;
        case 'on':
          val =
            recordDate >= parseISO(formatISO(parseISO(String(value)).setHours(0, 0, 0))) &&
            recordDate <= parseISO(formatISO(parseISO(String(value)).setHours(23, 59, 59)));

          break;
        case 'noton':
          val = !(
            recordDate >= parseISO(formatISO(parseISO(String(value)).setHours(0, 0, 0))) &&
            recordDate <= parseISO(formatISO(parseISO(String(value)).setHours(23, 59, 59)))
          );
          break;
        case 'after':
          val = recordDate > parseISO(String(value));
          break;
        case 'before':
          val = recordDate < parseISO(String(value));
          break;
        case 'beforetime':
          val = recordDate < parseISO(String(value));
          break;
        case 'onorbefore':
          val = recordDate <= parseISO(String(value));
          break;
        case 'onorafter':
          val = recordDate >= parseISO(String(value));
          break;
        case 'bn':
          val = recordDate >= parseISO((value as string[])?.[0]) && recordDate <= parseISO((value as string[])?.[1]);
          break;
        case 'today':
          val =
            recordDate >= parseISO(formatISO(new Date().setHours(0, 0, 0))) &&
            recordDate <= parseISO(formatISO(new Date().setHours(23, 59, 59)));
          break;
        case 'yesterday': {
          const day = getFixedDate('yesterday') as Date;
          val =
            recordDate >= parseISO(formatISO(day.setHours(0, 0, 0))) &&
            recordDate <= parseISO(formatISO(day.setHours(23, 59, 59)));
          break;
        }
        case 'last7days':
          range = getFixedRange('last7days');
          val =
            recordDate >= parseISO(formatISO(range[0] as Date)) && recordDate <= parseISO(formatISO(range[1] as Date));
          break;
        case 'last14days':
          range = getFixedRange('last14days');
          val =
            recordDate >= parseISO(formatISO(range[0] as Date)) && recordDate <= parseISO(formatISO(range[1] as Date));
          break;
        case 'last28days':
          range = getFixedRange('last28days');
          val =
            recordDate >= parseISO(formatISO(range[0] as Date)) && recordDate <= parseISO(formatISO(range[1] as Date));
          break;
        case 'thisweek':
          range = getFixedRange('thisweek');
          val =
            recordDate >= parseISO(formatISO(range[0] as Date)) && recordDate <= parseISO(formatISO(range[1] as Date));
          break;
        case 'thismonth':
          range = getFixedRange('thismonth');
          val =
            recordDate >= parseISO(formatISO(range[0] as Date)) && recordDate <= parseISO(formatISO(range[1] as Date));
          break;
        case 'thisquarter':
          range = getFixedRange('thisquarter');
          val =
            recordDate >= parseISO(formatISO(range[0] as Date)) && recordDate <= parseISO(formatISO(range[1] as Date));
          break;
        case 'thisyear':
          range = getFixedRange('thisyear');
          val =
            recordDate >= parseISO(formatISO(range[0] as Date)) && recordDate <= parseISO(formatISO(range[1] as Date));
          break;
        case 'inthepast':
          val = recordDate < new Date();
          break;
        case 'inthefuture':
          val = recordDate > new Date();
          break;
        case 'tomorrow': {
          const day = getFixedDate('tomorrow') as Date;
          val =
            recordDate >= parseISO(formatISO(day.setHours(0, 0, 0))) &&
            recordDate <= parseISO(formatISO(day.setHours(23, 59, 59)));
          break;
        }
        case 'next7days':
          range = getFixedRange('next7days');
          val =
            recordDate >= parseISO(formatISO(range[0] as Date)) && recordDate <= parseISO(formatISO(range[1] as Date));
          break;
        case 'next14days':
          range = getFixedRange('next14days');
          val =
            recordDate >= parseISO(formatISO(range[0] as Date)) && recordDate <= parseISO(formatISO(range[1] as Date));
          break;
        case 'next28days':
          range = getFixedRange('next28days');
          val =
            recordDate >= parseISO(formatISO(range[0] as Date)) && recordDate <= parseISO(formatISO(range[1] as Date));
          break;

        default:
          throw new Error('not handled');
      }
      break;
    }
    case 'Boolean':
      switch (operator) {
        case 'empty':
          val = isEmpty(record[key]);
          break;
        case 'notempty':
          val = isNotEmpty(record[key]);
          break;
        case 'istrue':
          val = record[key] === value;
          break;
        default:
          throw new Error('not handled');
      }
      break;

    case 'YN':
    case 'TF':
      switch (operator) {
        case 'empty':
          val = isEmpty(record[key]);
          break;
        case 'notempty':
          val = isNotEmpty(record[key]);
          break;
        case 'is':
          val = record[key] === value;
          break;
        default:
          throw new Error('not handled');
      }
      break;

    case 'TextArray': {
      const recordValues = (record[key] as string[] | undefined) ?? [];
      const filterValues = (Array.isArray(value) ? value : [value]) as string[];
      switch (operator) {
        case 'empty':
          val = isEmpty(record[key]);
          break;
        case 'notempty':
          val = isNotEmpty(record[key]);
          break;
        case 'hasall':
          val = filterValues.every((v) => recordValues.includes(v));
          break;
        case 'hasany':
          val = filterValues.some((v) => recordValues.includes(v));
          break;
        case 'notany':
          val = !filterValues.some((v) => recordValues.includes(v));
          break;
        default:
          throw new Error('not handled');
      }
      break;
    }

    default:
      throw new Error('not handled');
  }
  return val;
}

export async function applyLocalFilters<T extends object>({
  store,
  filter = [],
  sort,
}: {
  store: Store<T>;
  filter: Filters<T> | undefined;
  sort: SchemaMember<T, number> | undefined;
}): Promise<void> {
  const localFilter = [...filter, ...store.headerFilters(), ...store.smartSearchFilters()];
  if (clientLogger.isDebugEnabled) {
    clientLogger.debug({
      ds: store.datasourceId,
      message: `Applying local filter: ${JSON.stringify(localFilter)}`,
    });
  }
  const attributes = store.attributes();

  // console.log('applying local filters', localFilter);
  // Use originalRowsIds if available (populated by server queries), otherwise fall back to
  // all row keys from the rows map. This ensures locally-created rows (via createNew,
  // createNewBulk, etc.) are included in local filtering even though they don't populate
  // originalRowIds.
  const sourceRowIds = store.originalRowsIds().length > 0 ? store.originalRowsIds() : Object.keys(store.rows());
  let recordsOrder = sourceRowIds.filter((rowId) => applyFilters(localFilter, 'allof', attributes, store.row(rowId)));
  if (sort && Object.keys(sort).length > 0) {
    recordsOrder = localSort(store, recordsOrder, sort);
  }
  store.setRowIds(recordsOrder);
  // reset the current record to the top most after applying filters
  const currentRecordId = recordsOrder.length ? recordsOrder[0] : undefined;
  store.setCurrentRowId(currentRecordId);
}

function localSort<T extends object>(store: Store<T>, recordIds: string[], sort: SchemaMember<T, number>): string[] {
  const key = keys(sort)[0] as keyof T;
  if (key) {
    const direction = (sort[key as keyof typeof sort] ?? 0) > 0 ? 1 : -1;
    const records = store.rows();
    recordIds.sort((a, b) => {
      const l = records[a][key];
      const r = records[b][key];
      if (l === r) return 0;
      let compare = 0;
      if (isNull(l)) {
        compare = 1;
      } else if (isNull(r)) {
        compare = -1;
      } else {
        compare = l < r ? -1 : 1;
      }
      return compare * direction;
    });
  }
  return recordIds;
}
