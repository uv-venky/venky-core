'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { ProfileForm } from './profile-form';
import { PreferencesForm } from './preferences-form';
import { SecurityForm } from './security-form';
import { NotificationsForm } from './notifications-form';
import { PageLayout, PageShell } from '../../../../components/core/page';
export function UserProfilePage({ defaultTab = 'profile', }) {
    const [isSaving, setIsSaving] = useState(false);
    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
        }, 1000);
    };
    return (_jsx(PageShell, { title: "Profile Settings", noPadding: true, children: _jsx(PageLayout, { title: "Profile Settings", subTitle: "Manage your account settings and preferences.", toolbar: _jsx(Button, { onClick: handleSave, disabled: isSaving, children: isSaving ? 'Saving...' : 'Save changes' }), mainSection: _jsx("div", { className: "h-full flex-1 p-4", children: _jsxs(Tabs, { defaultValue: defaultTab, className: "flex h-full flex-col space-y-6", children: [_jsxs(TabsList, { className: "grid w-full shrink-0 grid-cols-3", children: [_jsx(TabsTrigger, { value: "profile", children: "Profile" }), _jsx(TabsTrigger, { value: "preferences", children: "Preferences" }), _jsx(TabsTrigger, { value: "security", children: "Security" })] }), _jsx(TabsContent, { value: "profile", className: "flex-1 overflow-hidden", children: _jsx(Card, { className: "flex h-full flex-1 flex-col overflow-hidden", children: _jsx(ProfileForm, {}) }) }), _jsx(TabsContent, { value: "preferences", className: "flex-1 overflow-hidden", children: _jsx(Card, { className: "flex h-full flex-1 flex-col overflow-hidden", children: _jsx(PreferencesForm, {}) }) }), _jsx(TabsContent, { value: "notifications", className: "flex-1 overflow-hidden", children: _jsx(Card, { className: "flex h-full flex-1 flex-col overflow-hidden", children: _jsx(NotificationsForm, {}) }) }), _jsx(TabsContent, { value: "security", className: "flex-1 overflow-hidden", children: _jsx(Card, { className: "flex h-full flex-1 flex-col overflow-hidden", children: _jsx(SecurityForm, {}) }) })] }) }) }) }));
}
//# sourceMappingURL=user-profile-page.js.map