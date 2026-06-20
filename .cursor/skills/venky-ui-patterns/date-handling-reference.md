# Date Handling Reference

Timezone-safe date handling to prevent off-by-one day errors.

## The Problem

When JavaScript parses a date string in `YYYY-MM-DD` format (ISO date without time), it interprets it as **UTC midnight**. When displayed using local timezone methods, the date shifts **backwards** in western timezones.

```typescript
// ❌ WRONG - Causes timezone issues
const date = new Date('2025-05-11'); // Interpreted as UTC midnight
date.toLocaleDateString('en-US'); // May show "May 10, 2025" in US timezones!

// ❌ WRONG - Same issue
new Date(isoDateString).toLocaleString('en-US', { 
  month: 'long', 
  day: 'numeric', 
  year: 'numeric' 
});
```

## Solutions

### Option 1: Parse as Local Date (Recommended)

Parse date components manually to create a date in local timezone:

```typescript
// ✅ CORRECT - Parse as local date
function parseDateLocal(dateValue: string | Date): Date {
  // Handle Date objects (from database queries)
  if (dateValue instanceof Date) {
    return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
  }
  // Parse string format YYYY-MM-DD
  const [year, month, day] = dateValue.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

const date = parseDateLocal('2025-05-11');
date.toLocaleDateString('en-US'); // Correctly shows "May 11, 2025"
```

**Note:** Database queries may return Date objects instead of strings. Always handle both types.

### Option 2: Use UTC in Formatting

Specify `timeZone: 'UTC'` in formatting options:

```typescript
// ✅ CORRECT - Format as UTC
const date = new Date('2025-05-11');
date.toLocaleDateString('en-US', { timeZone: 'UTC' }); // "May 11, 2025"
```

### Option 3: Append Time to Force Local

```typescript
// ✅ CORRECT - Append time to parse as local
const date = new Date('2025-05-11T00:00:00');
date.toLocaleDateString('en-US'); // "May 11, 2025"
```

## Common Patterns

### Format Date for Display

```typescript
function formatDateLong(dateStr: string | Date): string {
  const date = parseDateLocal(dateStr);
  return date.toLocaleString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

// Usage
formatDateLong('2025-05-11'); // "May 11, 2025"
```

### Format Month/Year Only

```typescript
function formatMonthYear(dateStr: string | Date): string {
  const date = parseDateLocal(dateStr);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

// Usage
formatMonthYear('2025-05-11'); // "May 2025"
```

### Using UTC Methods Directly

```typescript
const formatDate = (date: string) => {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
```

### Compare Dates

```typescript
// String comparison works for ISO dates
const isAfter = dateStr1 > dateStr2; // Safe for YYYY-MM-DD

// For Date objects
const d1 = parseDateLocal(date1);
const d2 = parseDateLocal(date2);
const isAfter = d1.getTime() > d2.getTime();
```

### Get Today as ISO String

```typescript
const today = new Date().toISOString().split('T')[0];
// "2025-01-24"
```

## Best Practices

1. **Never use `new Date(isoDateString)` directly** when string is just a date (YYYY-MM-DD)
2. **Always use a helper function** like `parseDateLocal()` for consistent parsing
3. **Store dates as ISO strings** (YYYY-MM-DD) in database and API
4. **Parse to local timezone only at display time**
5. **Be explicit about timezone** - use `timeZone: 'UTC'` when in doubt

## Red Flags to Watch For

- `new Date('YYYY-MM-DD')` without time component
- `new Date(row.startDate)` where startDate is an ISO string
- Date formatting that doesn't use `parseDateLocal()` or `timeZone: 'UTC'`
- Tests passing in one timezone but failing in another
