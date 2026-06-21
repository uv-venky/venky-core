/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useState } from 'react';
import { Button } from '../../../../../../components/ui/button';
import { Loader2, RotateCcw } from 'lucide-react';
import { confirmWithUser } from '../../../../../../components/core/common';
import { showInfo } from '../../../../../../components/core/common/Notification';
import { useMutation } from '../../../../../../lib/core/client/useQuery';
import { useCurrentStore } from '../../../../../../components/core/page/RowIdProvider';
import { useRowValue } from '../../../../../../components/core/hooks/useStoreHooks';
import { assertExists } from '../../../../../../components/core/utils/assert';
export function ResendEmailButton({ rowId }) {
  const store = useCurrentStore();
  assertExists(store, 'Store not found');
  const sentAt = useRowValue(store, rowId, 'sentAt');
  const requestId = useRowValue(store, rowId, 'requestId');
  const subject = useRowValue(store, rowId, 'subject');
  const [isResending, setIsResending] = useState(false);
  const resendMutation = useMutation('resendEmailRequest', {
    invalidateStoresOnSuccess: [
      { datasourceId: 'EmailRequests', page: 'email-requests-page', alias: 'email-requests-all' },
    ],
    onSuccess: () => {
      showInfo('Email queued for resend');
      setTimeout(() => {
        store.refresh();
      }, 1000);
    },
  });
  if (!sentAt || requestId == null) {
    return null;
  }
  const handleResend = async () => {
    const confirmed = await confirmWithUser({
      title: 'Resend email',
      content: `Resend "${subject || 'this email'}" (request #${requestId})?`,
      confirmButtonLabel: 'Resend',
    });
    if (!confirmed) {
      return;
    }
    setIsResending(true);
    try {
      await resendMutation(requestId);
    } finally {
      setIsResending(false);
    }
  };
  return _jsxs(Button, {
    variant: 'ghost',
    size: 'sm',
    className: 'h-8 gap-1 px-2',
    disabled: isResending,
    onClick: (e) => {
      e.stopPropagation();
      void handleResend();
    },
    'data-tip': 'Resend email',
    activityId: 'no-log',
    children: [
      isResending ? _jsx(Loader2, { className: 'h-4 w-4 animate-spin' }) : _jsx(RotateCcw, { className: 'h-4 w-4' }),
      'Resend',
    ],
  });
}
//# sourceMappingURL=resend-email-button.js.map
