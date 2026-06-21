/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useState } from 'react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Calendar, PieChartIcon } from 'lucide-react';
const CHANGE_TYPE_COLORS = {
    added: '#10b981',
    removed: '#ef4444',
    modified: '#3b82f6',
    activated: '#22c55e',
    deactivated: '#f59e0b',
};
const CHANGE_TYPE_LABELS = {
    added: 'Added',
    removed: 'Removed',
    modified: 'Modified',
    activated: 'Activated',
    deactivated: 'Deactivated',
};
export default function AuditCharts({ stats }) {
    const [chartType, setChartType] = useState('changeType');
    // Prepare data for change type chart
    const getChangeTypeData = () => {
        return Object.entries(stats.changesByType)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({
            name: CHANGE_TYPE_LABELS[name],
            value,
            color: CHANGE_TYPE_COLORS[name],
        }));
    };
    // Prepare data for breakdown chart (percentage-based)
    const getBreakdownData = () => {
        const total = stats.total || 1; // Avoid division by zero
        return Object.entries(stats.changesByType)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({
            name: CHANGE_TYPE_LABELS[name],
            value,
            percentage: Math.round((value / total) * 100),
            color: CHANGE_TYPE_COLORS[name],
        }))
            .sort((a, b) => b.value - a.value);
    };
    const changeTypeData = getChangeTypeData();
    const breakdownData = getBreakdownData();
    // Custom pie tooltip
    const PieTooltip = ({ active, payload }) => {
        if (!active || !payload?.length)
            return null;
        const percentage = stats.total > 0 ? Math.round((payload[0].value / stats.total) * 100) : 0;
        return (_jsxs("div", { className: "rounded-lg border border-border/50 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm", children: [_jsx("p", { className: "font-medium text-foreground text-sm", children: payload[0].name }), _jsxs("p", { className: "text-muted-foreground text-xs", children: [payload[0].value, " changes (", percentage, "%)"] })] }));
    };
    // Custom tooltip for bar charts
    const BarTooltip = ({ active, payload, label, }) => {
        if (!active || !payload?.length)
            return null;
        return (_jsxs("div", { className: "rounded-lg border border-border/50 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm", children: [_jsx("p", { className: "font-medium text-foreground text-sm", children: label }), _jsxs("p", { className: "text-muted-foreground text-xs", children: [payload[0].value, " changes (", payload[0].payload.percentage, "%)"] })] }));
    };
    // Custom legend
    const CustomLegend = ({ data }) => (_jsx("div", { className: "mt-4 flex flex-wrap justify-center gap-4", children: data.map((entry) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "size-3 rounded-full", style: { backgroundColor: entry.color } }), _jsx("span", { className: "text-muted-foreground text-xs", children: entry.name }), _jsx("span", { className: "font-medium font-mono text-xs", children: entry.value })] }, entry.name))) }));
    if (stats.total === 0) {
        return (_jsx("div", { className: "flex h-[300px] items-center justify-center text-muted-foreground", children: _jsx("p", { children: "No audit data available to display charts" }) }));
    }
    return (_jsx("div", { className: "min-h-[400px]", children: _jsxs(Tabs, { value: chartType, onValueChange: (value) => setChartType(value), className: "flex h-full flex-col", children: [_jsxs(TabsList, { className: "mb-6 shrink-0 bg-background/50", children: [_jsxs(TabsTrigger, { value: "changeType", className: "gap-2", children: [_jsx(PieChartIcon, { className: "size-4" }), "Change Types"] }), _jsxs(TabsTrigger, { value: "breakdown", className: "gap-2", children: [_jsx(Calendar, { className: "size-4" }), "Breakdown"] })] }), _jsx(TabsContent, { value: "changeType", className: "h-[350px]", children: _jsxs("div", { className: "flex h-full flex-col", children: [_jsx(ResponsiveContainer, { width: "100%", height: 280, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: changeTypeData, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 100, paddingAngle: 4, dataKey: "value", nameKey: "name", strokeWidth: 0, animationDuration: 750, children: changeTypeData.map((entry) => (_jsx(Cell, { fill: entry.color }, `cell-${entry.name}`))) }), _jsx(Tooltip, { content: _jsx(PieTooltip, {}) })] }) }), _jsx(CustomLegend, { data: changeTypeData })] }) }), _jsx(TabsContent, { value: "breakdown", className: "h-[350px]", children: _jsxs("div", { className: "flex h-full flex-col", children: [_jsx(ResponsiveContainer, { width: "100%", height: 280, children: _jsxs(BarChart, { data: breakdownData, layout: "vertical", margin: { top: 10, right: 30, left: 80, bottom: 0 }, children: [_jsx(XAxis, { type: "number", axisLine: false, tickLine: false, tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 } }), _jsx(YAxis, { type: "category", dataKey: "name", axisLine: false, tickLine: false, tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 }, width: 75 }), _jsx(Tooltip, { content: _jsx(BarTooltip, {}) }), _jsx(Bar, { dataKey: "value", radius: [0, 6, 6, 0], maxBarSize: 28, animationDuration: 750, children: breakdownData.map((entry) => (_jsx(Cell, { fill: entry.color }, `cell-${entry.name}`))) })] }) }), _jsx(CustomLegend, { data: breakdownData })] }) })] }) }));
}
//# sourceMappingURL=audit-charts.js.map