'use client';

import PageLayoutTemplate from '@/components/core/page/page-layout-template';
import { Loader2, Mail } from 'lucide-react';
import useEmailRequestsSmartSearchColumns from './hooks/smart-search-columns';
import useEmailRequestsTableColumns from './hooks/table-columns';
import { useEmailRequestsStore } from './hooks/use-store';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import type { EmailRequests } from '@/lib/common/ds/types/core/EmailRequests';
import { Button } from '@/components/ui/button';
import { useMutation } from '@/lib/core/client/useQuery';
import { showInfo } from '@/components/core/common/Notification';
import { startTransition, useState } from 'react';

const defaultVisibleColumnOrder: StringKeyof<EmailRequests>[] = [
  'createdAt',
  'toAddress',
  'subject',
  'attemptCount',
  'nextAttemptAt',
  'sentAt',
  'lastError',
];

export default function EmailRequestsPageContent() {
  const store = useEmailRequestsStore();
  const smartSearchColumns = useEmailRequestsSmartSearchColumns();
  const tableColumns = useEmailRequestsTableColumns(store);
  const [isSending, setIsSending] = useState(false);

  const sendTestEmailMutation = useMutation('sendTestEmail', {
    invalidateStoresOnSuccess: [
      { datasourceId: 'EmailRequests', page: 'email-requests-page', alias: 'email-requests-all' },
    ],
    onSuccess: () => {
      showInfo('Test email sent!');
      setTimeout(() => {
        startTransition(() => store.refresh());
      }, 1000);
    },
  });

  const handleSendTestEmail = async () => {
    setIsSending(true);
    try {
      await sendTestEmailMutation();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <PageLayoutTemplate
      title="Email Requests"
      subTitle="Monitor queued email requests"
      icon={<Mail className="h-12 w-12 text-muted-foreground" />}
      store={store}
      smartSearchColumns={smartSearchColumns}
      tableColumns={tableColumns}
      pageId="email-requests-page"
      itemId="email-requests"
      defaultVisibleColumnOrder={defaultVisibleColumnOrder}
      searchOnBlur
      toolbarContent={
        <Button disabled={isSending} onClick={handleSendTestEmail}>
          {isSending && <Loader2 className="h-4 w-4 animate-spin" />} Send Test Email
        </Button>
      }
    />
  );
}
