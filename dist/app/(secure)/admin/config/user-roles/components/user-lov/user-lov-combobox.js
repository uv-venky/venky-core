/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useUserListStore } from './use-store';
import LOVCombobox from '../../../../../../../components/core/lov-combobox';
export default function UsersLOVCombobox({ open, onOpenChange, onSelect, roleCode, value, trigger, }) {
    const store = useUserListStore();
    const fetchUsers = async (filter) => {
        const query = {
            limit: 50,
            offset: 0,
            sort: {
                userName: 1,
            },
            match: {
                roleCode,
            },
        };
        // Add text search filter if provided
        if (filter && filter.length >= 2) {
            query.filters = [
                {
                    anyof: [
                        {
                            userName: {
                                like: `%${filter}%`,
                                ignoreCase: true,
                            },
                        },
                        {
                            displayName: {
                                like: `%${filter}%`,
                                ignoreCase: true,
                            },
                        },
                        {
                            email: {
                                like: `%${filter}%`,
                                ignoreCase: true,
                            },
                        },
                    ],
                },
            ];
        }
        let users = [];
        await store.executeQuery({
            query,
            handleResponse: (rows) => {
                users = rows;
            },
            noClear: true,
        });
        return users;
    };
    const getOptionsForValue = async (values) => {
        if (values.length === 0)
            return [];
        const query = {
            limit: values.length,
            offset: 0,
            filters: [
                {
                    userName: {
                        in: values,
                    },
                },
            ],
        };
        let users = [];
        await store.executeQuery({
            query,
            handleResponse: (rows) => {
                users = rows;
            },
            force: true,
        });
        return users;
    };
    return (_jsx(LOVCombobox, { open: open, onOpenChange: onOpenChange, store: store, onSelect: onSelect, title: "Select Users", placeholder: "Select users...", searchPlaceholder: "Search users by name, username, or email...", getLabel: (user) => `${user.displayName} (${user.userName})`, getValue: (user) => user.userName, getOptions: fetchUsers, getOptionsForValue: getOptionsForValue, minSearchLength: 0, value: value, trigger: trigger }));
}
//# sourceMappingURL=user-lov-combobox.js.map