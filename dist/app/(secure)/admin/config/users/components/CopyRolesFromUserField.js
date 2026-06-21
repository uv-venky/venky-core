/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { AsyncComboboxInput } from '../../../../../../components/core/page/fields';
import { useCopyRolesContext } from './CopyRolesContext';
import { useUserListStore } from '../../user-roles/components/user-lov/use-store';
export function CopyRolesFromUserField({ disabled }) {
  const { copyRolesFromUser, setCopyRolesFromUser } = useCopyRolesContext();
  const userListStore = useUserListStore();
  const fetchUsers = async (filter) => {
    const query = {
      limit: 50,
      offset: 0,
      sort: {
        userName: 1,
      },
    };
    // Add filter if provided
    if (filter) {
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
    await userListStore.executeQuery({
      query,
      handleResponse: (rows) => {
        users = rows;
      },
      noClear: true,
    });
    return users;
  };
  const getUserByUserName = async (userName) => {
    let user;
    await userListStore.executeQuery({
      query: { match: { userName }, limit: 1 },
      handleResponse: (rows) => {
        user = rows[0];
      },
      noClear: true,
    });
    return user;
  };
  return _jsx(AsyncComboboxInput, {
    label: 'Copy Roles from User',
    labelOnTop: false,
    disabled: disabled,
    value: copyRolesFromUser ?? null,
    onSelect: (value) => {
      setCopyRolesFromUser(value ?? undefined);
    },
    getOptions: fetchUsers,
    getValue: (option) => option.userName,
    getLabel: (option) => `${option.displayName} (${option.userName})`,
    getOptionForValue: getUserByUserName,
    placeholder: 'Select a user to copy roles from',
    searchPlaceholder: 'Search by user name, display name, or email',
    minSearchLength: 2,
    emptyText: 'No users found. Enter at least 2 characters to search.',
  });
}
//# sourceMappingURL=CopyRolesFromUserField.js.map
