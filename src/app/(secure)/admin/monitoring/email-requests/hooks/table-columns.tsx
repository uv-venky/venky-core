'use client';

import HeaderCell from '@/components/core/table/header-cell';
import TableCell from '@/components/core/table/table-cell';
import type { EmailRequests } from '@/lib/common/ds/types/core/EmailRequests';
import type { Store } from '@/lib/core/common/types/Store';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { isEmptyObject } from '@/lib/core/common/isEmpty';
import { Button } from '@/components/ui/button';
import { useCurrentStore } from '@/components/core/page/RowIdProvider';
import { assertExists } from '@/components/core/utils/assert';
import { useRowValue } from '@/components/core/hooks/useStoreHooks';
import useTheme from '@/components/core/hooks/useTheme';
import { InfoIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JsonPreview from '@/components/core/common/json-preview';
import { ResendEmailButton } from '../components/resend-email-button';

function EmailOptionsInfo({ rowId }: { rowId: string }) {
  const store = useCurrentStore<EmailRequests>();
  assertExists(store, 'Missing store in EmailOptionsInfo');
  const value = useRowValue(store, rowId, 'mailOptions');
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  if (isEmptyObject(value)) {
    return null;
  }

  const html = value?.html;
  const text = value?.text;

  // Type guards to ensure we have string content
  const htmlString = typeof html === 'string' ? html : null;
  const textString = typeof text === 'string' ? text : null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="mr-2 shrink-0 p-0"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        activityId="no-log"
        data-tip="View email body"
      >
        <InfoIcon className="size-4" />
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="h-[500px] w-[800px] sm:max-w-auto">
          <Tabs defaultValue="body" className="h-full overflow-hidden">
            <DialogHeader>
              <DialogTitle className="sr-only">Email Options</DialogTitle>
              <TabsList>
                <TabsTrigger value="body">Email Body</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
            </DialogHeader>

            <TabsContent value="json" className="flex-1 overflow-auto">
              <div className="rounded-lg bg-muted p-0">
                <JsonPreview value={value} theme={theme === 'dark' ? 'dark' : 'light'} />
              </div>
            </TabsContent>
            <TabsContent value="body" className="flex-1">
              <div className="h-full flex-1 overflow-hidden">
                {htmlString ? (
                  <iframe
                    srcDoc={htmlString}
                    className="h-full w-full rounded-lg border"
                    title="HTML Content Preview"
                    sandbox="allow-same-origin"
                  />
                ) : textString ? (
                  <div className="max-h-full overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 font-mono text-sm">
                    {textString}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No content available
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function useEmailRequestsTableColumns(
  store: Store<EmailRequests>,
): AccessorKeyColumnDef<EmailRequests>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'requestId',
        meta: { label: 'ID' },
        size: 80,
        header: (props) => <HeaderCell {...props} type="Number" store={store} accessorKey="requestId" title="ID" />,
        cell: (props) => <TableCell type="Number" attributeCode="requestId" {...props} />,
      },
      {
        accessorKey: 'toAddress',
        meta: { label: 'To' },
        size: 200,
        header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="toAddress" title="To" />,
        cell: (props) => <TableCell type="Text" attributeCode="toAddress" {...props} />,
      },
      {
        accessorKey: 'subject',
        meta: { label: 'Subject' },
        size: 220,
        header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="subject" title="Subject" />,
        cell: (props) => (
          <TableCell type="Text" attributeCode="subject" {...props}>
            <EmailOptionsInfo rowId={props.row.id} />
          </TableCell>
        ),
      },
      {
        accessorKey: 'attemptCount',
        meta: { label: 'Attempts' },
        size: 80,
        header: (props) => (
          <HeaderCell {...props} type="Number" store={store} accessorKey="attemptCount" title="Attempts" />
        ),
        cell: (props) => <TableCell type="Number" attributeCode="attemptCount" {...props} />,
      },
      {
        accessorKey: 'lastError',
        meta: { label: 'Last Error' },
        size: 220,
        header: (props) => (
          <HeaderCell {...props} type="Text" store={store} accessorKey="lastError" title="Last Error" />
        ),
        cell: (props) => <TableCell type="Text" attributeCode="lastError" {...props} />,
      },
      {
        accessorKey: 'createdAt',
        meta: { label: 'Created At' },
        size: 160,
        header: (props) => (
          <HeaderCell {...props} type="Date" store={store} accessorKey="createdAt" title="Created At" />
        ),
        cell: (props) => <TableCell type="Date" dateFormat="M/d H:mm" attributeCode="createdAt" {...props} />,
      },
      {
        accessorKey: 'nextAttemptAt',
        meta: { label: 'Send At' },
        size: 160,
        header: (props) => (
          <HeaderCell {...props} type="Date" store={store} accessorKey="nextAttemptAt" title="Send At" />
        ),
        cell: (props) => <TableCell type="Date" dateFormat="M/d H:mm" attributeCode="nextAttemptAt" {...props} />,
      },
      {
        accessorKey: 'sentAt',
        meta: { label: 'Sent At' },
        size: 160,
        header: (props) => <HeaderCell {...props} type="Date" store={store} accessorKey="sentAt" title="Sent At" />,
        cell: (props) => <TableCell type="Date" dateFormat="M/d H:mm" attributeCode="sentAt" {...props} />,
      },
      {
        accessorKey: 'requestId',
        id: 'actions',
        meta: { label: 'Actions' },
        size: 110,
        header: () => <div className="text-center">Actions</div>,
        cell: (props) => (
          <div className="flex justify-center">
            <ResendEmailButton rowId={props.row.id} />
          </div>
        ),
      },
    ],
    [store],
  );
}
