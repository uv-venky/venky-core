'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '../../../components/ui/chart';
export function MemoryChart({ heapUsed, heapTotal, systemUsed, systemTotal, heapUnit, systemUnit }) {
    // Normalize units if they're different
    let normalizedHeapUsed = heapUsed;
    let normalizedHeapTotal = heapTotal;
    let normalizedSystemUsed = systemUsed;
    let normalizedSystemTotal = systemTotal;
    let unit = heapUnit;
    // Convert MB to GB if needed for comparison
    if (heapUnit === 'MB' && systemUnit === 'GB') {
        normalizedHeapUsed = heapUsed / 1024;
        normalizedHeapTotal = heapTotal / 1024;
        unit = 'GB';
    }
    else if (heapUnit === 'GB' && systemUnit === 'MB') {
        normalizedSystemUsed = systemUsed / 1024;
        normalizedSystemTotal = systemTotal / 1024;
        unit = 'GB';
    }
    const data = [
        {
            name: 'Heap Memory',
            used: normalizedHeapUsed,
            free: normalizedHeapTotal - normalizedHeapUsed,
            total: normalizedHeapTotal,
        },
        {
            name: 'System Memory',
            used: normalizedSystemUsed,
            free: normalizedSystemTotal - normalizedSystemUsed,
            total: normalizedSystemTotal,
        },
    ];
    return (_jsx(ChartContainer, { config: {
            used: {
                label: 'Used',
                color: 'hsl(var(--chart-1))',
            },
            free: {
                label: 'Free',
                color: 'hsl(var(--chart-2))',
            },
        }, className: "h-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: data, layout: "vertical", stackOffset: "expand", margin: {
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 10,
                }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false }), _jsx(XAxis, { type: "number", tickFormatter: (value) => `${value.toFixed(1)} ${unit}` }), _jsx(YAxis, { type: "category", dataKey: "name" }), _jsx(Tooltip, { content: _jsx(ChartTooltipContent, { formatter: (value) => `${Number(value).toFixed(2)} ${unit}` }) }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "used", stackId: "a", fill: "var(--color-amber-400)", name: `Used (${unit})` }), _jsx(Bar, { dataKey: "free", stackId: "a", fill: "var(--color-green-400)", name: `Free (${unit})` })] }) }) }));
}
//# sourceMappingURL=memory-chart.js.map