import type { AllOperators, SingleFilter, StringKeyof } from '@/lib/core/common/ds/types/filter';
import type { AttributeType } from '@/lib/core/common/ds/types/AttributeType';
import type { Attribute } from '@/lib/core/common/ds/types/Attribute';
import type { DataSource } from '@/lib/core/common/ds/types/DataSource';
import { keys } from '@/lib/core/common/isEmpty';
import { UserError } from '@/lib/core/common/error';

export function isNumberType(dataType: AttributeType): dataType is 'Number' {
  switch (dataType) {
    case 'Number': {
      return true;
    }
    default:
      return false;
  }
}

export function isStringType(dataType: AttributeType): dataType is 'Text' | 'TextArray' {
  switch (dataType) {
    case 'Text':
    case 'TextArray':
      return true;
    default:
      return false;
  }
}

export function isDateType(dataType: AttributeType): dataType is 'Date' {
  switch (dataType) {
    case 'Date': {
      return true;
    }
    default:
      return false;
  }
}

export function isJSONType(dataType: AttributeType): dataType is 'JSON' {
  switch (dataType) {
    case 'JSON': {
      return true;
    }
    default:
      return false;
  }
}

export function isBooleanType(dataType: AttributeType): dataType is 'Boolean' {
  switch (dataType) {
    case 'Boolean': {
      return true;
    }
    default:
      return false;
  }
}

export function isYNType(dataType: AttributeType): dataType is 'YN' {
  switch (dataType) {
    case 'YN': {
      return true;
    }
    default:
      return false;
  }
}

export function isTFType(dataType: AttributeType): dataType is 'TF' {
  switch (dataType) {
    case 'TF': {
      return true;
    }
    default:
      return false;
  }
}

export function isPolygonType(dataType: AttributeType): dataType is 'Polygon' {
  switch (dataType) {
    case 'Polygon': {
      return true;
    }
    default:
      return false;
  }
}

export type UnwrappedFilter<
  T extends object,
  Op extends AllOperators,
  V extends string | number | string[] | number[] | boolean,
> = {
  key: StringKeyof<T>;
  op: Op;
  value: V;
  attribute: Attribute<T>;
  ignoreCase?: boolean;
  /** When set, filter is for a key inside a JSON attribute (e.g. "attributes.key"). */
  jsonKey?: string;
};

const SAFE_JSON_KEY_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function unwrapFilter<
  T extends object,
  Op extends AllOperators,
  V extends string | number | string[] | number[] | boolean,
>(dataSource: DataSource<T>, filter: SingleFilter<T>): UnwrappedFilter<T, Op, V> {
  const key = keys(filter)[0];
  let attribute: Attribute<T> | undefined;
  let jsonKey: string | undefined;

  const dotIndex = (key as string).indexOf('.');
  if (dotIndex !== -1) {
    const baseAttr = (key as string).slice(0, dotIndex);
    const keyPart = (key as string).slice(dotIndex + 1);
    if (!keyPart) {
      throw new UserError(`Invalid filter key: "${key}". JSON key cannot be empty.`);
    }
    if (!SAFE_JSON_KEY_PATTERN.test(keyPart)) {
      throw new UserError(
        `Invalid filter key: "${key}". JSON key must be a simple identifier (letters, numbers, underscore).`,
      );
    }
    attribute = dataSource.attributes.find((a) => a.code === baseAttr) as Attribute<T> | undefined;
    if (attribute == null) {
      throw new UserError(`Attribute not found for key: ${baseAttr}`);
    }
    if (attribute.type !== 'JSON') {
      throw new UserError(
        `Filter by key "${key}" is only supported for JSON attributes. "${baseAttr}" is not a JSON attribute.`,
      );
    }
    jsonKey = keyPart;
  } else {
    attribute = dataSource.attributes.find((a) => a.code === key) as Attribute<T> | undefined;
    if (attribute == null) {
      throw new UserError(
        `Developer Error: Invalid filter. Attribute not found for key: ${key} Filter: ${JSON.stringify(filter)}, DataSource: ${dataSource.id}`,
      );
    }
  }

  const opValue = filter[key];
  if (opValue == null) {
    throw new UserError('Developer Error: Invalid filter. Missing operator and value!');
  }
  // @ts-expect-error ignoreCase is optional
  const { ignoreCase, ...rest } = opValue;
  const op = keys(rest)[0] as unknown as Op;
  if (op == null) {
    throw new UserError(
      `Developer Error: Invalid filter. Missing operator! Filter: ${JSON.stringify(filter)}, DataSource: ${dataSource.id}`,
    );
  }
  // @ts-expect-error op is a valid key
  const value = rest[op];
  return { key, op, value, attribute, ignoreCase, jsonKey };
}
