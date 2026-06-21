export const WHOAttributes = [
    'createdAt',
    'createdBy',
    'creationDate',
    'lastUpdateDate',
    'lastUpdatedBy',
    'updatedAt',
    'updatedBy',
];
export function isWhoAttribute(attr) {
    return WHOAttributes.includes(attr.code);
}
//# sourceMappingURL=Attribute.js.map