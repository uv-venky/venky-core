---
name: venky-ui-patterns
description: UI components and styling patterns for forms, tables, and layouts. Use when creating forms with input fields, table columns, Popup dialogs, or when styling scrollable regions and grid layouts.
---

# Venky UI Patterns

Patterns for forms, input components, tables, and styling in VENKY applications.

## Input Field Components

Import from `venky-core/ui`:

| Component | Use Case |
|-----------|----------|
| `TextInput` | Text input with label |
| `NumberInput` | Number input |
| `DateInputField` | Date picker (has label built-in) |
| `SelectInput` | Dropdown select |
| `CheckboxInput` | Checkbox |
| `SwitchInput` | Toggle switch |
| `TextareaInput` | Multi-line text |
| `ComboboxInput` | Searchable dropdown |
| `AsyncComboboxInput` | Async searchable dropdown |

### Store-backed form fields (preferred)

Prefer `store={store}` and `attributeCode="fieldName"` for simple binding. Value, dirty state, and field errors are derived from the store. Use controlled `value`/`onChange` when you need custom logic (e.g. syncing two fields).

```typescript
import { TextInput, NumberInput, SelectInput, DateInputField } from 'venky-core/ui';
import { useCurrentRowSync, useIsStoreDirty, useIsStorePosting } from 'venky-core/ui';

function EntityForm({ store }: { store: Store<Entity> }) {
  const row = useCurrentRowSync(store);
  const isDirty = useIsStoreDirty(store);
  const isPosting = useIsStorePosting(store);

  if (!row) return null;

  return (
    <div className="grid gap-4">
      <TextInput label="Name" required store={store} attributeCode="name" />
      <NumberInput label="Amount" store={store} attributeCode="amount" />
      <SelectInput
        label="Status"
        store={store}
        attributeCode="status"
        options={[
          { value: 'draft', label: 'Draft' },
          { value: 'active', label: 'Active' },
        ]}
      />
      <DateInputField label="Start Date" store={store} attributeCode="startDate" />
      <Button disabled={isPosting || !isDirty}>Save</Button>
    </div>
  );
}
```

### Normalizing on blur (transformValue)

**TextInput**, **NumberInput**, and **DatePicker** support an optional store-backed-only prop `transformValue?: (value: T) => T`. On blur (or popover close for DatePicker), the component calls `transformed = transformValue(currentValue)` and writes to the store only if the result differs. Use for trim/lowercase email, rounding numbers, etc. It only affects the current attribute (cannot sync another field).

```typescript
<TextInput
  label="Email"
  store={store}
  attributeCode="email"
  transformValue={(v) => v?.trim().toLowerCase() ?? undefined}
/>
```

## ComboboxInput with Lookup Data

Use `ComboboxInput` for searchable dropdowns with master data or fixed options.

### Fixed Options (Constants)

```typescript
import { ComboboxInput } from 'venky-core/ui';
import { CURRENCY_OPTIONS } from '@/lib/common/ui-constants';

<ComboboxInput
  label="Currency"
  options={CURRENCY_OPTIONS}
  getLabel={(opt) => opt.label}
  getValue={(opt) => opt.value}
  value={row.currency ?? ''}
  onSelect={(v) => store.setValue('currency', v ?? '')}
  placeholder="Select currency..."
/>
```

### Dynamic Options (From Store)

For master data like customers, users, or projects, create an options hook:

```typescript
// hooks/use-customer-options.ts
export function useCustomerOptions() {
  const store = useStore<Customer>({
    datasourceId: 'Customers',
    page: 'page-name',
    alias: 'customer-options',
    limit: 1000,
    autoQuery: true,
    select: ['customerId', 'customerName'],
    sort: { customerName: 1 },
  });
  return { rows: useDBRows(store), isLoading: useIsStoreLoading(store) };
}

// In your form component
const { rows: customerOptions } = useCustomerOptions();

<ComboboxInput
  label="Customer"
  options={customerOptions}
  getLabel={(opt) => opt.customerName}
  getValue={(opt) => opt.customerId}
  value={row.customerId ?? ''}
  onSelect={(v) => store.setValue('customerId', v ?? '')}
  placeholder="Select customer..."
  searchPlaceholder="Search customers..."
/>
```

