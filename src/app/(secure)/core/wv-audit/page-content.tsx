'use client';

import PageLayoutTemplate from '@/components/core/page/page-layout-template';
import { ShoppingCart } from 'lucide-react';
import EditForm from './components/edit-form';
import useWVAuditSmartSearchColumns from './hooks/smart-search-columns';
import useWVAuditTableColumns from './hooks/table-columns';
import { useWVAuditStore } from './hooks/use-store';
import ExcelUpload from '@/components/core/excel-upload/excel-upload';

export default function WVAuditPageContent() {
  const store = useWVAuditStore();
  const smartSearchColumns = useWVAuditSmartSearchColumns();
  const tableColumns = useWVAuditTableColumns(store);

  return (
    <PageLayoutTemplate
      toolbarContent={
        <ExcelUpload dateFormat="yyyy-MM-dd" dateTimeFormat="yyyy-MM-dd HH:mm:ss.SSSxxx" store={store} maxRows={1000} />
      }
      title="Wv Audit"
      subTitle="Manage Wv Audit"
      icon={<ShoppingCart className="h-12 w-12 text-muted-foreground" />}
      store={store}
      smartSearchColumns={smartSearchColumns}
      tableColumns={tableColumns}
      pageId="wv-audit-page"
      itemId="wv-audit"
      editForm={<EditForm store={store} />}
      getDefaultRow={() => {
        return {};
      }}
      addNewButtonText="Add New Wv Audit"
    />
  );
}
