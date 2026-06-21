export const getTextValue = (item, attr) => String(item[attr]);
export const getNumberValue = (item, attr) => {
    if (attr === 'price' || attr === 'qty') {
        return item[attr];
    }
    else {
        return 0;
    }
};
export const TEST_DATA = [
    { category: 'A', item: '1', qty: 1, price: 1, region: 'US' },
    { category: 'A', item: '2', qty: 1, price: 2, region: 'US' },
    { category: 'A', item: '3', qty: 1, price: 3, region: 'US' },
    { category: 'A', item: '4', qty: 1, price: 4, region: 'US' },
    { category: 'B', item: '5', qty: 1, price: 5, region: 'US' },
    { category: 'B', item: '6', qty: 1, price: 6, region: 'US' },
    { category: 'B', item: '7', qty: 1, price: 7, region: 'US' },
    { category: 'B', item: '8', qty: 1, price: 8, region: 'US' },
    { category: 'A', item: '1', qty: 1, price: 1, region: 'UK' },
    { category: 'A', item: '2', qty: 1, price: 2, region: 'UK' },
    { category: 'A', item: '3', qty: 1, price: 3, region: 'UK' },
    { category: 'A', item: '4', qty: 1, price: 4, region: 'UK' },
    { category: 'B', item: '5', qty: 1, price: 5, region: 'UK' },
    { category: 'B', item: '6', qty: 1, price: 6, region: 'UK' },
    { category: 'B', item: '7', qty: 1, price: 7, region: 'UK' },
    { category: 'B', item: '8', qty: 1, price: 8, region: 'UK' },
];
export const columns = [
    {
        key: 'category',
        label: 'Category',
        dataType: 'Text',
    },
    {
        key: 'region',
        label: 'Region',
        dataType: 'Text',
    },
    {
        key: 'price',
        label: 'Price',
        dataType: 'Number',
    },
    {
        key: 'qty',
        label: 'Qty',
        dataType: 'Number',
    },
    {
        key: 'item',
        label: 'Item',
        dataType: 'Text',
    },
];
//# sourceMappingURL=test-data.js.map