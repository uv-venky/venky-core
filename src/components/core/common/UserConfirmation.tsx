/* Copyright (c) 2023-present Venky Corp */

'use client';

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
} from '@/components/ui/alert-dialog';
import CopyToClipboard from '@/components/core/common/CopyToClipboard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userConfirmationState as state } from '@/components/core/common/UserConfirmationState';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  const onOpenChange = (open: boolean) => {
    state.props.open = open;
    if (!open) {
      if (!closedByPrimaryActionRef.current) {
        state.props.onClose?.();
      }
      closedByPrimaryActionRef.current = false;
    }
  };

  const handleOk = (event: React.MouseEvent<HTMLButtonElement>) => {
    closedByPrimaryActionRef.current = true;
    state.props.open = false;
    state.props.onOk(event);
  };

  const handleAction1 = (event: React.MouseEvent<HTMLButtonElement>) => {
    closedByPrimaryActionRef.current = true;
    state.props.open = false;
    state.props.onAction1?.(event);
  };

  const handleAction2 = (event: React.MouseEvent<HTMLButtonElement>) => {
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

  return (
    <AlertDialog open onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          <AlertDialogDescription>{props.content}</AlertDialogDescription>
          {props.confirmationText && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">
                {`Type "${props.confirmationText}" to confirm`}
                {confirmationText && <CopyToClipboard text={confirmationText} />}
              </Label>
              <Input
                placeholder={`Type "${props.confirmationText}" to confirm`}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                data-testid="confirmation-text"
                autoFocus
              />
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="confirm-cancel">{props.cancelButtonLabel || 'Cancel'}</AlertDialogCancel>
          {isTwoButtonMode ? (
            <>
              <AlertDialogAction
                data-testid="confirm-action1"
                disabled={!isConfirmationTextValid}
                onClick={handleAction1}
              >
                {props.action1Label}
              </AlertDialogAction>
              <AlertDialogAction
                data-testid="confirm-action2"
                disabled={!isConfirmationTextValid}
                onClick={handleAction2}
                className={cn(buttonVariants({ variant: 'secondary' }))}
              >
                {props.action2Label}
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction
              data-testid="confirm-ok"
              disabled={!isConfirmationTextValid}
              onClick={handleOk}
              className={
                props.confirmButtonVariant === 'destructive'
                  ? cn(buttonVariants({ variant: 'destructive' }))
                  : undefined
              }
            >
              {props.confirmButtonLabel || 'Ok'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