### ComboboxInput Props

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Field label |
| `options` | `T[]` | Array of option objects |
| `getLabel` | `(opt: T) => string` | Extract display text |
| `getValue` | `(opt: T) => string` | Extract value |
| `value` | `string` | Current selected value |
| `onSelect` | `(value: string \| null) => void` | Selection handler |
| `placeholder` | `string` | Placeholder when empty |
| `searchPlaceholder` | `string` | Search input placeholder |
| `labelOnTop` | `boolean` | Put label above input |

### Consistency with SmartSearch

When a field needs both form input AND SmartSearch filter, use the same options hook for both. See `venky-data-patterns` skill for SmartSearch Select column pattern.

## Optional Date Fields Pattern

For optional date fields (like project end date for ongoing projects):

### 1. Update TypeScript type

```typescript
// Make field optional with null
endDate?: ISODateString | null;
```

### 2. Update DataSource

```typescript
{
  ...DefaultAttribute,
  code: 'endDate',
  name: 'End Date',
  type: 'Date',
  column: 'end_date',
  excludeTime: true,
  optional: true,  // Add this
},
```

### 3. Form field - Remove required, add helpText with actual dates

```typescript
import { formatDateDisplay } from '@/lib/utils';

<DateInputField
  labelOnTop
  value={row.endDate ?? ''}
  onChange={(value) => store.setValue('endDate', value || null)}  // Pass null for empty
  label="End Date"
  helpText={`Defaults to project end (${project.endDate ? formatDateDisplay(project.endDate) : 'ongoing'})`}
/>
```

### 4. Display - Show "Ongoing" for null dates

```typescript
// In EditableField or display components
displayValue={project.endDate ? formatDateDisplay(project.endDate) : 'Ongoing'}
```

## Form Layout Patterns

### Grid Alignment

**Always use `items-start`** when placing form fields side by side to ensure proper vertical alignment when fields have different heights:

```typescript
// ✅ Correct - fields align at top
<div className="grid grid-cols-2 items-start gap-4">
  <TextInput label="Field 1" helpText="Has help text" />
  <ComboboxInput label="Field 2" />
</div>

// ❌ Incorrect - fields may misalign vertically
<div className="grid grid-cols-2 gap-4">
  <TextInput label="Field 1" helpText="Has help text" />
  <ComboboxInput label="Field 2" />
</div>
```

## Click-Outside with Radix UI Portals

When building custom components with click-outside-to-close behavior that contain Radix UI components (ComboboxInput, SelectInput, Popover, etc.), the dropdown menus render in portals outside your container. This causes click-outside handlers to incorrectly close when clicking dropdown options.

### The Problem

```typescript
// ❌ Broken - dropdown closes when clicking options
useEffect(() => {
  if (!isEditing) return;
  
  function handleClickOutside(e: MouseEvent) {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      handleCancel();  // Fires when clicking dropdown options!
    }
  }
  
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [isEditing, handleCancel]);
```

### The Solution

Check if the click target is inside a Radix portal before canceling:

```typescript
// ✅ Fixed - dropdown stays open for option selection
useEffect(() => {
  if (!isEditing) return;

  function handleClickOutside(e: MouseEvent) {
    // Don't close if clicking inside the container
    if (containerRef.current?.contains(e.target as Node)) {
      return;
    }
    // Don't close if clicking inside a Radix popover/dropdown (portal content)
    const target = e.target as HTMLElement;
    if (target.closest('[data-radix-popper-content-wrapper]') || target.closest('[role="listbox"]')) {
      return;
    }
    handleCancel();
  }

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [isEditing, handleCancel]);
```

