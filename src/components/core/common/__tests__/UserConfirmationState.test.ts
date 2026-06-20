/* Copyright (c) 2024-present Venky Corp. */

import { afterEach, describe, expect, it } from 'vitest';
import { emptyFunction } from '@/lib/core/common/isEmpty';
import { confirmWithUser, userConfirmationState } from '@/components/core/common/UserConfirmationState';

function resetConfirmationState() {
  userConfirmationState.props = {
    open: false,
    title: '',
    content: '',
    onOk: emptyFunction,
    onClose: emptyFunction,
  };
}

afterEach(() => {
  resetConfirmationState();
});

describe('confirmWithUser', () => {
  describe('incident type default mappings prompt (custom Yes / No labels)', () => {
    const incidentTypeArgs = {
      title: 'Incident Type Created Successfully',
      content: 'Do you want to assign default mappings to this incident type?',
      confirmButtonLabel: 'Yes',
      cancelButtonLabel: 'No',
    } as const;

    it('opens the dialog with the expected copy and button labels', async () => {
      const pending = confirmWithUser({ ...incidentTypeArgs });

      expect(userConfirmationState.props.open).toBe(true);
      expect(userConfirmationState.props.title).toBe(incidentTypeArgs.title);
      expect(userConfirmationState.props.content).toBe(incidentTypeArgs.content);
      expect(userConfirmationState.props.confirmButtonLabel).toBe('Yes');
      expect(userConfirmationState.props.cancelButtonLabel).toBe('No');

      userConfirmationState.props.onClose();
      await pending;
    });

    it('resolves true when the user confirms (Yes)', async () => {
      const pending = confirmWithUser({ ...incidentTypeArgs });
      userConfirmationState.props.onOk({} as never);
      await expect(pending).resolves.toBe(true);
    });

    it('resolves false when the user dismisses (No / cancel)', async () => {
      const pending = confirmWithUser({ ...incidentTypeArgs });
      userConfirmationState.props.onClose();
      await expect(pending).resolves.toBe(false);
    });
  });

  describe('single-button mode (default labels)', () => {
    it('resolves true on Ok and false on close', async () => {
      const okPending = confirmWithUser({
        title: 'Discard Changes?',
        content: 'Are you sure?',
      });
      userConfirmationState.props.onOk({} as never);
      await expect(okPending).resolves.toBe(true);

      resetConfirmationState();

      const cancelPending = confirmWithUser({
        title: 'Discard Changes?',
        content: 'Are you sure?',
      });
      userConfirmationState.props.onClose();
      await expect(cancelPending).resolves.toBe(false);
    });
  });

  describe('two-button mode (action1 / action2)', () => {
    it("resolves 'action1' when the first action is chosen", async () => {
      const pending = confirmWithUser({
        title: 'Choose',
        content: 'Pick one',
        action1Label: 'A',
        action2Label: 'B',
      });
      userConfirmationState.props.onAction1?.({} as never);
      await expect(pending).resolves.toBe('action1');
    });

    it("resolves 'action2' when the second action is chosen", async () => {
      const pending = confirmWithUser({
        title: 'Choose',
        content: 'Pick one',
        action1Label: 'A',
        action2Label: 'B',
      });
      userConfirmationState.props.onAction2?.({} as never);
      await expect(pending).resolves.toBe('action2');
    });

    it('resolves null when the dialog is closed without an action', async () => {
      const pending = confirmWithUser({
        title: 'Choose',
        content: 'Pick one',
        action1Label: 'A',
        action2Label: 'B',
      });
      userConfirmationState.props.onClose();
      await expect(pending).resolves.toBeNull();
    });
  });
});
