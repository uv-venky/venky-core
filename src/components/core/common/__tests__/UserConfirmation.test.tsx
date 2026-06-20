/* Copyright (c) 2024-present Venky Corp. */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { emptyFunction } from '@/lib/core/common/isEmpty';
import UserConfirmation from '@/components/core/common/UserConfirmation';
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

describe('UserConfirmation', () => {
  beforeEach(() => {
    resetConfirmationState();
  });

  afterEach(() => {
    resetConfirmationState();
    vi.restoreAllMocks();
  });

  it('renders nothing when the dialog is closed', () => {
    const { container } = render(<UserConfirmation />);
    expect(container.firstChild).toBeNull();
  });

  it('shows title, body, and custom confirm/cancel labels in single-button mode', () => {
    userConfirmationState.props = {
      open: true,
      title: 'Incident Type Created Successfully',
      content: 'Do you want to assign default mappings to this incident type?',
      confirmButtonLabel: 'Yes',
      cancelButtonLabel: 'No',
      onOk: emptyFunction,
      onClose: emptyFunction,
    };

    render(<UserConfirmation />);

    expect(screen.getByText('Incident Type Created Successfully')).toBeInTheDocument();
    expect(screen.getByText('Do you want to assign default mappings to this incident type?')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-ok')).toHaveTextContent('Yes');
    expect(screen.getByTestId('confirm-cancel')).toHaveTextContent('No');
  });

  it('invokes onOk when the primary button is clicked', async () => {
    const user = userEvent.setup();
    const onOk = vi.fn();
    const onClose = vi.fn();

    userConfirmationState.props = {
      open: true,
      title: 'T',
      content: 'C',
      onOk,
      onClose,
    };

    render(<UserConfirmation />);
    await user.click(screen.getByTestId('confirm-ok'));

    expect(onOk).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('invokes onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOk = vi.fn();
    const onClose = vi.fn();

    userConfirmationState.props = {
      open: true,
      title: 'T',
      content: 'C',
      onOk,
      onClose,
    };

    render(<UserConfirmation />);
    await user.click(screen.getByTestId('confirm-cancel'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOk).not.toHaveBeenCalled();
  });

  it('invokes onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onOk = vi.fn();
    const onClose = vi.fn();

    userConfirmationState.props = {
      open: true,
      title: 'T',
      content: 'C',
      onOk,
      onClose,
    };

    render(<UserConfirmation />);
    await user.click(screen.getByRole('alertdialog'));
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOk).not.toHaveBeenCalled();
  });

  it('resolves confirmWithUser(true) on confirm and false on cancel', async () => {
    const user = userEvent.setup();

    const confirmPromise = confirmWithUser({
      title: 'Incident Type Created Successfully',
      content: 'Do you want to assign default mappings to this incident type?',
      confirmButtonLabel: 'Yes',
      cancelButtonLabel: 'No',
    });
    render(<UserConfirmation />);

    await user.click(await screen.findByTestId('confirm-ok'));
    await expect(confirmPromise).resolves.toBe(true);

    const cancelPromise = confirmWithUser({
      title: 'Incident Type Created Successfully',
      content: 'Do you want to assign default mappings to this incident type?',
      confirmButtonLabel: 'Yes',
      cancelButtonLabel: 'No',
    });
    await user.click(await screen.findByTestId('confirm-cancel'));
    await expect(cancelPromise).resolves.toBe(false);
  });

  it('shows two action buttons and invokes onAction1 / onAction2', async () => {
    const user = userEvent.setup();
    const onAction1 = vi.fn();
    const onAction2 = vi.fn();
    const onClose = vi.fn();

    userConfirmationState.props = {
      open: true,
      title: 'Choose',
      content: 'Pick one',
      action1Label: 'First',
      action2Label: 'Second',
      cancelButtonLabel: 'Back',
      onOk: emptyFunction,
      onClose,
      onAction1,
      onAction2,
    };

    render(<UserConfirmation />);

    expect(screen.getByTestId('confirm-action1')).toHaveTextContent('First');
    expect(screen.getByTestId('confirm-action2')).toHaveTextContent('Second');

    await user.click(screen.getByTestId('confirm-action1'));
    expect(onAction1).toHaveBeenCalledTimes(1);
    expect(onAction2).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('disables primary actions until confirmation text matches', async () => {
    const user = userEvent.setup();
    const onOk = vi.fn();

    userConfirmationState.props = {
      open: true,
      title: 'Delete',
      content: 'This cannot be undone.',
      confirmationText: 'DELETE',
      onOk,
      onClose: emptyFunction,
    };

    render(<UserConfirmation />);

    const ok = screen.getByTestId('confirm-ok');
    const input = screen.getByTestId('confirmation-text');

    expect(ok).toBeDisabled();

    await user.type(input, 'DELE');
    expect(ok).toBeDisabled();

    await user.type(input, 'TE');
    await waitFor(() => expect(ok).not.toBeDisabled());

    await user.click(ok);
    expect(onOk).toHaveBeenCalledTimes(1);
  });
});
