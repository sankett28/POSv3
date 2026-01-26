# Design Document: Unified Theming System

## Overview

This design establishes a unified theming system for the application where all colors are defined as 6-7 core CSS variables in `globals.css`. The sidebar and all other components will reference only these core variables, ensuring that changing the core color values updates the entire application's appearance automatically. This eliminates hardcoded colors and creates a single source of truth for the application's color scheme.

## Architecture

### Core Color System

The theming system is based on a minimal set of CSS variables defined in the `:root` selector of `globals.css`:

```css
:root {
  /* Core Application Colors (6-7 variables) */
  --app-primary: #912b48;      /* Primary brand color for buttons, active states */
  --app-background: #fff0f3;   /* Main background color */
  --app-surface: #ffffff;      /* Card and surface backgrounds */
  --app-text: #1f2937;         /* Primary text color */
  --app-text-muted: #6b7280;   /* Secondary/muted text */
  --app-accent: #b45a69;       /* Accent color for highlights */
  --app-border: #e5e7eb;       /* Border and divider color */
}
```

### Component Color Mapping

All components (including the sidebar) will use only these core variables. No component-specific color variables or hardcoded values are allowed.

**Sidebar Color Mapping:**
- Background: `--app-surface`
- Active navigation item: `--app-primary`
- Hover state: `--app-accent` with opacity
- Text: `--app-text` and `--app-text-muted`
- Borders: `--app-border`
- Icons: Inherit from parent text color

**Mobile Header Color Mapping:**
- Background: `--app-surface`
- Text: `--app-text`
- Menu button hover: `--app-accent` with opacity
- Backdrop: `--app-text` with opacity

## Components and Interfaces

### 1. globals.css Updates

**Current State:**
The file currently has many color variables (50+) including brand-specific colors, legacy colors, and theme slots.

**Proposed Changes:**
1. Simplify to 6-7 core variables in `:root`
2. Remove or consolidate redundant color variables
3. Keep the core variables at the top for easy editing
4. Update Tailwind theme mapping to reference core variables

**Implementation:**
```css
:root {
  /* ===== CORE APPLICATION COLORS ===== */
  /* Edit these 6-7 colors to change the entire theme */
  --app-primary: #912b48;
  --app-background: #fff0f3;
  --app-surface: #ffffff;
  --app-text: #1f2937;
  --app-text-muted: #6b7280;
  --app-accent: #b45a69;
  --app-border: #e5e7eb;
}

@theme inline {
  /* Map core variables to Tailwind utilities */
  --color-app-primary: var(--app-primary);
  --color-app-background: var(--app-background);
  --color-app-surface: var(--app-surface);
  --color-app-text: var(--app-text);
  --color-app-text-muted: var(--app-text-muted);
  --color-app-accent: var(--app-accent);
  --color-app-border: var(--app-border);
}
```

### 2. Sidebar Component Updates

**File:** `frontend/components/layout/Sidebar.tsx`

**Current Issues:**
- Uses hardcoded Tailwind classes: `bg-gradient-to-b from-card-background to-warm-cream/95`
- Uses brand-specific colors: `bg-coffee-brown`, `text-coffee-brown`, `bg-brand-dusty-rose/10`
- Uses legacy color classes: `bg-warm-cream`, `text-primary-text`

**Proposed Changes:**
Replace all color classes with core variable references:

```tsx
// Sidebar container
className="bg-app-surface border-app-border"

// Sidebar header
className="bg-app-surface border-app-border"

// Active navigation item
className="bg-app-primary text-white"

// Inactive navigation item
className="text-app-text hover:bg-app-accent/10 hover:text-app-primary"

// Navigation icon container (active)
className="bg-white/15"

// Navigation icon container (inactive)
className="bg-app-surface/50"

// Logout button
className="text-app-text hover:bg-app-accent/10 hover:text-app-primary"
```

### 3. Mobile Header Updates

**Current Issues:**
- Uses `bg-card-background/95`
- Uses `text-coffee-brown`
- Uses `hover:bg-warm-cream/50`

**Proposed Changes:**
```tsx
// Mobile header
className="bg-app-surface/95 border-app-border"

// Menu button
className="text-app-text hover:bg-app-accent/10"

// Backdrop
className="bg-app-text/50"
```

