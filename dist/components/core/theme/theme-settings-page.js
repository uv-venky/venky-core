'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/ui/accordion';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Moon, Sun } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import TailwindColorPicker from '../../../components/core/theme/tailwind-color-picker';
// Define the color categories and their variables
const colorCategories = {
    base: [
        { name: 'Background', variable: '--background' },
        { name: 'Foreground', variable: '--foreground' },
    ],
    component: [
        { name: 'Card', variable: '--card' },
        { name: 'Card Foreground', variable: '--card-foreground' },
        { name: 'Popover', variable: '--popover' },
        { name: 'Popover Foreground', variable: '--popover-foreground' },
        { name: 'Primary', variable: '--primary' },
        { name: 'Primary Hover', variable: '--primary-hover' },
        { name: 'Primary Foreground', variable: '--primary-foreground' },
        { name: 'Secondary', variable: '--secondary' },
        { name: 'Secondary Foreground', variable: '--secondary-foreground' },
    ],
    state: [
        { name: 'Muted', variable: '--muted' },
        { name: 'Muted Foreground', variable: '--muted-foreground' },
        { name: 'Accent', variable: '--accent' },
        { name: 'Accent Foreground', variable: '--accent-foreground' },
        { name: 'Destructive', variable: '--destructive' },
        { name: 'Destructive Foreground', variable: '--destructive-foreground' },
    ],
    ui: [
        { name: 'Table Header', variable: '--table-header' },
        { name: 'Table Header Foreground', variable: '--table-header-foreground' },
        { name: 'Border', variable: '--border' },
        { name: 'Input', variable: '--input' },
        { name: 'Ring', variable: '--ring' },
    ],
    chart: [
        { name: 'Chart 1', variable: '--chart-1' },
        { name: 'Chart 2', variable: '--chart-2' },
        { name: 'Chart 3', variable: '--chart-3' },
        { name: 'Chart 4', variable: '--chart-4' },
        { name: 'Chart 5', variable: '--chart-5' },
    ],
    sidebar: [
        { name: 'Sidebar', variable: '--sidebar' },
        { name: 'Sidebar Foreground', variable: '--sidebar-foreground' },
        { name: 'Sidebar Primary', variable: '--sidebar-primary' },
        {
            name: 'Sidebar Primary Foreground',
            variable: '--sidebar-primary-foreground',
        },
        { name: 'Sidebar Accent', variable: '--sidebar-accent' },
        {
            name: 'Sidebar Accent Foreground',
            variable: '--sidebar-accent-foreground',
        },
        { name: 'Sidebar Border', variable: '--sidebar-border' },
        { name: 'Sidebar Ring', variable: '--sidebar-ring' },
    ],
};
// Define other theme variables
const otherVariables = {
    radius: [{ name: 'Border Radius', variable: '--radius' }],
};
export default function ThemeSettingsPage() {
    const [themeValues, setThemeValues] = useState({
        light: {},
        dark: {},
    });
    const [activeTab, setActiveTab] = useState('light');
    // Initialize theme values from CSS variables
    useEffect(() => {
        const root = document.documentElement;
        const lightValues = {};
        const darkValues = {};
        // Create a temporary dark mode element to get dark mode values
        const tempDarkElement = document.createElement('div');
        tempDarkElement.classList.add('dark');
        document.body.appendChild(tempDarkElement);
        // Get all variables
        const allVariables = [...Object.values(colorCategories).flat(), ...Object.values(otherVariables).flat()];
        // Get light mode values
        allVariables.forEach(({ variable }) => {
            lightValues[variable] = getComputedStyle(root).getPropertyValue(variable).trim();
        });
        // Get dark mode values
        allVariables.forEach(({ variable }) => {
            const style = getComputedStyle(tempDarkElement);
            darkValues[variable] = style.getPropertyValue(variable).trim();
        });
        // Remove temporary element
        document.body.removeChild(tempDarkElement);
        setThemeValues({ light: lightValues, dark: darkValues });
    }, []);
    // Handle color input change
    const handleColorChange = useCallback((variable, value) => {
        setThemeValues((prev) => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [variable]: value,
            },
        }));
    }, [activeTab]);
    // Save theme (in a real app, this would save to localStorage or a database)
    // const saveTheme = () => {
    //   // Apply light theme variables to :root
    //   Object.entries(themeValues.light).forEach(([variable, value]) => {
    //     document.documentElement.style.setProperty(variable, value);
    //   });
    //   // Create or update the dark theme CSS
    //   let styleElement = document.getElementById('dark-theme-styles');
    //   if (!styleElement) {
    //     styleElement = document.createElement('style');
    //     styleElement.id = 'dark-theme-styles';
    //     document.head.appendChild(styleElement);
    //   }
    //   // Generate dark theme CSS
    //   const darkThemeCSS = `.dark {
    //     ${Object.entries(themeValues.dark)
    //       .map(([variable, value]) => `${variable}: ${value};`)
    //       .join('\n  ')}
    //   }`;
    //   styleElement.textContent = darkThemeCSS;
    //   // Show success message
    //   showSuccess('Theme saved successfully!');
    // };
    return (_jsx("div", { className: "flex h-full overflow-hidden p-4", children: _jsxs(Tabs, { value: activeTab, onValueChange: (value) => setActiveTab(value), className: "flex h-full flex-1 flex-col overflow-hidden", children: [_jsxs(TabsList, { className: "mb-6 grid w-full shrink-0 grid-cols-2", children: [_jsxs(TabsTrigger, { value: "light", className: "flex items-center gap-1", children: [_jsx(Sun, { className: "h-4 w-4" }), "Light Mode"] }), _jsxs(TabsTrigger, { value: "dark", className: "flex items-center gap-1", children: [_jsx(Moon, { className: "h-4 w-4" }), "Dark Mode"] })] }), ['light', 'dark'].map((mode) => (_jsx(TabsContent, { value: mode, className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 space-y-6 overflow-auto", children: _jsxs(Accordion, { type: "multiple", defaultValue: ['base'], children: [_jsxs(AccordionItem, { value: "base", children: [_jsx(AccordionTrigger, { children: "Base Colors" }), _jsx(AccordionContent, { children: _jsx("div", { className: "grid gap-4", children: colorCategories.base.map((item) => (_jsx(ColorInput, { variable: item.variable, name: item.name, mode: activeTab, value: themeValues[activeTab][item.variable], handleColorChange: handleColorChange }, item.variable))) }) })] }), _jsxs(AccordionItem, { value: "component", children: [_jsx(AccordionTrigger, { children: "Component Colors" }), _jsx(AccordionContent, { children: _jsx("div", { className: "grid gap-4", children: colorCategories.component.map((item) => (_jsx(ColorInput, { variable: item.variable, name: item.name, mode: activeTab, value: themeValues[activeTab][item.variable], handleColorChange: handleColorChange }, item.variable))) }) })] }), _jsxs(AccordionItem, { value: "state", children: [_jsx(AccordionTrigger, { children: "State Colors" }), _jsx(AccordionContent, { children: _jsx("div", { className: "grid gap-4", children: colorCategories.state.map((item) => (_jsx(ColorInput, { variable: item.variable, name: item.name, mode: activeTab, value: themeValues[activeTab][item.variable], handleColorChange: handleColorChange }, item.variable))) }) })] }), _jsxs(AccordionItem, { value: "ui", children: [_jsx(AccordionTrigger, { children: "UI Element Colors" }), _jsx(AccordionContent, { children: _jsx("div", { className: "grid gap-4", children: colorCategories.ui.map((item) => (_jsx(ColorInput, { variable: item.variable, name: item.name, mode: activeTab, value: themeValues[activeTab][item.variable], handleColorChange: handleColorChange }, item.variable))) }) })] }), _jsxs(AccordionItem, { value: "chart", children: [_jsx(AccordionTrigger, { children: "Chart Colors" }), _jsx(AccordionContent, { children: _jsx("div", { className: "grid gap-4", children: colorCategories.chart.map((item) => (_jsx(ColorInput, { variable: item.variable, name: item.name, mode: activeTab, value: themeValues[activeTab][item.variable], handleColorChange: handleColorChange }, item.variable))) }) })] }), _jsxs(AccordionItem, { value: "sidebar", children: [_jsx(AccordionTrigger, { children: "Sidebar Colors" }), _jsx(AccordionContent, { children: _jsx("div", { className: "grid gap-4", children: colorCategories.sidebar.map((item) => (_jsx(ColorInput, { variable: item.variable, name: item.name, mode: activeTab, value: themeValues[activeTab][item.variable], handleColorChange: handleColorChange }, item.variable))) }) })] }), _jsxs(AccordionItem, { value: "other", children: [_jsx(AccordionTrigger, { children: "Other Variables" }), _jsx(AccordionContent, { children: _jsx("div", { className: "grid gap-4", children: otherVariables.radius.map((item) => (_jsx(ColorInput, { variable: item.variable, name: item.name, mode: activeTab, value: themeValues[activeTab][item.variable], handleColorChange: handleColorChange }, item.variable))) }) })] })] }) }, mode)))] }) })
    // </PageLayout>
    );
}
function ColorInput({ variable, name, mode, value, handleColorChange, }) {
    return (_jsxs("div", { className: "grid grid-cols-[1fr_auto] items-center gap-2", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: `${mode}-${variable}`, className: "font-medium text-sm", children: name }), _jsx("div", { className: "text-muted-foreground text-xs", children: variable })] }), _jsx("div", { className: "w-40", children: _jsx(TailwindColorPicker, { value: value, onChange: (newValue) => handleColorChange(variable, newValue), cssVariable: variable }) })] }));
}
//# sourceMappingURL=theme-settings-page.js.map