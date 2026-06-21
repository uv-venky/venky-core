'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import HeaderCell from '../../../../../../components/core/table/header-cell';
import TableCell from '../../../../../../components/core/table/table-cell';
import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../../../components/ui/dialog';
import { isEmptyObject } from '../../../../../../lib/core/common/isEmpty';
import { Button } from '../../../../../../components/ui/button';
import { useCurrentStore } from '../../../../../../components/core/page/RowIdProvider';
import { assertExists } from '../../../../../../components/core/utils/assert';
import { useRowValue } from '../../../../../../components/core/hooks/useStoreHooks';
import useTheme from '../../../../../../components/core/hooks/useTheme';
import { InfoIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../../components/ui/tabs';
import JsonPreview from '../../../../../../components/core/common/json-preview';
import { ResendEmailButton } from '../components/resend-email-button';
function EmailOptionsInfo({ rowId }) {
  const store = useCurrentStore();
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
  return _jsxs(_Fragment, {
    children: [
      _jsx(Button, {
        variant: 'ghost',
        size: 'icon',
        className: 'mr-2 shrink-0 p-0',
        onClick: (e) => {
          e.stopPropagation();
          setIsOpen(true);
        },
        activityId: 'no-log',
        'data-tip': 'View email body',
        children: _jsx(InfoIcon, { className: 'size-4' }),
      }),
      _jsx(Dialog, {
        open: isOpen,
        onOpenChange: setIsOpen,
        children: _jsx(DialogContent, {
          className: 'h-[500px] w-[800px] sm:max-w-auto',
          children: _jsxs(Tabs, {
            defaultValue: 'body',
            className: 'h-full overflow-hidden',
            children: [
              _jsxs(DialogHeader, {
                children: [
                  _jsx(DialogTitle, { className: 'sr-only', children: 'Email Options' }),
                  _jsxs(TabsList, {
                    children: [
                      _jsx(TabsTrigger, { value: 'body', children: 'Email Body' }),
                      _jsx(TabsTrigger, { value: 'json', children: 'JSON' }),
                    ],
                  }),
                ],
              }),
              _jsx(TabsContent, {
                value: 'json',
                className: 'flex-1 overflow-auto',
                children: _jsx('div', {
                  className: 'rounded-lg bg-muted p-0',
                  children: _jsx(JsonPreview, { value: value, theme: theme === 'dark' ? 'dark' : 'light' }),
                }),
              }),
              _jsx(TabsContent, {
                value: 'body',
                className: 'flex-1',
                children: _jsx('div', {
                  className: 'h-full flex-1 overflow-hidden',
                  children: htmlString
                    ? _jsx('iframe', {
                        srcDoc: htmlString,
                        className: 'h-full w-full rounded-lg border',
                        title: 'HTML Content Preview',
                        sandbox: 'allow-same-origin',
                      })
                    : textString
                      ? _jsx('div', {
                          className:
                            'max-h-full overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 font-mono text-sm',
                          children: textString,
                        })
                      : _jsx('div', {
                          className: 'flex h-full items-center justify-center text-muted-foreground',
                          children: 'No content available',
                        }),
                }),
              }),
            ],
          }),
        }),
      }),
    ],
  });
}
export default function useEmailRequestsTableColumns(store) {
  return useMemo(
    () => [
      {
        accessorKey: 'requestId',
        meta: { label: 'ID' },
        size: 80,
        header: (props) =>
          _jsx(HeaderCell, { ...props, type: 'Number', store: store, accessorKey: 'requestId', title: 'ID' }),
        cell: (props) => _jsx(TableCell, { type: 'Number', attributeCode: 'requestId', ...props }),
      },
      {
        accessorKey: 'toAddress',
        meta: { label: 'To' },
        size: 200,
        header: (props) =>
          _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'toAddress', title: 'To' }),
        cell: (props) => _jsx(TableCell, { type: 'Text', attributeCode: 'toAddress', ...props }),
      },
      {
        accessorKey: 'subject',
        meta: { label: 'Subject' },
        size: 220,
        header: (props) =>
          _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'subject', title: 'Subject' }),
        cell: (props) =>
          _jsx(TableCell, {
            type: 'Text',
            attributeCode: 'subject',
            ...props,
            children: _jsx(EmailOptionsInfo, { rowId: props.row.id }),
          }),
      },
      {
        accessorKey: 'attemptCount',
        meta: { label: 'Attempts' },
        size: 80,
        header: (props) =>
          _jsx(HeaderCell, { ...props, type: 'Number', store: store, accessorKey: 'attemptCount', title: 'Attempts' }),
        cell: (props) => _jsx(TableCell, { type: 'Number', attributeCode: 'attemptCount', ...props }),
      },
      {
        accessorKey: 'lastError',
        meta: { label: 'Last Error' },
        size: 220,
        header: (props) =>
          _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'lastError', title: 'Last Error' }),
        cell: (props) => _jsx(TableCell, { type: 'Text', attributeCode: 'lastError', ...props }),
      },
      {
        accessorKey: 'createdAt',
        meta: { label: 'Created At' },
        size: 160,
        header: (props) =>
          _jsx(HeaderCell, { ...props, type: 'Date', store: store, accessorKey: 'createdAt', title: 'Created At' }),
        cell: (props) =>
          _jsx(TableCell, { type: 'Date', dateFormat: 'M/d H:mm', attributeCode: 'createdAt', ...props }),
      },
      {
        accessorKey: 'nextAttemptAt',
        meta: { label: 'Send At' },
        size: 160,
        header: (props) =>
          _jsx(HeaderCell, { ...props, type: 'Date', store: store, accessorKey: 'nextAttemptAt', title: 'Send At' }),
        cell: (props) =>
          _jsx(TableCell, { type: 'Date', dateFormat: 'M/d H:mm', attributeCode: 'nextAttemptAt', ...props }),
      },
      {
        accessorKey: 'sentAt',
        meta: { label: 'Sent At' },
        size: 160,
        header: (props) =>
          _jsx(HeaderCell, { ...props, type: 'Date', store: store, accessorKey: 'sentAt', title: 'Sent At' }),
        cell: (props) => _jsx(TableCell, { type: 'Date', dateFormat: 'M/d H:mm', attributeCode: 'sentAt', ...props }),
      },
      {
        accessorKey: 'requestId',
        id: 'actions',
        meta: { label: 'Actions' },
        size: 110,
        header: () => _jsx('div', { className: 'text-center', children: 'Actions' }),
        cell: (props) =>
          _jsx('div', { className: 'flex justify-center', children: _jsx(ResendEmailButton, { rowId: props.row.id }) }),
      },
    ],
    [store],
  );
}
//# sourceMappingURL=table-columns.js.map
