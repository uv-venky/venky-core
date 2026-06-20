/* Copyright (c) 2024-present VENKY Corp. */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SettingsIcon, PlusIcon, TrashIcon } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState, useTransition, useId } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { keys } from '@/lib/core/common/isEmpty';
import {
  usePivotColumnsContext,
  usePivotSettingsContext,
  usePivotSettingsSetterContext,
} from '@/components/core/pivot/PivotContext';
import type {
  Density,
  PivotSetting,
  CalculatedColumn,
  FormulaOperation,
  ValuesPosition,
} from '@/components/core/pivot/PivotTypes';
import { DENSITY_PROPS } from '@/components/core/pivot/PivotTypes';
import { type AggregatorNames, aggregators } from '@/components/core/pivot/PivotUtils';
import { ReorderableComboboxNoPopover } from '@/components/core/common/reorderable-combobox';

const DIMENSIONS = 'dimensions';
const PIVOTS = 'pivots';
const METRICS = 'metrics';
const UI = 'ui';

type TTabItem = 'dimensions' | 'pivots' | 'metrics' | 'ui';

const FORMULA_OPERATIONS: Array<{ value: FormulaOperation; label: string }> = [
  { value: 'sum', label: 'Sum' },
  { value: 'count', label: 'Count' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
  { value: 'uniqueCount', label: 'Unique Count' },
];

const MATH_OPERATORS: Array<{ value: '+' | '-' | '*' | '/' | '%'; label: string }> = [
  { value: '/', label: 'Divide (/)' },
  { value: '*', label: 'Multiply (*)' },
  { value: '+', label: 'Add (+)' },
  { value: '-', label: 'Subtract (-)' },
  { value: '%', label: 'Percentage (%)' },
];

function CalculatedColumnDialog<TColumnKey extends string>({
  open,
  onOpenChange,
  columns,
  calculatedColumn,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: ReadonlyArray<{ key: TColumnKey; label: string; dataType: string }>;
  calculatedColumn?: CalculatedColumn<TColumnKey>;
  onSave: (calcCol: CalculatedColumn<TColumnKey>) => void;
}) {
  const [name, setName] = useState(calculatedColumn?.name ?? '');
  const [numeratorOp, setNumeratorOp] = useState<FormulaOperation>(
    calculatedColumn?.formula.numerator.operation ?? 'sum',
  );
  const [numeratorColumn, setNumeratorColumn] = useState<TColumnKey | ''>(
    calculatedColumn?.formula.numerator.column ?? '',
  );
  const [denominatorOp, setDenominatorOp] = useState<FormulaOperation>(
    calculatedColumn?.formula.denominator.operation ?? 'count',
  );
  const [denominatorColumn, setDenominatorColumn] = useState<TColumnKey | ''>(
    calculatedColumn?.formula.denominator.column ?? '',
  );
  const [mathOperator, setMathOperator] = useState<'+' | '-' | '*' | '/' | '%'>(
    calculatedColumn?.formula.mathOperator ?? '/',
  );
  const [width, setWidth] = useState<number | ''>(calculatedColumn?.width ?? 200);

  useEffect(() => {
    if (calculatedColumn && calculatedColumn.formula.type === 'aggregation') {
      setName(calculatedColumn.name);
      setNumeratorOp(calculatedColumn.formula.numerator.operation);
      setNumeratorColumn(calculatedColumn.formula.numerator.column);
      setDenominatorOp(calculatedColumn.formula.denominator.operation);
      setDenominatorColumn(calculatedColumn.formula.denominator.column);
      setMathOperator(calculatedColumn.formula.mathOperator ?? '/');
      setWidth(calculatedColumn.width ?? 200);
    } else {
      setName('');
      setNumeratorOp('sum');
      setNumeratorColumn('');
      setDenominatorOp('count');
      setDenominatorColumn('');
      setMathOperator('/');
      setWidth(200);
    }
  }, [calculatedColumn, open]);

  const numberColumns = columns.filter((c) => c.dataType === 'Number');
  const allColumns = columns;

  const handleSave = () => {
    if (name && numeratorColumn && denominatorColumn) {
      const widthNum = typeof width === 'number' ? width : Number(width);
      onSave({
        id: calculatedColumn?.id ?? `calc-${Date.now()}`,
        name,
        width: Number.isFinite(widthNum) && widthNum >= 50 ? widthNum : undefined,
        formula: {
          type: 'aggregation',
          numerator: {
            operation: numeratorOp,
            column: numeratorColumn as TColumnKey,
          },
          denominator: {
            operation: denominatorOp,
            column: denominatorColumn as TColumnKey,
          },
          mathOperator: mathOperator === '/' ? undefined : mathOperator, // '/' is default
          // Don't set multiplier for '%' operator - it already multiplies by 100 internally
          multiplier: undefined,
        },
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{calculatedColumn ? 'Edit Calculated Column' : 'Add Calculated Column'}</DialogTitle>
          <DialogDescription>
            Create a calculated column using aggregations and math operations on value columns
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Column Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Conversion Rate" />
          </div>
          <div className="space-y-2">
            <Label>Width (px)</Label>
            <Input
              type="number"
              min={50}
              value={width === '' ? '' : width}
              onChange={(e) => {
                const v = e.target.value;
                setWidth(v === '' ? '' : Number(v));
              }}
              placeholder="200"
            />
          </div>
          <div className="space-y-2">
            <Label>Numerator</Label>
            <div className="flex gap-2">
              <Select value={numeratorOp} onValueChange={(value) => setNumeratorOp(value as FormulaOperation)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMULA_OPERATIONS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={numeratorColumn} onValueChange={(value) => setNumeratorColumn(value as TColumnKey)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {(numeratorOp === 'sum' || numeratorOp === 'avg' || numeratorOp === 'min' || numeratorOp === 'max'
                    ? numberColumns
                    : allColumns
                  ).map((col) => (
                    <SelectItem key={col.key} value={col.key}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Operator</Label>
            <Select value={mathOperator} onValueChange={(value) => setMathOperator(value as typeof mathOperator)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATH_OPERATORS.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Denominator</Label>
            <div className="flex gap-2">
              <Select value={denominatorOp} onValueChange={(value) => setDenominatorOp(value as FormulaOperation)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMULA_OPERATIONS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={denominatorColumn} onValueChange={(value) => setDenominatorColumn(value as TColumnKey)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {(denominatorOp === 'sum' ||
                  denominatorOp === 'avg' ||
                  denominatorOp === 'min' ||
                  denominatorOp === 'max'
                    ? numberColumns
                    : allColumns
                  ).map((col) => (
                    <SelectItem key={col.key} value={col.key}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || !numeratorColumn || !denominatorColumn}>
            {calculatedColumn ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PivotSettings<TColumnKey extends string>() {
  const columns = usePivotColumnsContext<TColumnKey>();
  const settings = usePivotSettingsContext<TColumnKey>();
  const [localSettings, setLocalSettings] = useState<PivotSetting<TColumnKey>>(settings);
  const applySettings = usePivotSettingsSetterContext<TColumnKey>();
  const [pending, startTransition] = useTransition();
  const [selectedTab, setSelectedTab] = useState<TTabItem>(DIMENSIONS);
  const [open, setOpen] = useState(false);
  const [calcColDialogOpen, setCalcColDialogOpen] = useState(false);
  const [editingCalcCol, setEditingCalcCol] = useState<CalculatedColumn<TColumnKey> | undefined>();
  const noneId = useId();

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const measures = columns.filter((c) => c.canBeMeasure === true);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="rounded-xl border-0 bg-transparent p-0" side="bottom" align="end">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Pivot Settings</CardTitle>
          </CardHeader>
          <CardContent className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 h-[calc(var(--radix-popover-content-available-height)-180px)] overflow-y-auto">
            <Tabs
              defaultValue={selectedTab}
              className="flex h-full min-h-0 flex-col"
              onValueChange={(value) => setSelectedTab(value as TTabItem)}
            >
              <TabsList className="mb-4 grid w-full grid-cols-4">
                <TabsTrigger value={DIMENSIONS}>Rows</TabsTrigger>
                <TabsTrigger value={PIVOTS}>Columns</TabsTrigger>
                <TabsTrigger value={METRICS}>Values</TabsTrigger>
                <TabsTrigger value={UI}>UI</TabsTrigger>
              </TabsList>
              <TabsContent value={DIMENSIONS} className="flex flex-1 flex-col overflow-hidden rounded-md border">
                <ReorderableComboboxNoPopover
                  onChange={(keys) => {
                    // @ts-expect-error keys is an array of TColumnKey
                    setLocalSettings((prevSettings) => ({
                      ...prevSettings,
                      rows: keys,
                    }));
                  }}
                  options={columns
                    .filter((c) => c.canBeRow !== false)
                    .map((column) => ({
                      value: column.key,
                      label: column.label,
                    }))}
                  values={localSettings.rows}
                />
              </TabsContent>
              <TabsContent value={PIVOTS} className="flex flex-1 flex-col overflow-hidden rounded-md border">
                <ReorderableComboboxNoPopover
                  onChange={(keys) => {
                    // @ts-expect-error keys is an array of TColumnKey
                    setLocalSettings((prevSettings) => ({
                      ...prevSettings,
                      cols: keys,
                    }));
                  }}
                  options={columns
                    .filter((c) => c.canBeColumn !== false)
                    .map((column) => ({
                      value: column.key,
                      label: column.label,
                    }))}
                  values={localSettings.cols}
                />
              </TabsContent>
              <TabsContent
                value={METRICS}
                className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex min-h-0 flex-1 flex-col overflow-y-auto rounded-md border"
              >
                <div className="min-h-[140px] shrink-0">
                  <ReorderableComboboxNoPopover
                    onChange={(keys) => {
                      // @ts-expect-error keys is an array of TColumnKey
                      setLocalSettings((prevSettings) => ({
                        ...prevSettings,
                        values: keys,
                      }));
                    }}
                    options={columns
                      .filter((c) => c.dataType === 'Number' && c.canBeValue !== false)
                      .map((column) => ({
                        value: column.key,
                        label: column.label,
                      }))}
                    values={localSettings.values}
                  />
                </div>
                {localSettings.values.length > 1 && (
                  <>
                    <Label className="mt-4 mb-2">Values Position</Label>
                    <RadioGroup
                      value={localSettings.valuesPosition ?? 'columns'}
                      onValueChange={(value) => {
                        setLocalSettings((prevSettings) => ({
                          ...prevSettings,
                          valuesPosition: value as ValuesPosition,
                        }));
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="columns" id="values-position-columns" />
                        <Label htmlFor="values-position-columns">Show as Columns</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rows" id="values-position-rows" />
                        <Label htmlFor="values-position-rows">Show as Rows</Label>
                      </div>
                    </RadioGroup>
                  </>
                )}
                {localSettings.cols.length > 0 &&
                  (localSettings.valuesPosition ?? 'columns') === 'columns' &&
                  (localSettings.values.length > 1 || (localSettings.calculatedColumns?.length ?? 0) > 0) && (
                    <div className="mt-4 flex items-start space-x-2">
                      <Checkbox
                        id="columns-before-values"
                        checked={localSettings.columnsBeforeValues !== false}
                        onCheckedChange={(checked) => {
                          setLocalSettings((prevSettings) => ({
                            ...prevSettings,
                            columnsBeforeValues: checked === true,
                          }));
                        }}
                      />
                      <div className="grid gap-1 leading-none">
                        <Label htmlFor="columns-before-values">Columns before Values</Label>
                        <p className="text-muted-foreground text-sm">
                          For each value measure, show column dimensions (e.g. channel, year). Uncheck for column
                          dimensions outermost with values nested.
                        </p>
                      </div>
                    </div>
                  )}
                {measures.length > 0 && (
                  <>
                    <Label className="mt-4 mb-2">Measure</Label>
                    <RadioGroup
                      defaultValue={localSettings.measure ?? 'none'}
                      onValueChange={(value) => {
                        setLocalSettings((prevSettings) => ({
                          ...prevSettings,
                          measure: value === 'none' ? undefined : (value as TColumnKey),
                        }));
                      }}
                    >
                      {measures.map((column) => (
                        <div className="flex items-center space-x-2" key={column.key}>
                          <RadioGroupItem value={column.key} id={column.key} />
                          <Label htmlFor={column.key}>{column.label}</Label>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id={noneId} />
                        <Label htmlFor={noneId}>None</Label>
                      </div>
                    </RadioGroup>
                  </>
                )}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Calculated Columns</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCalcCol(undefined);
                        setCalcColDialogOpen(true);
                      }}
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                  {localSettings.calculatedColumns && localSettings.calculatedColumns.length > 0 ? (
                    <div className="space-y-2">
                      {localSettings.calculatedColumns.map((calcCol) => (
                        <div key={calcCol.id} className="flex items-center justify-between rounded-md border p-2">
                          <div className="flex-1">
                            <div className="font-medium">{calcCol.name}</div>
                            {calcCol.formula.type === 'aggregation' && (
                              <div className="text-muted-foreground text-xs">
                                {FORMULA_OPERATIONS.find((o) => o.value === calcCol.formula.numerator.operation)
                                  ?.label ?? calcCol.formula.numerator.operation}
                                ({calcCol.formula.numerator.column}) {calcCol.formula.mathOperator ?? '/'}{' '}
                                {FORMULA_OPERATIONS.find((o) => o.value === calcCol.formula.denominator.operation)
                                  ?.label ?? calcCol.formula.denominator.operation}
                                ({calcCol.formula.denominator.column}){calcCol.formula.mathOperator === '%' && ' %'}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setEditingCalcCol(calcCol);
                                setCalcColDialogOpen(true);
                              }}
                            >
                              <SettingsIcon className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                const nextSettings = {
                                  ...localSettings,
                                  calculatedColumns: localSettings.calculatedColumns?.filter(
                                    (c) => c.id !== calcCol.id,
                                  ),
                                };
                                setLocalSettings(nextSettings);
                                setOpen(false);
                                startTransition(() => {
                                  applySettings(nextSettings);
                                });
                              }}
                            >
                              <TrashIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No calculated columns added</p>
                  )}
                </div>
              </TabsContent>
              <TabsContent
                value={UI}
                className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex min-h-0 flex-1 flex-col overflow-y-auto"
              >
                <Label className="mb-4 font-semibold">Density Preference</Label>
                <RadioGroup
                  onValueChange={(value) => {
                    setLocalSettings((prevSettings) => ({
                      ...prevSettings,
                      density: value as Density,
                    }));
                  }}
                  value={localSettings.density ?? 'default'}
                >
                  {(['default', 'roomy', 'compact', 'spacious'] as Density[]).map((density) => (
                    <div className="flex items-center space-x-2" key={density}>
                      <RadioGroupItem value={density} id={density} />
                      <Label htmlFor={density}>{DENSITY_PROPS[density].label}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="show-row-totals"
                      checked={localSettings.showRowTotals !== false}
                      onCheckedChange={(checked) => {
                        setLocalSettings((prevSettings) => ({
                          ...prevSettings,
                          showRowTotals: checked === true,
                        }));
                      }}
                    />
                    <div className="grid gap-1 leading-none">
                      <Label htmlFor="show-row-totals">Show row totals</Label>
                      <p className="text-muted-foreground text-sm">Show the row totals column on the right.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="show-column-totals"
                      checked={localSettings.showColumnTotals !== false}
                      onCheckedChange={(checked) => {
                        setLocalSettings((prevSettings) => ({
                          ...prevSettings,
                          showColumnTotals: checked === true,
                        }));
                      }}
                    />
                    <div className="grid gap-1 leading-none">
                      <Label htmlFor="show-column-totals">Show column totals</Label>
                      <p className="text-muted-foreground text-sm">Show the column totals row at the bottom.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="show-grand-total"
                      checked={localSettings.showGrandTotal !== false}
                      onCheckedChange={(checked) => {
                        setLocalSettings((prevSettings) => ({
                          ...prevSettings,
                          showGrandTotal: checked === true,
                        }));
                      }}
                    />
                    <div className="grid gap-1 leading-none">
                      <Label htmlFor="show-grand-total">Show grand total</Label>
                      <p className="text-muted-foreground text-sm">Show the grand total cell (bottom-right corner).</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-start space-x-2">
                  <Checkbox
                    id="flatten-layout"
                    checked={localSettings.flattenLayout ?? false}
                    onCheckedChange={(checked) => {
                      setLocalSettings((prevSettings) => ({
                        ...prevSettings,
                        flattenLayout: checked === true,
                      }));
                    }}
                  />
                  <div className="grid gap-1 leading-none">
                    <Label htmlFor="flatten-layout">Flatten pivot layout</Label>
                    <p className="text-muted-foreground text-sm">
                      Repeat row labels to mimic Excel&apos;s classic PivotTable layout.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            {selectedTab === METRICS ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{localSettings.aggregatorName}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {keys(aggregators).map((value) => (
                    <DropdownMenuCheckboxItem
                      key={value}
                      checked={localSettings.aggregatorName === value}
                      onCheckedChange={() => {
                        setLocalSettings((prevSettings) => ({
                          ...prevSettings,
                          aggregatorName: value as AggregatorNames,
                        }));
                      }}
                    >
                      {value}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex-1" />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                  startTransition(() => {
                    applySettings(localSettings);
                  });
                }}
                disabled={pending}
              >
                Apply
              </Button>
            </div>
          </CardFooter>
        </Card>
      </PopoverContent>
      <CalculatedColumnDialog
        open={calcColDialogOpen}
        onOpenChange={setCalcColDialogOpen}
        columns={columns}
        calculatedColumn={editingCalcCol}
        onSave={(calcCol) => {
          if (editingCalcCol) {
            // Update existing
            const nextSettings = {
              ...localSettings,
              calculatedColumns: localSettings.calculatedColumns?.map((c) => (c.id === calcCol.id ? calcCol : c)) ?? [
                calcCol,
              ],
            };
            setLocalSettings(nextSettings);
            setOpen(false);
            startTransition(() => {
              applySettings(nextSettings);
            });
          } else {
            // Add new
            const nextSettings = {
              ...localSettings,
              calculatedColumns: [...(localSettings.calculatedColumns ?? []), calcCol],
            };
            setLocalSettings(nextSettings);
            setOpen(false);
            startTransition(() => {
              applySettings(nextSettings);
            });
          }
        }}
      />
      {/* <LoadingModal isShown={pending} title="Reconfiguring..." subtitle="Processing your request" /> */}
    </Popover>
  );
}

export default React.memo(PivotSettings);
