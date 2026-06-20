/* Copyright (c) 2024-present Venky Corp. */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SecurityPanel } from '../../components/security-panel';
import type { DataSource } from '../../types';

const mockDataSource: DataSource = {
  id: 'test-ds',
  type: 'table',
  description: 'Test Data Source',
  readOnly: false,
  attributes: [
    {
      code: 'id',
      name: 'ID',
      type: 'Number',
      primary: true,
      select: true,
      insert: true,
    },
    { code: 'name', name: 'Name', type: 'Text', select: true, insert: true },
  ],
  access: [
    {
      roleCode: 'admin',
      query: true,
      insert: true,
      update: true,
      delete: true,
      export: true,
      audit: true,
    },
    {
      roleCode: 'user',
      query: true,
      insert: false,
      update: false,
      delete: false,
      export: false,
      audit: false,
    },
  ],
};

describe('SecurityPanel', () => {
  const defaultProps = {
    selectedDS: mockDataSource,
    roleCode: 'admin',
    setRole: vi.fn(),
    userName: 'testUser',
    roles: ['admin', 'user'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the security panel with correct structure', () => {
    render(<SecurityPanel {...defaultProps} />);

    // Should have Security Access and Identity Context sections
    expect(screen.getByText('Security Access')).toBeInTheDocument();
    expect(screen.getByText('Identity Context')).toBeInTheDocument();
  });

  it('shows role info when roleCode is provided', () => {
    render(<SecurityPanel {...defaultProps} />);

    expect(screen.getByText('Role:')).toBeInTheDocument();
    // The role name appears in the header info span
    const roleInfoSpan = screen.getByText('Role:').parentElement;
    expect(roleInfoSpan).toHaveTextContent('admin');
  });

  it('shows user info when roleCode is null', () => {
    render(<SecurityPanel {...defaultProps} roleCode={null} />);

    expect(screen.getByText('User:')).toBeInTheDocument();
    // The user name appears in the header info span
    const userInfoSpan = screen.getByText('User:').parentElement;
    expect(userInfoSpan).toHaveTextContent('testUser');
  });

  it('renders all access types', () => {
    render(<SecurityPanel {...defaultProps} />);

    const accessTypes = ['Query', 'Insert', 'Update', 'Delete', 'Export', 'Audit'];
    for (const accessType of accessTypes) {
      expect(screen.getByText(accessType)).toBeInTheDocument();
    }
  });

  it('shows granted access with green styling for admin role', () => {
    const { container } = render(<SecurityPanel {...defaultProps} />);

    // Admin has all permissions - all should have emerald styling
    const accessItems = container.querySelectorAll('.border-emerald-200');
    expect(accessItems.length).toBe(6);
  });

  it('shows mixed access for user role', () => {
    const { container } = render(<SecurityPanel {...defaultProps} roleCode="user" />);

    // User has only query permission
    const grantedItems = container.querySelectorAll('.border-emerald-200');
    const deniedItems = container.querySelectorAll('.border-red-200');

    expect(grantedItems.length).toBe(1); // Only query
    expect(deniedItems.length).toBe(5); // All others denied
  });

  it('displays username button', () => {
    render(<SecurityPanel {...defaultProps} />);

    const usernameButton = screen.getByRole('button', { name: /testUser/i });
    expect(usernameButton).toBeInTheDocument();
  });

  it('displays role buttons', () => {
    const { container } = render(<SecurityPanel {...defaultProps} />);

    // Find role buttons in the Available Roles section (they have gradient styling or border styling)
    const roleButtons = container.querySelectorAll('.from-violet-500, [class*="hover:border-violet-300"]');

    // Should have admin and user role buttons
    expect(roleButtons.length).toBe(2);

    const buttonTexts = Array.from(roleButtons).map((btn) => btn.textContent);
    expect(buttonTexts.some((text) => text?.includes('admin'))).toBe(true);
    expect(buttonTexts.some((text) => text?.includes('user'))).toBe(true);
  });

  it('filters out VENKY roles', () => {
    render(<SecurityPanel {...defaultProps} roles={['admin', 'user', 'root']} />);

    // root role should be filtered out
    const buttons = screen.getAllByRole('button');
    const rootButton = buttons.find((btn) => btn.textContent?.includes('root'));

    expect(rootButton).toBeUndefined();
  });

  it('calls setRole with null when username button is clicked', () => {
    const setRole = vi.fn();
    render(<SecurityPanel {...defaultProps} setRole={setRole} />);

    const usernameButton = screen.getByRole('button', { name: /testUser/i });
    fireEvent.click(usernameButton);

    expect(setRole).toHaveBeenCalledWith(null);
  });

  it('calls setRole when role button is clicked', () => {
    const setRole = vi.fn();
    render(<SecurityPanel {...defaultProps} setRole={setRole} />);

    // Find the user role button (the one in the Available Roles section)
    const buttons = screen.getAllByRole('button');
    const userRoleButton = buttons.find(
      (btn) => btn.textContent?.includes('user') && !btn.textContent?.includes('testUser'),
    );

    if (userRoleButton) {
      fireEvent.click(userRoleButton);
      expect(setRole).toHaveBeenCalledWith('user');
    }
  });

  it('highlights selected role button', () => {
    const { container } = render(<SecurityPanel {...defaultProps} roleCode="admin" />);

    // The selected role button should have gradient styling
    const gradientButtons = container.querySelectorAll('.from-violet-500');
    expect(gradientButtons.length).toBeGreaterThan(0);
  });

  it('highlights username button when roleCode is null', () => {
    const { container } = render(<SecurityPanel {...defaultProps} roleCode={null} />);

    // The username button should have cyan styling when selected
    const selectedUserButton = container.querySelector('.border-cyan-500');
    expect(selectedUserButton).toBeInTheDocument();
  });

  it('handles data source with no access defined', () => {
    const dataSourceWithoutAccess: DataSource = {
      ...mockDataSource,
      access: [],
    };

    const { container } = render(<SecurityPanel {...defaultProps} selectedDS={dataSourceWithoutAccess} />);

    // All access types should show as denied (red styling)
    const deniedItems = container.querySelectorAll('.border-red-200');
    expect(deniedItems.length).toBe(6);
  });

  it('shows Current User label', () => {
    render(<SecurityPanel {...defaultProps} />);

    expect(screen.getByText('Current User')).toBeInTheDocument();
  });

  it('shows Available Roles label when roles exist', () => {
    render(<SecurityPanel {...defaultProps} />);

    expect(screen.getByText('Available Roles')).toBeInTheDocument();
  });

  it('does not show Available Roles section when no filtered roles exist', () => {
    render(<SecurityPanel {...defaultProps} roles={['root']} />);

    // root is filtered out, so no roles should be shown
    expect(screen.queryByText('Available Roles')).not.toBeInTheDocument();
  });
});
