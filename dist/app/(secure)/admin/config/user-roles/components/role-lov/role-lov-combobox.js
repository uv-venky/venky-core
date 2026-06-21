/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { useRoleListStore } from './use-store';
import LOVCombobox from '../../../../../../../components/core/lov-combobox';
export default function RolesLOVCombobox({ open, onOpenChange, onSelect, userName, value, trigger }) {
  const store = useRoleListStore();
  const fetchRoles = async (filter) => {
    const query = {
      limit: 50,
      offset: 0,
      sort: {
        roleCode: 1,
      },
      match: {
        userName,
      },
    };
    // Add text search filter if provided
    if (filter && filter.length >= 2) {
      query.filters = [
        {
          anyof: [
            {
              roleName: {
                like: `%${filter}%`,
                ignoreCase: true,
              },
            },
            {
              roleCode: {
                like: `%${filter}%`,
                ignoreCase: true,
              },
            },
            {
              description: {
                like: `%${filter}%`,
                ignoreCase: true,
              },
            },
          ],
        },
      ];
    }
    let roles = [];
    await store.executeQuery({
      query,
      handleResponse: (rows) => {
        roles = rows;
      },
      force: true,
    });
    return roles;
  };
  const getOptionsForValue = async (values) => {
    if (values.length === 0) return [];
    const query = {
      limit: values.length,
      offset: 0,
      filters: [
        {
          roleCode: {
            in: values,
          },
        },
      ],
    };
    let roles = [];
    await store.executeQuery({
      query,
      handleResponse: (rows) => {
        roles = rows;
      },
      noClear: true,
    });
    return roles;
  };
  return _jsx(LOVCombobox, {
    open: open,
    onOpenChange: onOpenChange,
    store: store,
    onSelect: onSelect,
    title: 'Select Roles',
    placeholder: 'Select roles...',
    searchPlaceholder: 'Search roles by name, code, or description...',
    getLabel: (role) => `${role.roleName} (${role.roleCode})`,
    getValue: (role) => role.roleCode,
    getOptions: fetchRoles,
    getOptionsForValue: getOptionsForValue,
    minSearchLength: 0,
    value: value,
    trigger: trigger,
  });
}
//# sourceMappingURL=role-lov-combobox.js.map
