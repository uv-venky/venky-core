/* Copyright (c) 2023-present Venky Corp */

import { emptyFunction } from '@/lib/core/common/isEmpty';
import { proxy } from 'valtio';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  content: string;
  cancelButtonLabel?: string;
  confirmButtonLabel?: string;
  /** Single-button mode: style the confirm action as destructive (e.g. delete). */
  confirmButtonVariant?: 'default' | 'destructive';
  confirmationText?: string;
  onOk: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClose: () => void;
  // Two-button mode
  action1Label?: string;
  action2Label?: string;
  onAction1?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onAction2?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const defaultValue: ConfirmDialogProps = {
  open: false,
  title: '',
  content: '',
  onOk: emptyFunction,
  onClose: emptyFunction,
};

export const userConfirmationState = proxy<{
  props: ConfirmDialogProps;
}>({ props: defaultValue });

// Overload for two-button mode
export async function confirmWithUser(args: {
  title: string;
  content: string;
  action1Label: string;
  action2Label: string;
  cancelButtonLabel?: string;
}): Promise<string | null>;

// Overload for single-button mode (backward compatible)
export async function confirmWithUser(args: {
  title: string;
  content: string;
  cancelButtonLabel?: string;
  confirmButtonLabel?: string;
  confirmButtonVariant?: 'default' | 'destructive';
  confirmationText?: string;
}): Promise<boolean>;

// Implementation
export async function confirmWithUser(
  args:
    | {
        title: string;
        content: string;
        action1Label: string;
        action2Label: string;
        cancelButtonLabel?: string;
      }
    | {
        title: string;
        content: string;
        cancelButtonLabel?: string;
        confirmButtonLabel?: string;
        confirmButtonVariant?: 'default' | 'destructive';
        confirmationText?: string;
        action1Label?: never;
        action2Label?: never;
      },
): Promise<string | null | boolean> {
  // If two action buttons are provided, return the selected action
  if (args.action1Label && args.action2Label) {
    return new Promise<string | null>((resolve) => {
      userConfirmationState.props = {
        ...args,
        open: true,
        onAction1: () => {
          userConfirmationState.props.open = false;
          resolve('action1');
        },
        onAction2: () => {
          userConfirmationState.props.open = false;
          resolve('action2');
        },
        onClose: () => {
          userConfirmationState.props.open = false;
          resolve(null);
        },
        // Keep onOk for backward compatibility but it won't be used
        onOk: emptyFunction,
      };
    });
  }

  // Single button mode (backward compatible)
  return new Promise<boolean>((resolve) => {
    userConfirmationState.props = {
      ...args,
      open: true,
      onOk: () => resolve(true),
      onClose: () => resolve(false),
    };
  });
}
