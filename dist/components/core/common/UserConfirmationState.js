/* Copyright (c) 2023-present Venky Corp */
import { emptyFunction } from '../../../lib/core/common/isEmpty';
import { proxy } from 'valtio';
const defaultValue = {
  open: false,
  title: '',
  content: '',
  onOk: emptyFunction,
  onClose: emptyFunction,
};
export const userConfirmationState = proxy({ props: defaultValue });
// Implementation
export async function confirmWithUser(args) {
  // If two action buttons are provided, return the selected action
  if (args.action1Label && args.action2Label) {
    return new Promise((resolve) => {
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
  return new Promise((resolve) => {
    userConfirmationState.props = {
      ...args,
      open: true,
      onOk: () => resolve(true),
      onClose: () => resolve(false),
    };
  });
}
//# sourceMappingURL=UserConfirmationState.js.map
