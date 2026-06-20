/* Copyright (c) 2024-present Venky Corp. */

/**
 * Serializable projection of `Column<T>` for the natural-language search parser.
 *
 * `Column<T>` carries functions (`getOptionLabel`/`getOptionValue`) and cannot
 * be POSTed to a server action as-is. `columnsToSchema` flattens each column
 * into a plain, JSON-safe descriptor that the LLM prompt and the post-LLM
 * validator can both consume. Operator metadata is intentionally NOT included
 * here — it is derived server-side from `operators-meta` per column type to keep
 * the request payload small.
 */

import type { Column } from '@/components/core/smart-search/types';
import type { ColumnType } from '@/components/core/common/types';

export interface SmartSearchColumnOption {
  label: string;
  value: string;
}

export interface SmartSearchColumnSchema {
  key: string;
  label: string;
  type: ColumnType;
  defaultOperator?: string;
  /** Populated for `Select`/`TextArray` columns that carry inline options. */
  options?: SmartSearchColumnOption[];
  /** Populated for `Select` lookup columns (options resolved elsewhere). */
  lookupType?: string;
}

/**
 * A column whose options are provided inline via `options` + accessor functions
 * (covers both `SelectOptionsColumn` and `TextArrayColumn`).
 */
interface OptionsBearingColumn {
  options: readonly object[];
  getOptionLabel: (option: object) => string;
  getOptionValue: (option: object) => string;
}

function hasInlineOptions(column: Column<any>): column is Column<any> & OptionsBearingColumn {
  return (
    'options' in column &&
    Array.isArray((column as { options?: unknown }).options) &&
    typeof (column as { getOptionLabel?: unknown }).getOptionLabel === 'function' &&
    typeof (column as { getOptionValue?: unknown }).getOptionValue === 'function'
  );
}

function hasLookupType(column: Column<any>): column is Column<any> & { lookupType: string } {
  return 'lookupType' in column && typeof (column as { lookupType?: unknown }).lookupType === 'string';
}

export function columnsToSchema<T extends object>(columns: Column<T>[]): SmartSearchColumnSchema[] {
  return columns.map((column) => {
    const schema: SmartSearchColumnSchema = {
      key: column.key,
      label: column.label,
      type: column.type,
      defaultOperator: column.defaultOperator,
    };

    if (hasInlineOptions(column)) {
      schema.options = column.options.map((option) => ({
        label: column.getOptionLabel(option),
        value: column.getOptionValue(option),
      }));
    } else if (hasLookupType(column)) {
      schema.lookupType = column.lookupType;
    }

    return schema;
  });
}
