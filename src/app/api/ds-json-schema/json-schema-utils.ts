import type { Attribute, ClientAttribute } from '@/lib/core/common/ds/types/Attribute';

export function get_json_schema_type<T extends object>(attr: Attribute<T>): string {
  switch (attr.type) {
    case 'Text':
      return `{"type": "string", "default": "value" }`;
    case 'Date':
      return `{"type": "string", "default": "${new Date().toISOString()}" }`;
    case 'Number':
      return `{"type": "number", "default": 123 }`;
    case 'Boolean':
      return `{"type": "boolean", "default": true }`;
    case 'JSON':
      return `{"type": "object" }`;
    case 'YN':
      return `{"type": "string", "default": "Y", "enum": ["Y", "N"] }`;
    case 'TF':
      return `{"type": "string", "default": "T", "enum": ["T", "F"] }`;
    case 'TextArray':
      return `{"type": "array", "default": ["one", "two", "three"], "items": { "type": "string" } }`;
    case 'Polygon':
      return `{"type": "array", "items": {"type": "array", "items": {"type": "number"}, "minItems": 2, "maxItems": 2}}`;
    case 'Vector':
      return `{"type": "array", "items": { "type": "number" } }`;
    default:
      return `{"type": "any" }`;
  }
}

export function get_json_schema_filter_type<T extends object>(attr: Attribute<T>): string {
  switch (attr.type) {
    case 'Text':
      return `StringFilter`;
    case 'Date':
      return `DateFilter`;
    case 'Number':
      return `NumberFilter`;
    case 'Boolean':
      return `BooleanFilter`;
    case 'YN':
      return `StringFilter`;
    case 'TF':
      return `StringFilter`;
    case 'Polygon':
      return `FilterNotSupported`; // Polygon filtering not yet implemented
    case 'Vector':
      return `FilterNotSupported`;
    default:
      return `FilterNotSupported`;
  }
}

export function get_json_default_value<T extends object>(attr: ClientAttribute<T>): any {
  switch (attr.type) {
    case 'Text':
      return 'api playground value';
    case 'Date':
      return new Date().toISOString();
    case 'Number':
      return 12321;
    case 'Boolean':
      return true;
    case 'JSON':
      return {};
    case 'YN':
      return 'Y';
    case 'TF':
      return 'T';
    case 'TextArray':
      return ['one', 'two', 'three'];
    case 'Vector':
      return [0.1, 0.2];
    default:
      return null;
  }
}
