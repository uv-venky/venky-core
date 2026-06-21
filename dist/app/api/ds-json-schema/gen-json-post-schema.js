'use server';
import { get_json_schema_type } from './json-schema-utils';
export async function gen_ds_json_post_schema(ds) {
  const defaultAttrCode = ds.attributes.find((a) => a.type === 'Text')?.code ?? 'attrCode';
  const attr_type = ds.attributes
    .map((a) => {
      const schemaTypeStr = get_json_schema_type(a);
      try {
        const schemaType = JSON.parse(schemaTypeStr);
        // Allow null for all attribute types
        if (schemaType.type) {
          if (typeof schemaType.type === 'string') {
            // Convert single type to array with null
            if (schemaType.type !== 'any') {
              schemaType.type = [schemaType.type, 'null'];
            }
            // For 'any' type, we don't need to add null as it already accepts anything
          } else if (Array.isArray(schemaType.type)) {
            // Already an array, add null if not present
            if (!schemaType.type.includes('null')) {
              schemaType.type.push('null');
            }
          }
        }
        return `"${a.code}": ${JSON.stringify(schemaType)}`;
      } catch {
        // If parsing fails, return original string
        return `"${a.code}": ${schemaTypeStr}`;
      }
    })
    .join(',\n');
  const schema = `{
            "$schema": "https://json-schema.org/draft-07/schema#",
            "$id": "https://venky.dev/request.schema.json",
            "title": "Post",
            "description": "VENKY's API post schema",
            "type": "array",
            "items": {
                "$ref": "#/definitions/DBRow"
            },
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
                        "_ca": { "type": "string" },
                        "_changedAttributes": { "type": "object" },
                        "_cid": { "type": "string" },
                        "_id": { "type": "string" },
                        "_orig": { "type": "object" },
                        "_newKeys": { "type": "array", "items": { "type": "string" } },
                        "_ov": { "type": "any" },
                        "_chunkIndex": { "type": "number" },
                        "_$select": { "type": "array", "items": { "type": "string" } },
                        "_status": { "type": "string", "enum": ["I","U","D"] }
                    },
                    "additionalProperties": false
                },
                "Transaction": {
                    "type": "object"
                }
            }
        }`;
  return schema;
}
//# sourceMappingURL=gen-json-post-schema.js.map
