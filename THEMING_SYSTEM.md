# Multi-Tenant Theming System

## Overview

Production-grade, backend-driven UI theming system for multi-tenant POS/SaaS application.

**Key Features:**
- ✅ Runtime CSS variable injection (no Tailwind rebuilds)
- ✅ Backend-authoritative validation (LLM-assisted but backend-controlled)
- ✅ Semantic color slots (not arbitrary names)
- ✅ WCAG 2.0 contrast validation
- ✅ Full audit trail for compliance
- ✅ Row-level security (RLS) for multi-tenancy
- ✅ Graceful fallback to defaults

## Architecture

### Design Principles

1. **Themes are data, not code** - Colors stored in database, not in CSS files
2. **Backend is authoritative** - All validation happens server-side
3. **Semantic-first** - Use role-based slots (primary, foreground) not arbitrary names
4. **Safe by default** - Contrast validation, RLS, audit logs
5. **No runtime mutations** - Never edit CSS files at runtime

### Technology Stack

- **Database**: Supabase (Postgres + RLS)
- **Backend**: FastAPI (Python)
- **Frontend**: Next.js + Tailwind CSS v4
- **Validation**: WCAG 2.0 contrast ratios
- **Future**: brand.dev API + LLM for auto-generation

## Database Schema

### Tables

#### `businesses`
Core tenant/business entity.

