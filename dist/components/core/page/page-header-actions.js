/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CommentsButton } from '../../../components/comments-button';
import { ShareUrlButton } from '../../../components/share-url-button';
import { ThemeToggle } from '../../../components/theme-toggle';
import { UserProfile } from '../../../components/user-profile';
export function PageHeaderActions({ enableShareUrl = false, enableComments = false, showThemeToggle = false, showUserProfile = false, }) {
    return (_jsxs(_Fragment, { children: [enableComments && _jsx(CommentsButton, {}), enableShareUrl && _jsx(ShareUrlButton, {}), showThemeToggle && _jsx(ThemeToggle, {}), showUserProfile && _jsx(UserProfile, { hideThemeToggle: !showThemeToggle })] }));
}
//# sourceMappingURL=page-header-actions.js.map