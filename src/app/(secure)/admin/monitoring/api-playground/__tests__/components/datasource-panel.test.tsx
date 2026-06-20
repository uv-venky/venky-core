/* Copyright (c) 2024-present Venky Corp. */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataSourcePanel } from '../../components/datasource-panel';
import type { DataSource } from '../../types';

// Mock dependencies
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, size, onClick, className, 'data-tip': dataTip }: any) => (
    <button
      type="button"
      data-testid="button"
      data-variant={variant}
      data-size={size}
      onClick={onClick}
      className={className}
      data-tip={dataTip}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/core/combobox', () => ({
  ComboboxField: ({ value, options, getValue, getLabel, onSelect, placeholder, getIcon }: any) => (
    <div data-testid="combobox" data-value={value} data-placeholder={placeholder}>
      <select data-testid="combobox-select" value={value || ''} onChange={(e) => onSelect(e.target.value || undefined)}>
        <option value="">{placeholder}</option>
        {options.map((option: any) => (
          <option key={getValue(option)} value={getValue(option)}>
            {getLabel(option)}
          </option>
        ))}
      </select>
      {/* Render icons for each option to test warning indicators */}
      {options.map((option: any) => (
        <div key={getValue(option)} data-testid={`option-icons-${getValue(option)}`}>
          {getIcon?.(option)}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/core/common/Notification', () => ({
  showInfo: vi.fn(),
}));

vi.mock('../../components/datasource-tab', () => ({
  isMissingPrimaryKey: vi.fn((ds) => ds?.attributes?.every((attr: any) => !attr.primary)),
  getWhoAttributesCount: vi.fn((ds) => {
    const whoAttrs = ['createdBy', 'createdAt', 'updatedBy', 'updatedAt'];
    return ds?.attributes?.filter((attr: any) => whoAttrs.includes(attr.code)).length ?? 0;
  }),
}));

const mockDataSources: DataSource[] = [
  {
    id: 'test-ds-1',
    type: 'table',
    description: 'Test Data Source 1',
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
      { code: 'createdBy', name: 'Created By', type: 'Text', select: true, insert: true },
      { code: 'createdAt', name: 'Created At', type: 'Date', select: true, insert: true },
      { code: 'updatedBy', name: 'Updated By', type: 'Text', select: true, insert: true },
      { code: 'updatedAt', name: 'Updated At', type: 'Date', select: true, insert: true },
    ],
    access: [
      {
        roleCode: 'admin',
        query: true,
        insert: true,
        update: true,
        delete: true,
      },
    ],
  },
  {
    id: 'test-ds-2',
    type: 'table',
    description: 'Test Data Source 2',
    readOnly: true,
    attributes: [
      {
        code: 'id',
        name: 'ID',
        type: 'Number',
        primary: false,
        select: true,
        insert: true,
      },
      { code: 'name', name: 'Name', type: 'Text', select: true, insert: true },
    ],
    access: [
      {
        roleCode: 'admin',
        query: true,
        insert: false,
        update: false,
        delete: false,
      },
    ],
  },
];

describe('DataSourcePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the panel with correct structure', () => {
    const setSelectedDataSource = vi.fn();
    render(
      <DataSourcePanel
        selectedDataSource="test-ds-1"
        setSelectedDataSource={setSelectedDataSource}
        dataSources={mockDataSources}
      />,
    );

    // Should have the header with title
    expect(screen.getByText('Data Source')).toBeInTheDocument();
    expect(screen.getByText('Select a source to explore')).toBeInTheDocument();
  });

  it('displays the correct title and description', () => {
    const setSelectedDataSource = vi.fn();
    render(
      <DataSourcePanel
        selectedDataSource="test-ds-1"
        setSelectedDataSource={setSelectedDataSource}
        dataSources={mockDataSources}
      />,
    );

    expect(screen.getByText('Data Source')).toBeInTheDocument();
    expect(screen.getByText('Select a source to explore')).toBeInTheDocument();
  });

  it('shows the correct number of data sources in badge', () => {
    const setSelectedDataSource = vi.fn();
    render(
      <DataSourcePanel
        selectedDataSource="test-ds-1"
        setSelectedDataSource={setSelectedDataSource}
        dataSources={mockDataSources}
      />,
    );

    const badges = screen.getAllByTestId('badge');
    const countBadge = badges.find((badge) => badge.textContent?.includes('2'));
    expect(countBadge).toBeInTheDocument();
  });

  it('renders combobox with correct value', () => {
    const setSelectedDataSource = vi.fn();
    render(
      <DataSourcePanel
        selectedDataSource="test-ds-1"
        setSelectedDataSource={setSelectedDataSource}
        dataSources={mockDataSources}
      />,
    );

    expect(screen.getByTestId('combobox')).toBeInTheDocument();
    expect(screen.getByTestId('combobox')).toHaveAttribute('data-value', 'test-ds-1');
  });

  it('renders download warnings button', () => {
    const setSelectedDataSource = vi.fn();
    render(
      <DataSourcePanel
        selectedDataSource="test-ds-1"
        setSelectedDataSource={setSelectedDataSource}
        dataSources={mockDataSources}
      />,
    );

    const buttons = screen.getAllByTestId('button');
    const downloadButton = buttons.find((button) => button.getAttribute('data-tip') === 'Download Warnings');
    expect(downloadButton).toBeInTheDocument();
  });

  it('calls setSelectedDataSource when combobox value changes', () => {
    const setSelectedDataSource = vi.fn();
    render(
      <DataSourcePanel
        selectedDataSource="test-ds-1"
        setSelectedDataSource={setSelectedDataSource}
        dataSources={mockDataSources}
      />,
    );

    const select = screen.getByTestId('combobox-select');
    fireEvent.change(select, { target: { value: 'test-ds-2' } });

    expect(setSelectedDataSource).toHaveBeenCalledWith('test-ds-2');
  });

  it('shows read-only indicator for read-only data sources', () => {
    const setSelectedDataSource = vi.fn();
    render(
      <DataSourcePanel
        selectedDataSource="test-ds-2"
        setSelectedDataSource={setSelectedDataSource}
        dataSources={mockDataSources}
      />,
    );

    // The read-only indicator should be in the option icons for test-ds-2
    const optionIcons = screen.getByTestId('option-icons-test-ds-2');
    expect(optionIcons).toBeInTheDocument();
    // Read-only data source should have the PencilOff icon indicator
    expect(optionIcons.querySelector('[data-tip="Read Only"]')).toBeInTheDocument();
  });

  it('shows missing primary key warning', () => {
    const setSelectedDataSource = vi.fn();
    render(
      <DataSourcePanel
        selectedDataSource="test-ds-2"
        setSelectedDataSource={setSelectedDataSource}
        dataSources={mockDataSources}
      />,
    );

    // test-ds-2 has no primary key
    const optionIcons = screen.getByTestId('option-icons-test-ds-2');
    expect(optionIcons.querySelector('[data-tip="Missing primary key"]')).toBeInTheDocument();
  });

  it('shows missing WHO attributes warning', () => {
    const setSelectedDataSource = vi.fn();
    render(
      <DataSourcePanel
        selectedDataSource="test-ds-2"
        setSelectedDataSource={setSelectedDataSource}
        dataSources={mockDataSources}
      />,
    );

    // test-ds-2 has no WHO attributes (0 out of 4)
    const optionIcons = screen.getByTestId('option-icons-test-ds-2');
    expect(optionIcons.querySelector('[data-tip="Missing 4 WHO attributes"]')).toBeInTheDocument();
  });

  it('does not show warnings for data source with all attributes', () => {
    const setSelectedDataSource = vi.fn();
    render(
      <DataSourcePanel
        selectedDataSource="test-ds-1"
        setSelectedDataSource={setSelectedDataSource}
        dataSources={mockDataSources}
      />,
    );

    // test-ds-1 has primary key and all WHO attributes
    const optionIcons = screen.getByTestId('option-icons-test-ds-1');
    expect(optionIcons.querySelector('[data-tip="Missing primary key"]')).not.toBeInTheDocument();
    expect(optionIcons.querySelector('[data-tip="Read Only"]')).not.toBeInTheDocument();
  });
});
