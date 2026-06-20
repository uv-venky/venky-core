# UI Component Library

This directory contains reusable UI components built with Radix UI and Tailwind
CSS. These components form the foundation of the Venky UI system.

## Component Categories

### Layout Components

- **Accordion**: Vertically stacked sections that can be expanded/collapsed
- **AspectRatio**: Maintains consistent width/height ratio
- **Card**: Container for grouping related content
- **Collapsible**: Toggle the visibility of content
- **Drawer**: Slide-in panel for supplementary content
- **HoverCard**: Card that appears when hovering over a trigger
- **Resizable**: Resizable panels with draggable dividers
- **ScrollArea**: Custom scrollable container with consistent styling
- **Separator**: Visual divider between content
- **Sheet**: Modal dialog that slides in from the edge of the screen
- **Sidebar**: Application navigation component

### Form Controls

- **Button**: Action trigger with various styles and states
- **Checkbox**: Binary selection control
- **Form**: Form component with validation integration
- **Input**: Text input field
- **Input-OTP**: One-time password input
- **Label**: Text label for form controls
- **RadioGroup**: Group of mutually exclusive options
- **Select**: Dropdown selection control
- **Slider**: Range input control
- **Switch**: Toggle control
- **Textarea**: Multi-line text input field
- **ToggleGroup**: Set of two-state buttons

### Data Display

- **Avatar**: User profile image with fallback
- **Badge**: Small status indicator
- **Calendar**: Date picker and display
- **Carousel**: Rotating content display
- **Chart**: Data visualization component
- **Progress**: Visual indicator of progress
- **Table**: Data display in rows and columns
- **Tabs**: Tabbed interface for organizing content

### Overlay & Popups

- **AlertDialog**: Confirmation dialog that interrupts the user
- **Command**: Command palette for keyboard-driven interfaces
- **ContextMenu**: Right-click menu
- **Dialog**: Modal window for focused interactions
- **DropdownMenu**: Menu that appears from a trigger
- **Menubar**: Horizontal menu with dropdowns
- **NavigationMenu**: Hierarchical navigation component
- **Popover**: Floating content panel triggered by a button
- **Tooltip**: Short informational message on hover

### Feedback & Indicators

- **Alert**: Colored banner for status messages
- **Skeleton**: Loading placeholder
- **Sonner**: Toast notification system

## Usage Guidelines

### Importing Components

Import components directly from their file:

```tsx
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
```

### Component Props

Most components extend HTML element props and add additional functionality:

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}
```

### Composition Pattern

Components are designed to be composable:

```tsx
<Card>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Description>Card description here</Card.Description>
  </Card.Header>
  <Card.Content>
    <p>Main content here</p>
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>;
```

### Accessibility

All components are built with accessibility in mind:

- ARIA attributes are properly managed
- Keyboard navigation is supported
- Focus management is handled appropriately

### Theming

Components support light and dark mode through CSS variables. Use the
ThemeProvider component to enable theme switching.

## Custom Components

The `/venky` directory contains application-specific components built on top of
these UI primitives:

- **SmartSearch**: Advanced filtering and search interface
- **Pivot**: Data pivot tables and analysis
- **WaveDots**: Loading indicator animation
- **Combobox**: Enhanced searchable dropdown

## Examples

Check the `/app` directory for real-world usage examples of these components in
the application.
