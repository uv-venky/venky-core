'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Camera, Upload } from 'lucide-react';
import { useClientSessionSnapshot, userSessionState } from '../../../../components/core/hooks';
import { TextInput } from '../../../../components/core/page';
import AvatarUploadDialog from '../../../../components/core/avatar-upload-dialog';
import { useMutation } from '../../../../lib/core/client/useQuery';
export function ProfileForm() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const session = useClientSessionSnapshot();
    const [avatar, setAvatar] = useState(session.image);
    const [newAvatar, setNewAvatar] = useState(false);
    const updateAvatar = useMutation('updateAvatar');
    const handleSaveAvatar = async (img) => {
        setAvatar(img);
        await updateAvatar(img);
    };
    return (_jsxs(_Fragment, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Profile Information" }), _jsx(CardDescription, { children: "Update your profile information and how others see you on the platform." })] }), _jsxs(CardContent, { className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 space-y-6 overflow-auto", children: [_jsxs("div", { className: "flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0", children: [_jsxs("div", { className: "relative", children: [_jsxs(Avatar, { className: "h-32 w-32", children: [_jsx(AvatarImage, { src: avatar, alt: "Profile picture" }), _jsx(AvatarFallback, { children: session.name.charAt(0) })] }), _jsx("div", { className: "absolute -right-2 -bottom-2 rounded-full bg-primary p-0 text-primary-foreground shadow-sm", children: _jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
                                                setNewAvatar(false);
                                                setDialogOpen(true);
                                            }, children: _jsx(Camera, { className: "h-4 w-4" }) }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "font-medium text-lg", children: "Profile Picture" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Upload a new profile picture. Recommended size: 256x256px." }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "mt-2", onClick: () => {
                                                    setNewAvatar(true);
                                                    setDialogOpen(true);
                                                }, children: [_jsx(Upload, { className: "mr-2 h-4 w-4" }), "Upload New"] }), _jsx(Button, { variant: "outline", size: "sm", className: "mt-2", onClick: async () => {
                                                    setAvatar(undefined);
                                                    await updateAvatar(undefined);
                                                }, children: "Remove" })] })] })] }), _jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [_jsx(TextInput, { label: "Display Name", value: session.name, disabled: true, labelOnTop: true }), _jsx(TextInput, { label: "Job Title", placeholder: "Job Title", value: session.settings.jobTitle ?? '', onValueChange: (value) => {
                                    userSessionState.session.settings.jobTitle = value;
                                }, labelOnTop: true }), _jsx(TextInput, { label: "Email", value: session.email, disabled: true, labelOnTop: true, helpText: "Contact IT support to change your email address." }), _jsx(TextInput, { label: "Phone Number", placeholder: "Phone Number", value: session.settings.phoneNumber ?? '', onValueChange: (value) => {
                                    userSessionState.session.settings.phoneNumber = value;
                                }, labelOnTop: true, helpText: _jsx("span", { style: { visibility: 'hidden' }, children: "Contact IT support to change your email address." }) }), _jsx(TextInput, { label: "Department", placeholder: "Department", value: session.settings.department ?? '', onValueChange: (value) => {
                                    userSessionState.session.settings.department = value;
                                }, labelOnTop: true }), _jsx(TextInput, { label: "Bio", placeholder: "Write a short bio about yourself", value: session.settings.bio ?? '', onValueChange: (value) => {
                                    userSessionState.session.settings.bio = value;
                                }, labelOnTop: true, multiline: true, className: "col-span-2 min-h-[100px]" })] })] }), dialogOpen && (_jsx(AvatarUploadDialog, { open: true, onOpenChange: setDialogOpen, onSave: handleSaveAvatar, initialImage: newAvatar ? null : avatar }))] }));
}
//# sourceMappingURL=profile-form.js.map