```sql
CREATE TABLE businesses (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    website_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `business_themes`
Semantic color storage (one per business).

```sql
CREATE TABLE business_themes (
    id UUID PRIMARY KEY,
    business_id UUID UNIQUE REFERENCES businesses(id),
    
    -- Core semantic slots (REQUIRED)
    primary_color VARCHAR(7) NOT NULL,      -- #RRGGBB
    secondary_color VARCHAR(7) NOT NULL,
    background_color VARCHAR(7) NOT NULL,
    foreground_color VARCHAR(7) NOT NULL,
    
    -- Optional semantic slots
    accent_color VARCHAR(7),
    danger_color VARCHAR(7),
    success_color VARCHAR(7),
    warning_color VARCHAR(7),
    
    -- Metadata
    source VARCHAR(20) DEFAULT 'manual',    -- manual | auto_generated | brand_api
    source_url VARCHAR(500),
    is_validated BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Validation Rules:**
- All colors must be 6-digit hex codes (`^#[0-9A-Fa-f]{6}$`)
- Foreground/background contrast ≥ 4.5:1 (WCAG AA normal text)
- Primary/background contrast ≥ 3.0:1 (WCAG AA large text)
- Colors must be distinct (not identical)

#### `theme_audit_log`
Immutable audit trail for compliance.

```sql
CREATE TABLE theme_audit_log (
    id UUID PRIMARY KEY,
    business_id UUID REFERENCES businesses(id),
    changed_by_user_id UUID,
    changed_by_email VARCHAR(255),
    old_theme JSONB,
    new_theme JSONB NOT NULL,
    change_type VARCHAR(20),  -- created | updated | deleted | auto_generated
    change_reason TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Backend API

### Endpoints

#### `GET /api/v1/themes`
Get theme for current business.

**Response:**
```json
{
  "primary": "#912b48",
  "secondary": "#ffffff",
  "background": "#fff0f3",
  "foreground": "#610027",
  "accent": "#b45a69",
  "danger": "#ef4444",
  "success": "#22c55e",
  "warning": "#f59e0b"
}
```

Returns empty object `{}` if no theme configured (frontend uses defaults).

#### `PUT /api/v1/themes`
Create or update theme.

**Request:**
```json
{
  "primary_color": "#912b48",
  "secondary_color": "#ffffff",
  "background_color": "#fff0f3",
  "foreground_color": "#610027",
  "accent_color": "#b45a69",
  "danger_color": "#ef4444",
  "success_color": "#22c55e",
  "warning_color": "#f59e0b",
  "source": "manual"
}
```

**Validation:**
- Hex format validation
- Contrast ratio validation (WCAG 2.0 AA)
- Color distinctness check

**Response:** `422 Unprocessable Entity` if validation fails with detailed errors.

#### `PATCH /api/v1/themes`
Partially update theme (only specified fields).

#### `DELETE /api/v1/themes`
Delete theme (logged to audit trail).

#### `POST /api/v1/themes/validate`
Validate theme without saving (for live validation in UI).

**Response:**
```json
{
  "is_valid": true,
  "errors": [],
  "warnings": ["Foreground/background contrast is below AAA standard"],
  "contrast_ratios": {
    "foreground_background": 8.5,
    "primary_background": 4.2
  }
}
```

#### `GET /api/v1/themes/audit`
Get audit logs for current business (last 50 changes).

### Validation Logic

**Color Validation** (`app/utils/color_validation.py`):
- `is_valid_hex()` - Validate hex format
- `contrast_ratio()` - Calculate WCAG 2.0 contrast ratio
- `validate_contrast()` - Check minimum contrast requirements
- `validate_theme_colors()` - Comprehensive theme validation

**Contrast Requirements:**
- Foreground/background: ≥ 4.5:1 (AA normal text)
- Primary/background: ≥ 3.0:1 (AA large text)
- AAA standard (recommended): ≥ 7.0:1

## Frontend Integration

### CSS Architecture

**globals.css** defines semantic slots:

```css
:root {
  /* Runtime dynamic theme slots */
  --theme-primary: #912b48;
  --theme-secondary: #ffffff;
  --theme-background: #fff0f3;
  --theme-foreground: #610027;
  --theme-accent: #b45a69;
  --theme-danger: #ef4444;
  --theme-success: #22c55e;
  --theme-warning: #f59e0b;
}

@theme inline {
  /* Tailwind v4 bridge */
  --color-primary: var(--theme-primary);
  --color-secondary: var(--theme-secondary);
  --color-background: var(--theme-background);
  --color-foreground: var(--theme-foreground);
  --color-accent: var(--theme-accent);
  --color-danger: var(--theme-danger);
  --color-success: var(--theme-success);
  --color-warning: var(--theme-warning);
}
```

### Theme Utilities

**lib/theme.ts** provides runtime theme management:

```typescript
// Fetch theme from backend
const theme = await fetchTheme()

// Apply theme (sets CSS variables on document root)
applyTheme(theme)

// Initialize on app bootstrap
await initializeTheme()

// Save theme
await saveTheme(theme)

// Validate theme
const validation = await validateTheme(theme)

// Reset to defaults
resetTheme()
```

### Component Usage

**Use semantic Tailwind utilities:**

```tsx
// ✅ CORRECT - Semantic utilities
<button className="bg-primary text-white hover:bg-accent">
  Click me
</button>

<div className="bg-background text-foreground">
  Content
</div>

// ❌ WRONG - Hardcoded colors
<button className="bg-[#912b48]">Click me</button>
```

### App Bootstrap

**app/layout.tsx** initializes theme:

```tsx
'use client'
import { useEffect } from 'react'
import { initializeTheme } from '@/lib/theme'

export default function RootLayout({ children }) {
  useEffect(() => {
    initializeTheme() // Fetch and apply theme on mount
  }, [])
  
  return <html>{children}</html>
}
```

## Theme Editor UI

**Location:** `/settings/theme`

**Features:**
- Color pickers for all semantic slots
- Live preview (applies theme before saving)
- Real-time validation with error/warning display
- Contrast ratio display
- Save & reset actions

**Component:** `components/ui/ThemeEditor.tsx`

## Migration Guide

### Running the Migration

```bash
# Apply migration
psql -h <supabase-host> -U postgres -d postgres -f POSv3/backend/supabase/migrations/010_add_business_theme_system.sql
```

**What it does:**
1. Creates `businesses`, `business_themes`, `theme_audit_log` tables
2. Enables RLS on all tables
3. Creates default business with existing brand colors
4. Logs initial theme creation to audit trail

### Single-Tenant to Multi-Tenant

Current system is single-tenant. Migration creates:
- Default business: `00000000-0000-0000-0000-000000000001`
- Default theme: Existing Lichy Cafe brand colors

**Future multi-tenant support:**
- Add user-business relationship table
- Update RLS policies to filter by business membership
- Extract business_id from JWT token in API

## Security

### Row-Level Security (RLS)

**Read Access:**
- All authenticated users can read themes (for UI rendering)
- TODO: Restrict to business members only

**Write Access:**
- Only service role can write themes (backend API only)
- Prevents direct database manipulation
- Enforces backend validation

### Audit Trail

All theme changes logged with:
- Business ID
- User email
- Old/new theme snapshots
- Change type (created/updated/deleted/auto_generated)
- IP address
- Timestamp

## Future Enhancements

### Phase 3: LLM-Assisted Generation

**Planned features:**
1. **brand.dev API integration** - Extract palette from website URL
2. **LLM semantic mapping** - Map unordered palette to semantic slots
3. **Backend validation** - Re-validate and fix unsafe LLM suggestions
4. **Admin approval** - Preview before saving

**Implementation notes:**
- LLM is suggestive, backend is authoritative
- Never trust LLM output without validation
- Always re-validate contrast ratios
- Log source as `auto_generated` or `brand_api`

### Additional Features

- [ ] Theme templates/presets
- [ ] Dark mode support
- [ ] Advanced color adjustments (saturation, brightness)
- [ ] Theme versioning and rollback
- [ ] A/B testing support
- [ ] Export/import themes

## Testing

### Backend Tests

```bash
cd POSv3/backend
pytest app/tests/test_theme_validation.py
pytest app/tests/test_theme_api.py
```

### Frontend Tests

```bash
cd POSv3/frontend
npm test -- theme.test.ts
```

### Manual Testing

1. **Theme Editor:**
   - Navigate to `/settings/theme`
   - Change colors and verify live preview
   - Test validation with invalid colors
   - Save and verify persistence

2. **API Testing:**
   ```bash
   # Get theme
   curl http://localhost:8000/api/v1/themes
   
   # Validate theme
   curl -X POST http://localhost:8000/api/v1/themes/validate \
     -H "Content-Type: application/json" \
     -d '{"primary_color": "#912b48", ...}'
   
   # Save theme
   curl -X PUT http://localhost:8000/api/v1/themes \
     -H "Content-Type: application/json" \
     -d '{"primary_color": "#912b48", ...}'
   ```

## Troubleshooting

### Theme not applying

1. Check browser console for errors
2. Verify API is accessible: `curl http://localhost:8000/api/v1/themes`
3. Check CSS variables in DevTools: Inspect `document.documentElement.style`
4. Verify theme exists in database: `SELECT * FROM business_themes`

### Validation errors

1. Check contrast ratios: Use browser DevTools or online tools
2. Verify hex format: Must be 6 digits (e.g., `#FF5733`)
3. Review error messages in API response
4. Check audit logs: `GET /api/v1/themes/audit`

### Database issues

1. Verify migration applied: `SELECT * FROM businesses`
2. Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'business_themes'`
3. Verify service role key in `.env`

## Best Practices

### DO ✅

- Use semantic Tailwind utilities (`bg-primary`, `text-foreground`)
- Validate themes before saving
- Log all theme changes to audit trail
- Test contrast ratios for accessibility
- Provide fallback to defaults
- Document color purpose in UI

### DON'T ❌

- Hardcode hex colors in components
- Edit `globals.css` at runtime
- Trust LLM output without validation
- Store CSS syntax in database
- Generate Tailwind config dynamically
- Skip contrast validation

## References

- [WCAG 2.0 Contrast Guidelines](https://www.w3.org/TR/WCAG20/#visual-audio-contrast)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [brand.dev API](https://brand.dev) (future integration)

## Support

For questions or issues:
1. Check this documentation
2. Review audit logs for theme changes
3. Test with validation endpoint
4. Check browser console and network tab
5. Verify database state

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-19  
**Status:** Production Ready (Phase 1 & 2 complete, Phase 3 planned)