### Key Selectors

| Selector | Purpose |
|----------|---------|
| `[data-radix-popper-content-wrapper]` | Radix UI's portal wrapper for popovers/dropdowns |
| `[role="listbox"]` | Combobox/Select dropdown list element |
| `[data-radix-menu-content]` | Radix DropdownMenu content |

## Popup Component (Dialogs)

Use `Popup` for resizable/movable dialogs with forms.

```typescript
import { Popup, showSuccess, showError } from 'venky-core/ui';

function EntityDialog({ open, onOpenChange, store, editingRow }: Props) {
  const row = useCurrentRowSync(store);
  const isDirty = useIsStoreDirty(store);
  const isPosting = useIsStorePosting(store);

  const handleSave = async () => {
    try {
      const success = await store.save();
      if (success) {
        showSuccess(editingRow ? 'Updated' : 'Created');
        onOpenChange(false);
      }
    } catch {
      showError('Failed to save');
    }
  };

  const handleClose = () => {
    store.resetStore();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Popup
      title={editingRow ? 'Edit Entity' : 'Add Entity'}
      onClose={handleClose}
      width={520}
      height={430}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isPosting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPosting || !isDirty || !row}>
            {isPosting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save
          </Button>
        </>
      }
    >
      {row && (
        <div className="grid gap-4">
          <TextInput label="Name" store={store} attributeCode="name" />
        </div>
      )}
    </Popup>
  );
}
```

### Popup Sizing Guidelines

| Form Size | Dimensions | Use Case |
|-----------|------------|----------|
| Small (3-4 fields) | ~520x430 | Simple forms |
| Medium (5-6 fields) | ~520x530 | Standard forms |
| Large (7+ fields) | ~560x580+ | Complex forms |
| Settings dialogs | ~720x850 | Multi-section dialogs |

## Scrollbar Styling

**All scrollable regions** should include these classes:

```
scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40
```

Example:

```typescript
<div className="overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
  {/* Scrollable content */}
</div>
```

## Table Columns Pattern

**Critical**: `row.original` only contains the row `id` - use styled cells or `useRowValue`.

### Styled Cell Components (Recommended)

Use pre-built styled cells from `venky-core/ui`:

```typescript
import {
  EntityNameCell,
  StatusBadgeCell,
  CodeCell,
  BadgeOutlineCell,
  NumericWithUnitsCell,
  PercentageCell,
  CompoundCell,
  HeaderCell,
  DataTableCell,
} from 'venky-core/ui';

export default function useTableColumns(store: Store<Entity>) {
  return useMemo(() => [
    {
      accessorKey: 'name',
      header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="name" title="Name" />,
      cell: (props) => <EntityNameCell attributeCode="name" preset="customer" useTableOnEdit {...props} />,
    },
    {
      accessorKey: 'status',
      header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="status" title="Status" />,
      cell: (props) => <StatusBadgeCell attributeCode="status" {...props} />,
    },
    {
      accessorKey: 'currency',
      header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="currency" title="Currency" />,
      cell: (props) => <BadgeOutlineCell attributeCode="currency" {...props} />,
    },
    {
      accessorKey: 'taxId',
      header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="taxId" title="Tax ID" />,
      cell: (props) => <CodeCell attributeCode="taxId" {...props} />,
    },
  ], [store]);
}
```

### Available Styled Cells

| Component | Use Case | Key Props |
|-----------|----------|-----------|
| `EntityNameCell` | Primary name with icon | `preset`, `useTableOnEdit` |
| `StatusBadgeCell` | Status with auto-colors | `statusConfig` |
| `CodeCell` | Monospace (IDs, codes) | `bgClass`, `textClass` |
| `BadgeOutlineCell` | Short values (currency) | `mono` |
| `NumericWithUnitsCell` | Number + unit | `unit`, `icon` |
| `PercentageCell` | Percentage values | `fractionDigits` |
| `CompoundCell` | Primary + secondary text | `primary`, `secondary`, `preset` |

