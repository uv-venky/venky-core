export const generateQueryTypes = (attributes) => {
  const attributeTypes = attributes
    .map((attr) => {
      let type = 'string';
      switch (attr.type) {
        case 'Number':
          type = 'number';
          break;
        case 'Boolean':
          type = 'boolean';
          break;
        case 'Date':
          type = 'string'; // ISO date string
          break;
        case 'JSON':
          type = 'any';
          break;
        default:
          type = 'string';
      }
      return `  ${attr.code}: ${type};`;
    })
    .join('\n');
  return `
interface DataSourceAttributes {
${attributeTypes}
}
declare global {
  const query: QueryOptions;
}
`;
};
//# sourceMappingURL=types.js.map
