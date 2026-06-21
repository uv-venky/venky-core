'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { useId } from 'react';
import { ThemeSettings } from './theme-settings';
import { useClientSessionSnapshot, userSessionState } from '../../../../components/core/hooks';
import { showSuccess } from '../../../../components/core/common';
import { ComboboxInput } from '../../../../components/core/page';
export function PreferencesForm() {
    const dateFormatId = useId();
    const timeFormatId = useId();
    const locationId = useId();
    const { settings } = useClientSessionSnapshot();
    return (_jsxs(_Fragment, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Preferences" }), _jsx(CardDescription, { children: "Customize your date, time, and display preferences." })] }), _jsxs(CardContent, { className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 space-y-6 overflow-auto", children: [_jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: dateFormatId, children: "Date Format" }), _jsxs(Select, { value: settings.dateFormat ?? 'MM/DD/YYYY', onValueChange: (value) => {
                                            userSessionState.session.settings.dateFormat = value;
                                        }, children: [_jsx(SelectTrigger, { id: dateFormatId, children: _jsx(SelectValue, { placeholder: "Select date format" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "MM/DD/YYYY", children: "MM/DD/YYYY" }), _jsx(SelectItem, { value: "DD/MM/YYYY", children: "DD/MM/YYYY" }), _jsx(SelectItem, { value: "YYYY-MM-DD", children: "YYYY-MM-DD" }), _jsx(SelectItem, { value: "MMM D, YYYY", children: "MMM D, YYYY" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: timeFormatId, children: "Time Format" }), _jsxs(Select, { value: settings?.timeFormat ?? '12h', onValueChange: (value) => {
                                            userSessionState.session.settings.timeFormat = value;
                                        }, children: [_jsx(SelectTrigger, { id: timeFormatId, children: _jsx(SelectValue, { placeholder: "Select time format" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "12h", children: "12-hour (1:30 PM)" }), _jsx(SelectItem, { value: "24h", children: "24-hour (13:30)" })] })] })] }), _jsx(ComboboxInput, { label: "Timezone", value: settings?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone, options: Intl.supportedValuesOf('timeZone').map((timezone) => ({
                                    label: timezone,
                                    value: timezone,
                                })), getLabel: (timezone) => timezone.label, getValue: (timezone) => timezone.value, onSelect: (value) => {
                                    userSessionState.session.settings.timezone = value;
                                }, labelOnTop: true, required: true }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: locationId, children: "Sonnar Message Location" }), _jsxs(Select, { value: settings?.notificationLocation ?? 'bottom-right', onValueChange: (value) => {
                                            userSessionState.session.settings.notificationLocation = value;
                                            showSuccess('Location updated');
                                        }, children: [_jsx(SelectTrigger, { id: locationId, children: _jsx(SelectValue, { placeholder: "Select location" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "top-left", children: "Top Left" }), _jsx(SelectItem, { value: "top-right", children: "Top Right" }), _jsx(SelectItem, { value: "bottom-left", children: "Bottom Left" }), _jsx(SelectItem, { value: "bottom-right", children: "Bottom Right" }), _jsx(SelectItem, { value: "top-center", children: "Top Center" }), _jsx(SelectItem, { value: "bottom-center", children: "Bottom Center" })] })] })] })] }), _jsx("div", { className: "space-y-4", children: _jsx(ThemeSettings, {}) })] })] }));
}
//# sourceMappingURL=preferences-form.js.map