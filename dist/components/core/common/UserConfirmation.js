/* Copyright (c) 2023-present Venky Corp */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { useSnapshot } from 'valtio';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import CopyToClipboard from '../../../components/core/common/CopyToClipboard';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { userConfirmationState as state } from '../../../components/core/common/UserConfirmationState';
import { buttonVariants } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
export default function UserConfirmation() {
  const { props } = useSnapshot(state);
  const [confirmationText, setConfirmationText] = useState('');
  /** When true, dialog closed via Ok / action buttons — do not also invoke onClose (Radix may call onOpenChange(false)). */
  const closedByPrimaryActionRef = useRef(false);
  useLayoutEffect(() => {
    if (props.open) {
      closedByPrimaryActionRef.current = false;
    }
  }, [props.open]);
  const onOpenChange = (open) => {
    state.props.open = open;
    if (!open) {
      if (!closedByPrimaryActionRef.current) {
        state.props.onClose?.();
      }
      closedByPrimaryActionRef.current = false;
    }
  };
  const handleOk = (event) => {
    closedByPrimaryActionRef.current = true;
    state.props.open = false;
    state.props.onOk(event);
  };
  const handleAction1 = (event) => {
    closedByPrimaryActionRef.current = true;
    state.props.open = false;
    state.props.onAction1?.(event);
  };
  const handleAction2 = (event) => {
    closedByPrimaryActionRef.current = true;
    state.props.open = false;
    state.props.onAction2?.(event);
  };
  useEffect(() => {
    if (!props.open) {
      setConfirmationText('');
    }
  }, [props.open]);
  if (!props.open) {
    return null;
  }
  const isTwoButtonMode = Boolean(props.action1Label && props.action2Label);
  const isConfirmationTextRequired = Boolean(props.confirmationText);
  const isConfirmationTextValid = isConfirmationTextRequired ? props.confirmationText === confirmationText : true;
  return _jsx(AlertDialog, {
    open: true,
    onOpenChange: onOpenChange,
    children: _jsxs(AlertDialogContent, {
      className: 'max-w-sm',
      children: [
        _jsxs(AlertDialogHeader, {
          children: [
            _jsx(AlertDialogTitle, { children: props.title }),
            _jsx(AlertDialogDescription, { children: props.content }),
            props.confirmationText &&
              _jsxs('div', {
                className: 'grid w-full max-w-sm items-center gap-1.5',
                children: [
                  _jsxs(Label, {
                    htmlFor: 'email',
                    children: [
                      `Type "${props.confirmationText}" to confirm`,
                      confirmationText && _jsx(CopyToClipboard, { text: confirmationText }),
                    ],
                  }),
                  _jsx(Input, {
                    placeholder: `Type "${props.confirmationText}" to confirm`,
                    value: confirmationText,
                    onChange: (e) => setConfirmationText(e.target.value),
                    'data-testid': 'confirmation-text',
                    autoFocus: true,
                  }),
                ],
              }),
          ],
        }),
        _jsxs(AlertDialogFooter, {
          children: [
            _jsx(AlertDialogCancel, { 'data-testid': 'confirm-cancel', children: props.cancelButtonLabel || 'Cancel' }),
            isTwoButtonMode
              ? _jsxs(_Fragment, {
                  children: [
                    _jsx(AlertDialogAction, {
                      'data-testid': 'confirm-action1',
                      disabled: !isConfirmationTextValid,
                      onClick: handleAction1,
                      children: props.action1Label,
                    }),
                    _jsx(AlertDialogAction, {
                      'data-testid': 'confirm-action2',
                      disabled: !isConfirmationTextValid,
                      onClick: handleAction2,
                      className: cn(buttonVariants({ variant: 'secondary' })),
                      children: props.action2Label,
                    }),
                  ],
                })
              : _jsx(AlertDialogAction, {
                  'data-testid': 'confirm-ok',
                  disabled: !isConfirmationTextValid,
                  onClick: handleOk,
                  className:
                    props.confirmButtonVariant === 'destructive'
                      ? cn(buttonVariants({ variant: 'destructive' }))
                      : undefined,
                  children: props.confirmButtonLabel || 'Ok',
                }),
          ],
        }),
      ],
    }),
  });
}
//# sourceMappingURL=UserConfirmation.js.map
