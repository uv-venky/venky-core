'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import PageLayoutTemplate from '../../../../../components/core/page/page-layout-template';
import { ShoppingCart } from 'lucide-react';
import EditForm from './components/edit-form';
import useUsersSmartSearchColumns from './hooks/smart-search-columns';
import useUsersTableColumns from './hooks/table-columns';
import { useUsersStore } from './hooks/use-store';
import { CopyRolesProvider, useCopyRolesContext } from './components/CopyRolesContext';
import { useUserRolesStore } from '../user-roles/hooks/use-store';
import { showError, showInfo } from '../../../../../components/core/common';
import { getErrorMessage } from '../../../../../lib/core/common/error';
const defaultVisibleColumnOrder = ['userName', 'startDate', 'endDate', 'locationName', 'locked'];
function UsersPageContentInner({ toolbarContent }) {
  const store = useUsersStore();
  const smartSearchColumns = useUsersSmartSearchColumns();
  const tableColumns = useUsersTableColumns(store);
  const { copyRolesFromUser, setCopyRolesFromUser } = useCopyRolesContext();
  const userRolesStore = useUserRolesStore('copy-roles-on-create');
  const handleSave = async (onClose) => {
    const wasNewUser = !store.isCurrentRowFromDB();
    const userName = store.currentRow()?.userName;
    const result = await store.save();
    if (result && wasNewUser && copyRolesFromUser && userName) {
      // Copy roles from the selected user
      try {
        // Query roles from the source user
        let sourceRoles = [];
        await userRolesStore.executeQuery({
          query: {
            data: {
              userName: copyRolesFromUser,
            },
          },
          handleResponse: (rows) => {
            sourceRoles = rows;
          },
          noClear: true,
        });
        if (sourceRoles.length > 0) {
          // Add the roles to the new user
          const newRows = sourceRoles.map((role) => ({
            userName: userName,
            roleCode: role.roleCode,
            roleName: role.roleName,
            startDate: new Date().toISOString(),
            endDate: null,
          }));
          await userRolesStore.insertBulk(newRows, true);
          await userRolesStore.save({
            feedback: `Successfully copied ${sourceRoles.length} role(s) from ${copyRolesFromUser} to ${userName}`,
          });
        } else {
          showInfo(`No roles found for ${copyRolesFromUser}`);
        }
      } catch (error) {
        // Don't fail the user creation if role copying fails
        console.error('Error copying roles:', error);
        showError(`Error copying roles: ${getErrorMessage(error)}`);
      }
      // Reset the copy roles selection
      setCopyRolesFromUser(undefined);
    }
    // Close the popup after saving
    if (result) {
      onClose();
    }
  };
  return _jsx(PageLayoutTemplate, {
    title: 'Users',
    subTitle: 'Manage Users',
    icon: _jsx(ShoppingCart, { className: 'h-12 w-12 text-muted-foreground' }),
    store: store,
    smartSearchColumns: smartSearchColumns,
    tableColumns: tableColumns,
    pageId: 'users-page',
    itemId: 'users',
    editForm: _jsx(EditForm, { store: store }),
    getDefaultRow: () => {
      const now = new Date();
      now.setSeconds(0);
      now.setMilliseconds(0);
      now.setMinutes(0);
      return {
        startDate: now.toISOString(),
        failedLoginAttempts: 0,
        locked: false,
        previousPasswordHashes: [],
        settings: { theme: 'light' },
        forcePasswordChange: true,
      };
    },
    addNewButtonText: 'Add New User',
    popupWidth: 680,
    popupHeight: 690,
    disableHeaderFilters: true,
    toolbarContent: toolbarContent,
    handleSave: handleSave,
    showExportButton: true,
    defaultVisibleColumnOrder: defaultVisibleColumnOrder,
    enableNaturalLanguageSearch: true,
  });
}
export default function UsersPageContent({ toolbarContent }) {
  return _jsx(CopyRolesProvider, { children: _jsx(UsersPageContentInner, { toolbarContent: toolbarContent }) });
}
//# sourceMappingURL=page-content.js.map