### Entity Presets

`EntityNameCell` and `CompoundCell` support presets:
- `customer` - Building2, primary color
- `user` - User, blue
- `project` - FolderKanban, purple
- `vendor` - Store, emerald
- `document` - FileText, amber
- `task` - CheckSquare, cyan

> **Full Reference**: See [table-columns-reference.md](table-columns-reference.md) for complete examples and custom cell patterns.

## Multiple Action Buttons with Independent Spinners

When multiple buttons trigger the same async action with different parameters, use a typed state to track which specific action is loading. This shows the spinner only on the clicked button while disabling all buttons.

### Pattern: Track Action Type Instead of Boolean

```typescript
// ❌ Bad - both buttons show spinners simultaneously
const [isGenerating, setIsGenerating] = useState(false);

<Button disabled={isGenerating}>
  {isGenerating ? <Loader2 className="animate-spin" /> : <Save />}
  Save as Draft
</Button>
<Button disabled={isGenerating}>
  {isGenerating ? <Loader2 className="animate-spin" /> : <Send />}
  Save & Send
</Button>
```

```typescript
// ✅ Good - only clicked button shows spinner
const [savingStatus, setSavingStatus] = useState<'Draft' | 'Sent' | null>(null);

const handleSave = async (status: 'Draft' | 'Sent') => {
  setSavingStatus(status);
  try {
    await saveAction(status);
  } finally {
    setSavingStatus(null);
  }
};

<Button variant="outline" onClick={() => handleSave('Draft')} disabled={!!savingStatus}>
  {savingStatus === 'Draft' ? (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  ) : (
    <Save className="mr-2 h-4 w-4" />
  )}
  Save as Draft
</Button>
<Button onClick={() => handleSave('Sent')} disabled={!!savingStatus}>
  {savingStatus === 'Sent' ? (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  ) : (
    <Send className="mr-2 h-4 w-4" />
  )}
  Save & Send
</Button>
```

### Key Points

- Use a union type with `null` for the loading state (e.g., `'Draft' | 'Issued' | null`)
- Disable all buttons with `!!savingStatus` to prevent double-clicks
- Each button checks `savingStatus === 'ItsValue'` to show its own spinner
- Set state to the action type at start, `null` in finally block

## Date Display

**Use the date utilities from `@/lib/utils`** to avoid timezone issues:

```typescript
import { formatDateDisplay, formatDateShort, formatMonthYear, parseDateLocal } from '@/lib/utils';

// ❌ Wrong - timezone shifts the date
const formatted = new Date(row.startDate).toLocaleDateString();  // Off by one day!
const formatted = format(new Date(row.startDate), 'MMM dd, yyyy');  // Also wrong

// ✅ Correct - use utilities
const formatted = formatDateDisplay(row.startDate);     // "Jan 15, 2025"
const short = formatDateShort(row.startDate);           // "01/15/2025"
const monthYear = formatMonthYear(row.startDate);       // "Jan 2025"

// For date-fns operations (like differenceInDays), parse first:
const parsedDate = parseDateLocal(row.startDate);
const daysUntil = differenceInDays(parsedDate, new Date());
```

### Available Date Utilities

| Function | Output Example | Use Case |
|----------|---------------|----------|
| `formatDateDisplay(date)` | "Jan 15, 2025" | Default display |
| `formatDateShort(date)` | "01/15/2025" | Compact display |
| `formatDateLong(date)` | "January 15, 2025" | Formal display |
| `formatMonthYear(date)` | "Jan 2025" | Period display |
| `parseDateLocal(date)` | `Date` object | For date-fns operations |

## Additional Resources

- For table column patterns, see [table-columns-reference.md](table-columns-reference.md)
- For date handling, see [date-handling-reference.md](date-handling-reference.md)
