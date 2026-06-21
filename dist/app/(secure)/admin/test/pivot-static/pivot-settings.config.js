/* Copyright (c) 2024-present VENKY Corp. */
export const PIVOT_SETTINGS = {
    aggregatorName: 'Sum',
    columnWidths: {
        region: 120,
        category: 120,
    },
    // valueAggregators: {
    //   quantity: 'Sum',
    //   revenue: 'Sum',
    //   units: 'Count',
    //   rating: 'Average',
    //   sales: 'Sum',
    //   reviews: 'Sum',
    //   recordCount: 'Count',
    // },
    rows: ['region', 'category'],
    // cols: ['channel', 'year', 'date'],
    cols: ['year'],
    // values: ['quantity', 'revenue', 'units', 'rating', 'sales', 'reviews', 'recordCount'],
    values: ['quantity', 'revenue'],
    density: 'compact',
    // showRowTotals: false,
    // showColumnTotals: true,
    showGrandTotal: true,
    flattenLayout: false,
    valuesPosition: 'columns',
    columnsBeforeValues: false,
    calculatedColumns: [
        {
            id: 'avg-quantity',
            name: 'Avg Quantity',
            formula: {
                type: 'aggregation',
                numerator: {
                    operation: 'sum',
                    column: 'quantity',
                },
                denominator: {
                    operation: 'count',
                    column: 'quantity',
                },
                mathOperator: '/',
            },
        },
    ],
    //   {
    //     id: 'avg-rating',
    //     name: 'Avg Rating',
    //     formula: {
    //       type: 'aggregation',
    //       numerator: {
    //         operation: 'sum',
    //         column: 'rating',
    //       },
    //       denominator: {
    //         operation: 'sum',
    //         column: 'reviews',
    //       },
    //       mathOperator: '/',
    //     },
    //   },
    //   {
    //     id: 'avg-sales',
    //     name: 'Avg Sales',
    //     formula: {
    //       type: 'aggregation',
    //       numerator: {
    //         operation: 'sum',
    //         column: 'sales',
    //       },
    //       denominator: {
    //         operation: 'sum',
    //         column: 'quantity',
    //       },
    //       mathOperator: '/',
    //     },
    //   },
    // ],
};
//# sourceMappingURL=pivot-settings.config.js.map