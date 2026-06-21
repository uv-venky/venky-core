'use server';
import { get_json_schema_filter_type, get_json_schema_type } from './json-schema-utils';
export async function gen_ds_json_query_schema(ds) {
  const defaultAttrCode = ds.attributes.find((a) => a.type === 'Text')?.code ?? 'attrCode';
  const attr_type = ds.attributes.map((a) => `"${a.code}": ${get_json_schema_type(a)}`).join(',\n');
  const schema_type = ds.attributes.map((a) => `"${a.code}": {"type":"number", "default": 1}`).join(',\n');
  const columns = ds.attributes.map((a) => `"${a.code}"`).join(',\n');
  const filter_type = ds.attributes
    .map(
      (a) =>
        `{"title": "${a.code}","type": "object","properties": {"${a.code}": { "$ref": "#/definitions/${get_json_schema_filter_type(a)}" }}, "required": ["${a.code}"], "additionalProperties": false}`,
    )
    .join(',\n');
  const schema = `{
            "$schema": "https://json-schema.org/draft-07/schema#",
            "$id": "https://venky.dev/request.schema.json",
            "title": "Query",
            "type": "object",
            "properties": {
                "aggregate": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "aggregateFunction": {
                                "type": "string",
                                "enum": [
                                    "Avg",
                                    "Count",
                                    "DistinctCount",
                                    "Max",
                                    "Min",
                                    "Sum"
                                ]
                            },
                            "attributeCode": {
                                "$ref": "#/definitions/Columns"
                            },
                            "intoAttributeCode": {
                                "$ref": "#/definitions/Columns"
                            }
                        },
                        "required": [
                            "aggregateFunction",
                            "attributeCode",
                            "intoAttributeCode"
                        ],
                        "additionalProperties": false
                    }
                },
                "data": {
                    "$ref": "#/definitions/DBRow"
                },
                "fetchDistinct": {
                    "type": "boolean"
                },
                "filter": {
                    "title": "${ds.id} Filters",
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Filter"
                    }
                },
                "groupBy": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Columns"
                    }
                },
                "limit": {
                    "type": "number",
                    "default": 20
                },
                "offset": {
                    "type": "number",
                    "default": 0
                },
                "params": {
                    "$ref": "#/definitions/DBRow"
                },
                "projection": {
                    "$ref": "#/definitions/Sort"
                },
                "select": {
                    "title": "Only return these columns",
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Columns"
                    }
                },
                "sort": {
                    "$ref": "#/definitions/Sort"
                },
                "includeRowCount": {
                    "type": "boolean"
                },
                "whereClause": {
                    "type": "string"
                },
                "whereClauseParamList": {
                    "type": "array",
                    "items": {
                        "type": "any"
                    }
                },
                "orderBy": {
                    "type": "string"
                }
            },
            "additionalProperties": false,
            "required": [
                "filter", "limit"
            ],
            "definitions": {
                "DBRow": {
                    "$schema": "http://json-schema.org/draft-07/schema#",
                    "title": "${ds.id} Row",
                    "type": "object",
                    "default": {
                        "_status": "I",
                        "${defaultAttrCode}": "value"
                    },
                    "properties": {
${attr_type},
                        "_status": { "type": "string", "enum": ["I","U","D","V"] }
                    },
                    "additionalProperties": false
                },
                "Sort": {
                    "$schema": "http://json-schema.org/draft-07/schema#",
                    "title": "${ds.id}",
                    "type": "object",
                    "properties": {
${schema_type}
                    },
                    "additionalProperties": false
                },
                "Columns": {
                    "title": "${ds.id} Columns",
                    "type": "string",
                    "enum": [
                        ${columns}
                    ]
                },
                "Filter": {
                    "$schema": "http://json-schema.org/draft-07/schema#",
                    "title": "${ds.id} Filter",
                    "type": "object",
                    "default": {
                        "{attr_code}": {
                            "is": "value"
                        }
                    },
                    "oneOf": [
${filter_type}
                    ]
                },
                "StringFilter": {
                    "$schema": "http://json-schema.org/draft-07/schema#",
                    "title": "StringFilter",
                    "type": "object",
                    "oneOf": [
                        {"title": "is","type": "object","properties": {"is": {"type": "string"}}, "required": ["is"], "additionalProperties": false},
                        {"title": "not","type": "object","properties": {"not": {"type": "string"}}, "required": ["not"], "additionalProperties": false},
                        {"title": "empty","type": "object","properties": {"empty": {"type": "string", "enum": [""]}}, "required": ["empty"], "additionalProperties": false},
                        {"title": "notempty","type": "object","properties": {"notempty": {"type": "string", "enum": [""]}}, "required": ["notempty"], "additionalProperties": false},
                        {"title": "nct","type": "object","properties": {"nct": {"type": "string"}}, "required": ["nct"], "additionalProperties": false},
                        {"title": "like","type": "object","properties": {"like": {"type": "string"}}, "required": ["like"], "additionalProperties": false},
                        {"title": "sw","type": "object","properties": {"sw": {"type": "string"}}, "required": ["sw"], "additionalProperties": false},
                        {"title": "ew","type": "object","properties": {"ew": {"type": "string"}}, "required": ["ew"], "additionalProperties": false},
                        {"title": "iis","type": "object","properties": {"iis": {"type": "string"}}, "required": ["iis"], "additionalProperties": false},
                        {"title": "inot","type": "object","properties": {"inot": {"type": "string"}}, "required": ["inot"], "additionalProperties": false},
                        {"title": "inct","type": "object","properties": {"inct": {"type": "string"}}, "required": ["inct"], "additionalProperties": false},
                        {"title": "ilike","type": "object","properties": {"ilike": {"type": "string"}}, "required": ["ilike"], "additionalProperties": false},
                        {"title": "isw","type": "object","properties": {"isw": {"type": "string"}}, "required": ["isw"], "additionalProperties": false},
                        {"title": "iew","type": "object","properties": {"iew": {"type": "string"}}, "required": ["iew"], "additionalProperties": false},
                        {"title": "hasall","type": "object","properties": {"hasall": {"type": "array", "default": ["one", "two", "three"], "items": {"type": "string"}}}, "required": ["hasall"], "additionalProperties": false},
                        {"title": "hasany","type": "object","properties": {"hasany": {"type": "array", "default": ["one", "two", "three"], "items": {"type": "string"}}}, "required": ["hasany"], "additionalProperties": false},
                        {"title": "notany","type": "object","properties": {"notany": {"type": "array", "default": ["one", "two", "three"], "items": {"type": "string"}}}, "required": ["notany"], "additionalProperties": false},
                        {"title": "in","type": "object","properties": {"in": {"type": "array", "default": ["one", "two", "three"], "items": {"type": "string"}}}, "required": ["in"], "additionalProperties": false},
                        {"title": "nin","type": "object","properties": {"nin": {"type": "array", "default": ["one", "two", "three"], "items": {"type": "string"}}}, "required": ["nin"], "additionalProperties": false},
                        {"title": "ihasall","type": "object","properties": {"ihasall": {"type": "array", "default": ["one", "two", "three"], "items": {"type": "string"}}}, "required": ["ihasall"], "additionalProperties": false},
                        {"title": "ihasany","type": "object","properties": {"ihasany": {"type": "array", "default": ["one", "two", "three"], "items": {"type": "string"}}}, "required": ["ihasany"], "additionalProperties": false},
                        {"title": "inotany","type": "object","properties": {"inotany": {"type": "array", "default": ["one", "two", "three"], "items": {"type": "string"}}}, "required": ["inotany"], "additionalProperties": false},
                        {"title": "iin","type": "object","properties": {"iin": {"type": "array", "default": ["one", "two", "three"], "items": {"type": "string"}}}, "required": ["iin"], "additionalProperties": false},
                        {"title": "inin","type": "object","properties": {"inin": {"type": "array", "default": ["one", "two", "three"], "items": {"type": "string"}}}, "required": ["inin"], "additionalProperties": false}
                    ],
                    "default": {"is": ""}
                },
                "NumberFilter": {
                    "$schema": "http://json-schema.org/draft-07/schema#",
                    "title": "NumberFilter",
                    "type": "object",
                    "oneOf": [
                           {"title": "eq","type": "object","properties": {"eq": {"type": "number"}}, "required": ["eq"], "additionalProperties": false},
                        {"title": "is","type": "object","properties": {"is": {"type": "number"}}, "required": ["is"], "additionalProperties": false},
                        {"title": "ne","type": "object","properties": {"ne": {"type": "number"}}, "required": ["ne"], "additionalProperties": false},
                        {"title": "not","type": "object","properties": {"not": {"type": "number"}}, "required": ["not"], "additionalProperties": false},
                        {"title": "gt","type": "object","properties": {"gt": {"type": "number"}}, "required": ["gt"], "additionalProperties": false},
                        {"title": "gte","type": "object","properties": {"gte": {"type": "number"}}, "required": ["gte"], "additionalProperties": false},
                        {"title": "lt","type": "object","properties": {"lt": {"type": "number"}}, "required": ["lt"], "additionalProperties": false},
                        {"title": "lte","type": "object","properties": {"lte": {"type": "number"}}, "required": ["lte"], "additionalProperties": false},
                        {"title": "null","type": "object","properties": {"null": {"type": "number"}}, "required": ["null"], "additionalProperties": false},
                        {"title": "notnull","type": "object","properties": {"notnull": {"type": "number"}}, "required": ["notnull"], "additionalProperties": false},
                        {"title": "bn","type": "object","properties": {"bn": {"type": "array", "default": [1, 2], "items": {"type": "number"}}}, "required": ["bn"], "additionalProperties": false},
                        {"title": "in","type": "object","properties": {"in": {"type": "array", "default": [1, 2, 3], "items": {"type": "number"}}}, "required": ["in"], "additionalProperties": false},
                        {"title": "nin","type": "object","properties": {"nin": {"type": "array", "default": [1, 2, 3], "items": {"type": "number"}}}, "required": ["nin"], "additionalProperties": false}
                  ]
                },
                "BooleanFilter": {
                    "$schema": "http://json-schema.org/draft-07/schema#",
                    "title": "BooleanFilter",
                    "type": "object",
                    "oneOf": [
                        {"title": "istrue","type": "object","properties": {"istrue": {"type": "boolean"}}, "required": ["istrue"], "additionalProperties": false},
                        {"title": "empty","type": "object","properties": {"empty": {"type": "boolean"}}, "required": ["empty"], "additionalProperties": false},
                        {"title": "notempty","type": "object","properties": {"notempty": {"type": "boolean"}}, "required": ["notempty"], "additionalProperties": false}
                    ]
                },
                "DateFilter": {
                    "$schema": "http://json-schema.org/draft-07/schema#",
                    "title": "DateFilter",
                    "type": "object",
                    "oneOf": [
                        {"title": "on","type": "object","properties": {"on": {"type": "string", "default": "{now}"}}, "required": ["on"], "additionalProperties": false},
                        {"title": "noton","type": "object","properties": {"noton": {"type": "string", "default": "{now}"}}, "required": ["noton"], "additionalProperties": false},
                        {"title": "empty","type": "object","properties": {"empty": {"type": "string", "default": "{now}"}}, "required": ["empty"], "additionalProperties": false},
                        {"title": "notempty","type": "object","properties": {"notempty": {"type": "string", "default": "{now}"}}, "required": ["notempty"], "additionalProperties": false},
                        {"title": "after","type": "object","properties": {"after": {"type": "string", "default": "{now}"}}, "required": ["after"], "additionalProperties": false},
                        {"title": "before","type": "object","properties": {"before": {"type": "string", "default": "{now}"}}, "required": ["before"], "additionalProperties": false},
                        {"title": "onorafter","type": "object","properties": {"onorafter": {"type": "string", "default": "{now}"}}, "required": ["onorafter"], "additionalProperties": false},
                        {"title": "onorbefore","type": "object","properties": {"onorbefore": {"type": "string", "default": "{now}"}}, "required": ["onorbefore"], "additionalProperties": false},
                        {"title": "today","type": "object","properties": {"today": {"type": "string", "default": "{now}"}}, "required": ["today"], "additionalProperties": false},
                        {"title": "yesterday","type": "object","properties": {"yesterday": {"type": "string", "default": "{now}"}}, "required": ["yesterday"], "additionalProperties": false},
                        {"title": "last7days","type": "object","properties": {"last7days": {"type": "string", "default": "{now}"}}, "required": ["last7days"], "additionalProperties": false},
                        {"title": "last14days","type": "object","properties": {"last14days": {"type": "string", "default": "{now}"}}, "required": ["last14days"], "additionalProperties": false},
                        {"title": "last28days","type": "object","properties": {"last28days": {"type": "string", "default": "{now}"}}, "required": ["last28days"], "additionalProperties": false},
                        {"title": "thisweek","type": "object","properties": {"thisweek": {"type": "string", "default": "{now}"}}, "required": ["thisweek"], "additionalProperties": false},
                        {"title": "thismonth","type": "object","properties": {"thismonth": {"type": "string", "default": "{now}"}}, "required": ["thismonth"], "additionalProperties": false},
                        {"title": "thisquarter","type": "object","properties": {"thisquarter": {"type": "string", "default": "{now}"}}, "required": ["thisquarter"], "additionalProperties": false},
                        {"title": "thisyear","type": "object","properties": {"thisyear": {"type": "string", "default": "{now}"}}, "required": ["thisyear"], "additionalProperties": false},
                        {"title": "inthepast","type": "object","properties": {"inthepast": {"type": "string", "default": "{now}"}}, "required": ["inthepast"], "additionalProperties": false},
                        {"title": "inthefuture","type": "object","properties": {"inthefuture": {"type": "string", "default": "{now}"}}, "required": ["inthefuture"], "additionalProperties": false},
                        {"title": "tomorrow","type": "object","properties": {"tomorrow": {"type": "string", "default": "{now}"}}, "required": ["tomorrow"], "additionalProperties": false},
                        {"title": "next7days","type": "object","properties": {"next7days": {"type": "string", "default": "{now}"}}, "required": ["next7days"], "additionalProperties": false},
                        {"title": "next14days","type": "object","properties": {"next14days": {"type": "string", "default": "{now}"}}, "required": ["next14days"], "additionalProperties": false},
                        {"title": "next28days","type": "object","properties": {"next28days": {"type": "string", "default": "{now}"}}, "required": ["next28days"], "additionalProperties": false},
                        {"title": "bn","type": "object","properties": {"bn": {"type": "array", "default": ["{now}", "{now}"], "items": {"type": "string", "default": "{now}"}}}, "required": ["bn"], "additionalProperties": false}
                    ]
                },
                "FilterNotSupported": {
                    "$schema": "http://json-schema.org/draft-07/schema#",
                    "title": "FilterNotSupported",
                    "type": "object",
                    "properties": [
                        {"FilterNotSupported": {"type": "null"}}
                    ],
                    "additionalProperties": false
                }
            }
        }`;
  return schema;
}
//# sourceMappingURL=gen-json-query-schema.js.map
