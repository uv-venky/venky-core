# Venky Custom Components

This directory contains specialized components that are specific to the Venky
application. These components are built on top of the base UI components but
provide additional functionality tailored to the application's needs.

## Component Categories

### Data Management Components

#### Smart Search System

The `smart-search` directory contains components for building advanced filtering
and query interfaces:

- **SmartSearch**: Main component that orchestrates the search experience
- **SearchInput**: Text input for entering search terms
- **ColumnList**: Display and selection of searchable columns
- **Entry/EntryEditor**: Components for creating and editing search filters
- **SavedSearch**: Save and load search configurations

```tsx
import { SmartSearch } from "~/components/core/smart-search";

<SmartSearch
  columns={columns}
  onSearch={handleSearch}
  savedSearchesKey="user-management-searches"
/>;
```

#### Pivot Table System

The `pivot` directory contains components for data analysis and pivot tables:

- **SimplePivotTable**: Basic pivot table with row/column grouping
- **PivotMultiGrid**: Advanced multi-dimensional grid for data analysis
- **PivotSettings**: Configuration panel for pivot table settings
- **PivotCsvDownloadButton**: Export pivot data to CSV
- **StoreCsvDownloadButton**: Export all rows from a data table based on current
  filters and visible columns, preserving column headers

```tsx
import { SimplePivotTable } from "~/components/core/pivot/SimplePivotTable";

<SimplePivotTable
  data={salesData}
  rows={["region", "salesPerson"]}
  columns={["product", "quarter"]}
  values={["amount", "quantity"]}
/>;
```

### State Management

#### MutX

The `mutX` directory contains utilities for immutable state management:

- **ImmutableTypes**: TypeScript types for immutable data structures
- **ImmutableUtils**: Helper functions for working with immutable data

```tsx
import { updateIn } from "~/components/core/mutX";

const newState = updateIn(state, ["users", userId, "preferences"], (prefs) => ({
  ...prefs,
  theme: "dark",
}));
```

### UI Elements

- **Combobox**: Enhanced dropdown with search functionality
- **DropdownMenu**: Customized dropdown menu with additional features
- **ReorderableCheckboxList**: Draggable and sortable list of checkboxes

### Common Components

The `common` directory contains general-purpose UI components:

- **CopyToClipboard**: Button to copy text to clipboard
- **EmptyState**: Placeholder for empty content areas
- **NoDataFound**: Message for when no data is available
- **Notification**: Toast notifications and alerts
- **Tooltip**: Enhanced tooltip with additional styling options
- **UserConfirmation**: Confirmation dialog for user actions
- **WaveDots**: Loading indicator animation

### Utility Hooks

The `hooks` directory contains custom React hooks:

- **useAnimationFrame**: Hook for animating with requestAnimationFrame
- **useAsyncConstant**: Load async data with proper loading states
- **useAutoSizer**: Automatic sizing based on container dimensions
- **useDebounce**: Debounce rapid function calls
- **useEvent**: Create stable event callbacks
- **useEventListener**: Simplified event listener management
- **useHandleClickOutside**: Detect clicks outside a component
- **useMediaQuery**: Responsive design with media query detection
- **useStoreFilters**: Persist and manage filter state
- **useWhyDidYouUpdate**: Development hook for tracking re-renders

## Usage Guidelines

### Importing Components

```tsx
// Import a specific component
import { SmartSearch } from "~/components/core/smart-search";

// Import a hook
import { useDebounce } from "~/components/core/hooks/useDebounce";
```

### State Management Pattern

Many components use a reducer pattern for complex state management:

```tsx
// In a component file
import { useSmartSearchReducer } from "~/components/core/smart-search/useSmartSearchReducer";

function MySearchComponent() {
  const [state, dispatch] = useSmartSearchReducer(initialState);

  return <SmartSearch state={state} dispatch={dispatch} />;
}
```

### Composition with Base UI

These components are designed to work seamlessly with the base UI components:

```tsx
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { SmartSearch } from "~/components/core/smart-search";

function MyComponent() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Advanced Search</Card.Title>
      </Card.Header>
      <Card.Content>
        <SmartSearch {...props} />
      </Card.Content>
      <Card.Footer>
        <Button>Clear All</Button>
      </Card.Footer>
    </Card>
  );
}
```

## Examples

For real-world usage examples, see the following application modules:

- `/src/app/admin/config/roles`: Role management using SmartSearch
- `/src/app/cdm/maintenance/ad-summary`: Data analysis with SimplePivotTable
- `/src/app/pricing/maintenance/price-plans`: Filter management with
  useStoreFilters
