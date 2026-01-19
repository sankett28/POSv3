# Hex Code to Color Variable Mapping

## Color Mapping Reference

Use this guide to replace hex codes with Tailwind utility classes or CSS variables.

### Brand Colors
| Hex Code | CSS Variable | Tailwind Class | Usage |
|----------|--------------|----------------|-------|
| `#610027` | `var(--brand-deep-burgundy)` or `var(--primary-text)` | `bg-brand-deep-burgundy` or `text-primary-text` | Deep burgundy text/backgrounds |
| `#912B48` or `#912b48` | `var(--coffee-brown)` | `bg-coffee-brown` | Primary buttons, headers |
| `#B45A69` or `#b45a69` | `var(--brand-dusty-rose)` or `var(--caramel)` | `bg-brand-dusty-rose` | Hover states, accents |
| `#FFF0F3` or `#fff0f3` | `var(--warm-cream)` or `var(--app-background)` | `bg-warm-cream` | Light backgrounds |
| `#ff0000` | `var(--laalhai)` | `bg-laalhai` | Special red |

### Neutrals
| Hex Code | CSS Variable | Tailwind Class | Usage |
|----------|--------------|----------------|-------|
| `#FFFFFF` or `#ffffff` | `var(--card-background)` | `bg-card-background` | White cards/surfaces |
| `#E5E7EB` or `#e5e7eb` | `var(--border)` | `border-border` | Borders |
| `#F9F9F9` or `#f9f9f9` | `var(--warm-cream)` | `bg-warm-cream` | Light gray backgrounds |
| `#fdfdfd` | `var(--card-background)` | `bg-card-background` | Near-white backgrounds |

### Text Colors
| Hex Code | CSS Variable | Tailwind Class | Usage |
|----------|--------------|----------------|-------|
| `#610027` | `var(--primary-text)` | `text-primary-text` | Main text |
| `#6B6B6B` or `#6b6b6b` | `var(--secondary-text)` | `text-secondary-text` | Secondary text |
| `#9CA3AF` or `#9ca3af` | `var(--muted-text)` | `text-muted-text` | Muted/placeholder text |
| `#4C1D3D` or `#4c1d3d` | `var(--primary-text)` | `text-primary-text` | Dark text (use primary-text) |

### Accent Colors
| Hex Code | CSS Variable | Tailwind Class | Usage |
|----------|--------------|----------------|-------|
| `#4CAF50` or `#4caf50` | `var(--leaf-green)` | `bg-leaf-green` | Green accents |
| `#FFBB94` or `#ffbb94` | Custom | `bg-[#FFBB94]` | Cream accent (add to globals if needed) |
| `#FB9590` or `#fb9590` | Custom | `bg-[#FB9590]` | Soft pink (add to globals if needed) |

### Status Colors
| Hex Code | CSS Variable | Tailwind Class | Usage |
|----------|--------------|----------------|-------|
| `#22C55E` or `#22c55e` | `var(--success)` | `bg-success` or `text-success` | Success states |
| `#F59E0B` or `#f59e0b` | `var(--warning)` | `bg-warning` or `text-warning` | Warning states |
| `#EF4444` or `#ef4444` | `var(--error)` | `bg-error` or `text-error` | Error states |

## Replacement Patterns

### In className (Tailwind)
```tsx
// Before
className="bg-[#912B48] text-[#610027] border-[#E5E7EB]"

// After
className="bg-coffee-brown text-primary-text border-border"
```

### In style prop (CSS Variables)
```tsx
// Before
style={{ background: '#FFF0F3', color: '#610027' }}

// After
style={{ background: 'var(--warm-cream)', color: 'var(--primary-text)' }}
```

### In CSS/styled-jsx
```css
/* Before */
background: #912B48;
color: #610027;
border: 1px solid #E5E7EB;

/* After */
background: var(--coffee-brown);
color: var(--primary-text);
border: 1px solid var(--border);
```

## Common Replacements

### Backgrounds
- `bg-[#FFF0F3]` → `bg-warm-cream`
- `bg-[#FFFFFF]` → `bg-card-background` or `bg-white`
- `bg-[#912B48]` → `bg-coffee-brown`
- `bg-[#610027]` → `bg-brand-deep-burgundy`

### Text
- `text-[#610027]` → `text-primary-text`
- `text-[#6B6B6B]` → `text-secondary-text`
- `text-[#9CA3AF]` → `text-muted-text`
- `text-[#4C1D3D]` → `text-primary-text`

### Borders
- `border-[#E5E7EB]` → `border-border`

### Hover States
- `hover:bg-[#B45A69]/10` → `hover:bg-brand-dusty-rose/10`
- `hover:text-[#6B6B6B]` → `hover:text-secondary-text`

### Focus States
- `focus:ring-[#912B48]` → `focus:ring-coffee-brown`
- `focus:border-[#912B48]` → `focus:border-coffee-brown`