### 4. Dashboard Layout Updates

**File:** `frontend/app/dashboard-layout.tsx`

**Current Issues:**
- Uses `bg-warm-cream` for main background

**Proposed Changes:**
```tsx
// Main container
className="bg-app-background"
```

## Data Models

No data models are required for this feature. The theming system operates entirely through CSS variables and component styling.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: CSS Variable Propagation

*For any* core CSS variable change in globals.css, when the variable value is updated, all components using that variable should reflect the new color value in their computed styles.

**Validates: Requirements 4.2, 5.1**

### Property 2: Active Navigation Styling

*For any* navigation item in the active state, the computed background color should match the value of `--app-primary`.

**Validates: Requirements 3.1**

### Property 3: Hover State Styling

*For any* navigation item in the hover state, the computed background color should use `--app-accent` with reduced opacity.

**Validates: Requirements 3.2**

### Property 4: Icon Color Inheritance

*For any* navigation icon element, the computed color should match its parent text element's color.

**Validates: Requirements 3.3**

### Property 5: Text Color Consistency

*For any* text element in the sidebar, the computed color should be either `--app-text` or `--app-text-muted`.

**Validates: Requirements 3.4**

### Property 6: Mobile-Desktop Consistency

*For any* color property in the sidebar, the computed value should be the same on mobile and desktop viewports (only layout should differ, not colors).

**Validates: Requirements 6.4**

## Error Handling

This feature primarily involves styling changes and does not require error handling logic. However, we should consider:

1. **Missing CSS Variables:** If a core variable is not defined, browsers will fall back to inherited values or initial values. To prevent this, ensure all core variables are defined in `:root`.

2. **Invalid Color Values:** If a developer enters an invalid color value (e.g., `#gggggg`), the browser will ignore it. The previous valid value will remain in effect.

3. **Browser Compatibility:** CSS custom properties are supported in all modern browsers. No fallback is needed for the target audience (modern web browsers).

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Sidebar Rendering:** Test that the sidebar renders with correct class names referencing core variables
2. **Active State:** Test that an active navigation item has the correct classes applied
3. **Mobile Header:** Test that the mobile header renders with correct core variable classes
4. **Color Class Validation:** Test that no hardcoded color classes remain in the components

### Property-Based Tests

Property-based tests will verify universal properties across all inputs. Each test should run a minimum of 100 iterations.

1. **Property 1: CSS Variable Propagation**
   - Generate random color values
   - Set core CSS variables to these values
   - Verify computed styles match the set values
   - **Tag:** Feature: sidebar-theming-fix, Property 1: CSS Variable Propagation

2. **Property 2: Active Navigation Styling**
   - Render sidebar with different active items
   - Verify active item background matches `--app-primary`
   - **Tag:** Feature: sidebar-theming-fix, Property 2: Active Navigation Styling

3. **Property 3: Hover State Styling**
   - Simulate hover on different navigation items
   - Verify hover background uses `--app-accent`
   - **Tag:** Feature: sidebar-theming-fix, Property 3: Hover State Styling

4. **Property 4: Icon Color Inheritance**
   - Render navigation items with icons
   - Verify icon color matches parent text color
   - **Tag:** Feature: sidebar-theming-fix, Property 4: Icon Color Inheritance

5. **Property 5: Text Color Consistency**
   - Render sidebar with various text elements
   - Verify all text uses either `--app-text` or `--app-text-muted`
   - **Tag:** Feature: sidebar-theming-fix, Property 5: Text Color Consistency

6. **Property 6: Mobile-Desktop Consistency**
   - Render sidebar at mobile and desktop viewports
   - Verify color values are identical across viewports
   - **Tag:** Feature: sidebar-theming-fix, Property 6: Mobile-Desktop Consistency

### Testing Tools

- **Unit Tests:** Jest + React Testing Library
- **Property Tests:** fast-check (JavaScript property-based testing library)
- **Visual Regression:** Chromatic or Percy (optional, for visual validation)

### Test Configuration

- Minimum 100 iterations per property test
- Test both light and dark themes (if dark mode is supported)
- Test on multiple viewport sizes (mobile, tablet, desktop)
