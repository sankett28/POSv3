# Color Usage Guide - Tailwind CSS v4

## Overview
This project uses Tailwind CSS v4 with a custom color system defined in `app/globals.css`. Colors are declared in two places:

1. **`:root`** - Raw color values (hex codes)
2. **`@theme inline`** - Tailwind utility class mappings

## How to Use Colors

### In TSX/JSX Components (Recommended)

Use Tailwind utility classes with the `color-` prefix:

```tsx
// Background colors
<div className="bg-coffee-brown">...</div>
<div className="bg-warm-cream">...</div>
<div className="bg-laalhai">...</div>
<div className="bg-card-background">...</div>

// Text colors
<p className="text-primary-text">...</p>
<p className="text-secondary-text">...</p>
<p className="text-muted-text">...</p>

// Border colors
<div className="border border-border">...</div>

// Brand colors
<button className="bg-brand-medium-red">...</button>
<div className="bg-brand-dusty-rose">...</div>

// Status colors
<span className="text-success">Success</span>
<span className="text-warning">Warning</span>
<span className="text-error">Error</span>
```

### In Custom CSS (When Needed)

Use CSS variables with `var()`:

```css
.custom-component {
  background: var(--coffee-brown);
  color: var(--primary-text);
  border: 1px solid var(--border);
}

.hover-effect:hover {
  background: var(--caramel);
}
```

## Available Colors

### Brand Colors
- `coffee-brown` / `brand-medium-red` - #912b48 (Primary CTA)
- `brand-deep-burgundy` - #610027 (Dark accent)
- `brand-dusty-rose` / `caramel` - #b45a69 (Hover states)
- `brand-light-pink` / `warm-cream` - #fff0f3 (Backgrounds)
- `laalhai` - #ff0000 (Special red)

### Background Colors
- `app-background` - #fff0f3 (Main app background)
- `card-background` - #ffffff (Card surfaces)
- `warm-cream` - #fff0f3 (Secondary background)

### Text Colors
- `primary-text` - #610027 (Main text)
- `secondary-text` - #6b6b6b (Secondary text)
- `muted-text` - #9ca3af (Muted/placeholder text)

### Accent Colors
- `leaf-green` - #4caf50 (Green accent)
- `soft-orange` - #912b48 (Orange/badge accent)

### Status Colors
- `success` - #22c55e (Success states)
- `warning` - #f59e0b (Warning states)
- `error` - #ef4444 (Error states)

### UI Colors
- `border` - #e5e7eb (Default borders)

### Gray Scale
- `gray-50` through `gray-900` (Standard gray palette)

## Examples

### Button Component
```tsx
// Primary button
<button className="bg-coffee-brown text-white hover:bg-brand-dusty-rose">
  Click Me
</button>

// Secondary button
<button className="bg-warm-cream text-primary-text border border-border">
  Cancel
</button>

// Success button
<button className="bg-success text-white">
  Save
</button>
```

### Card Component
```tsx
<div className="bg-card-background border border-border rounded-lg p-4">
  <h2 className="text-primary-text font-bold">Title</h2>
  <p className="text-secondary-text">Description</p>
  <span className="text-muted-text text-sm">Metadata</span>
</div>
```

### Status Badge
```tsx
<span className="bg-success text-white px-2 py-1 rounded">Active</span>
<span className="bg-warning text-white px-2 py-1 rounded">Pending</span>
<span className="bg-error text-white px-2 py-1 rounded">Failed</span>
```

## Migration from Hex Codes

If you have existing components using hex codes, replace them with utility classes:

```tsx
// Before
<div style={{ backgroundColor: '#912b48' }}>...</div>

// After
<div className="bg-coffee-brown">...</div>

// Before
<p style={{ color: '#610027' }}>...</p>

// After
<p className="text-primary-text">...</p>
```

## Notes

- Always prefer Tailwind utility classes over inline styles
- Use CSS variables (`var(--color-name)`) only in custom CSS files
- The `@theme inline` directive maps `:root` variables to Tailwind utilities
- All colors support opacity modifiers: `bg-coffee-brown/50` for 50% opacity
