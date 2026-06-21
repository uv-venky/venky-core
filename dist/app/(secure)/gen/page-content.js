/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from 'react/jsx-runtime';
import {
  AsyncComboboxInput,
  BooleanInput,
  InputShell,
  MultiComboboxInput,
  SelectInput,
  TextInput,
} from '../../../components/core/page/fields';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { useEffect, useMemo, useState } from 'react';
import { genColumns, getTableNames } from './action';
import { showError, showSuccess } from '../../../components/core/common/Notification';
import { canBePrimaryKey } from './utils';
import { camelCase, kebabCase, startCase } from 'lodash-es';
import generate from './generate';
import { getErrorMessage, isErrorResponse } from '../../../lib/core/common/error';
import { Loader2 } from 'lucide-react';
import { ReorderableCombobox } from '../../../components/core/common/reorderable-combobox';
const defaultTemplateOptions = [
  {
    name: 'Simple',
    value: 'simple',
  },
  {
    name: 'Page Layout',
    value: 'page-layout',
    description: 'Default template for a page with a table and a form to edit the data',
  },
  {
    name: 'Table with Search',
    value: 'table-with-search',
    description: 'Use this template if you only need a table with search to be used in an existing page',
  },
];
export default function PageContent({ modules, subModules, templateOptions: templateOptionsProp }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [state, setState] = useState({
    moduleCode: modules[0].value,
    tableName: '',
    dsName: '',
    editable: false,
    template: 'page-layout',
    columns: [],
    fullPath: '',
    createPage: true,
    schemaName: '',
    pageRouteName: '',
    subModuleCode: subModules[0].value,
    columnOrder: [],
  });
  const templateOptions = useMemo(() => {
    return templateOptionsProp ? [...defaultTemplateOptions, ...templateOptionsProp] : defaultTemplateOptions;
  }, [templateOptionsProp]);
  const { tableName, schemaName } = state;
  useEffect(() => {
    genColumns(tableName, schemaName).then((columns) => {
      if (isErrorResponse(columns)) {
        showError(columns.message);
      } else {
        setState((state) => ({
          ...state,
          columns,
          columnOrder: columns.map((c) => c.name).sort(),
        }));
      }
    });
  }, [tableName, schemaName]);
  const pkColumns = useMemo(() => {
    return state.columns
      .filter((c) => canBePrimaryKey(c.type, c.maxLength))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [state.columns]);
  return _jsxs(Card, {
    className: 'mt-4 flex flex-1 flex-col overflow-hidden',
    children: [
      _jsx(CardHeader, { className: 'shrink-0', children: _jsx(CardTitle, { children: 'Code Generator' }) }),
      _jsx(CardContent, {
        className:
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 overflow-y-auto',
        children: _jsxs('div', {
          className: 'grid grid-cols-3 items-start gap-4',
          children: [
            _jsx(SelectInput, {
              label: 'Module',
              labelOnTop: true,
              required: true,
              options: modules,
              value: state.moduleCode,
              getValue: (option) => option.value,
              getLabel: (option) => option.label,
              onSelect: (value) => setState({ ...state, moduleCode: value ?? 'cop' }),
            }),
            _jsx(SelectInput, {
              label: 'Sub Module',
              labelOnTop: true,
              options: subModules,
              value: state.subModuleCode,
              getValue: (option) => option.value,
              getLabel: (option) => option.label,
              onSelect: (value) => setState({ ...state, subModuleCode: value ?? '' }),
              placeholder: 'Optionally select a sub module',
            }),
            _jsx(AsyncComboboxInput, {
              label: 'Table Name',
              labelOnTop: true,
              value: state.schemaName ? `${state.schemaName}.${state.tableName}` : '',
              onSelect: (_value, option) => {
                let defaultDSName = startCase(camelCase(option?.table_name ?? '')).replace(/\s+/g, '');
                if (
                  defaultDSName.charAt(2) === defaultDSName.charAt(2).toUpperCase() ||
                  defaultDSName.charAt(3) === defaultDSName.charAt(3).toUpperCase()
                ) {
                  defaultDSName = defaultDSName.slice(0, 3).toUpperCase() + defaultDSName.slice(3);
                }
                setState({
                  ...state,
                  tableName: option?.table_name ?? '',
                  schemaName: option?.table_schema ?? '',
                  dsName: defaultDSName,
                  pageRouteName: kebabCase(option?.table_name ?? ''),
                  createPage: true,
                });
              },
              required: true,
              getOptions: async (filter) => {
                const result = await getTableNames(filter);
                if (isErrorResponse(result)) {
                  showError(result.message);
                  return [];
                }
                return result;
              },
              getValue: (option) => `${option.table_schema}.${option.table_name}`,
              getLabel: (option) => `${option.table_schema}.${option.table_name} (${option.table_type})`,
              placeholder: 'Select a table',
              searchPlaceholder: 'Search for a table',
              minSearchLength: 2,
              emptyText: 'No tables found... enter at least 2 characters to search',
            }),
            state.tableName &&
              _jsxs(_Fragment, {
                children: [
                  _jsx(TextInput, {
                    label: 'Schema Name',
                    labelOnTop: true,
                    value: state.schemaName,
                    onChange: (value) => setState({ ...state, schemaName: value ?? '' }),
                    disabled: true,
                  }),
                  _jsx(MultiComboboxInput, {
                    label: 'Primary Key Columns',
                    labelOnTop: true,
                    value: state.columns.filter((column) => column.primary).map((column) => column.name),
                    onSelect: (value) =>
                      setState({
                        ...state,
                        columns: state.columns.map((column) => ({
                          ...column,
                          primary: value.includes(column.name),
                        })),
                      }),
                    options: pkColumns,
                    getValue: (option) => option.name,
                    getLabel: (option) => option.name,
                    required: true,
                  }),
                  _jsx(TextInput, {
                    label: 'Data Source Name',
                    labelOnTop: true,
                    value: state.dsName,
                    onChange: (value) => setState({ ...state, dsName: value ?? '' }),
                    required: true,
                  }),
                  _jsx(BooleanInput, {
                    label: 'Create Page',
                    labelOnTop: true,
                    value: state.createPage,
                    onChange: (value) => setState({ ...state, createPage: value }),
                  }),
                ],
              }),
            state.tableName &&
              state.dsName &&
              state.createPage &&
              _jsxs(_Fragment, {
                children: [
                  _jsx(BooleanInput, {
                    label: 'Editable',
                    labelOnTop: true,
                    value: state.editable,
                    onChange: (value) => setState({ ...state, editable: value }),
                  }),
                  _jsx(TextInput, {
                    label: 'Page Route Name',
                    labelOnTop: true,
                    value: state.pageRouteName,
                    onChange: (value) => setState({ ...state, pageRouteName: value ?? '' }),
                    required: true,
                  }),
                  _jsx(SelectInput, {
                    className: 'col-span-3',
                    label: 'Template',
                    labelOnTop: true,
                    required: true,
                    helpText: 'Select the template to use',
                    options: templateOptions,
                    value: state.template,
                    getValue: (option) => option.value,
                    getLabel: (option) => `${option.name}${option.description ? ` - ${option.description}` : ''}`,
                    onSelect: (value) => setState({ ...state, template: value ?? 'pageLayout' }),
                  }),
                  _jsx(InputShell, {
                    label: 'Column Order',
                    labelOnTop: true,
                    helpText: 'Select the columns to display in the order you want',
                    className: 'col-span-3',
                    children: ({ id }) =>
                      _jsx(ReorderableCombobox, {
                        id: id,
                        options: state.columns.map((c) => ({
                          value: c.name,
                          label: c.name,
                        })),
                        values: state.columnOrder,
                        onChange: (keys) => {
                          setState({ ...state, columnOrder: keys });
                        },
                        emptyMessage: 'No columns found',
                        placeholder: 'Columns',
                        getDisplayLabel: () => {
                          return state.columnOrder.join(', ');
                        },
                      }),
                  }),
                ],
              }),
          ],
        }),
      }),
      _jsx(CardFooter, {
        className: 'flex shrink-0 justify-end',
        children: _jsxs(Button, {
          disabled:
            isGenerating ||
            !state.tableName ||
            !state.dsName ||
            !state.pageRouteName ||
            !state.columns.find((c) => c.primary),
          onClick: async () => {
            setIsGenerating(true);
            try {
              await generate(state);
              if (state.createPage) {
                // router.push(
                //   `/${state.moduleCode}${state.subModuleCode ? `/${state.subModuleCode}` : ''}/${state.pageRouteName}`,
                // );
                setTimeout(
                  () => {
                    showSuccess(
                      'Page files generated successfully. Add the new page to the sidebar menu manually to access it.',
                    );
                  },
                  state.createPage ? 3000 : 0,
                );
              } else {
                showSuccess('Data Source and Type files generated successfully.');
              }
            } catch (error) {
              showError(getErrorMessage(error));
            } finally {
              setIsGenerating(false);
            }
          },
          children: [isGenerating && _jsx(Loader2, { className: 'h-4 w-4 animate-spin' }), ' Generate'],
        }),
      }),
    ],
  });
}
//# sourceMappingURL=page-content.js.map
