'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { useRoleListStore } from './use-store';
import useRolesLOVTableColumns from './table-columns';
import useRolesLOVSmartSearchColumns from './smart-search-columns';
import LOVDialog from '../../../../../../../components/core/lov';
import { usePreQuery } from '../../../../../../../components/core/hooks/useStoreHooks';
import { useEffect } from 'react';
export default function RolesLOV({ open, onOpenChange, onSelect, userName }) {
  const store = useRoleListStore();
  const tableColumns = useRolesLOVTableColumns(store);
  const smartSearchColumns = useRolesLOVSmartSearchColumns();
  usePreQuery(store, (query) => {
    query.match = {
      userName,
    };
    query.sort = query.sort ?? {
      roleCode: 1,
    };
    return query;
  });
  useEffect(() => {
    store.clearSync();
    store.executeQuery({
      query: {
        match: {
          userName,
        },
      },
    });
  }, [userName, store]);
  return _jsx(LOVDialog, {
    open: open,
    onOpenChange: onOpenChange,
    store: store,
    tableColumns: tableColumns,
    smartSearchColumns: smartSearchColumns,
    onSelect: onSelect,
    title: 'Select Roles',
    width: 1100,
    height: 650,
    modal: false,
  });
}
//# sourceMappingURL=role-lov.js.map
