# 🎨 Multi-Tenant Theming System

> **Production-grade, backend-driven UI theming for POS/SaaS applications**

[![Status](https://img.shields.io/badge/status-production%20ready-success)]()
[![Phase](https://img.shields.io/badge/phase-1%20%26%202%20complete-blue)]()
[![WCAG](https://img.shields.io/badge/WCAG-2.0%20AA-green)]()

## What Is This?

A complete theming system that allows each business (tenant) to customize their UI colors while maintaining:

- ✅ **Accessibility** - WCAG 2.0 AA contrast validation
- ✅ **Security** - Backend validation, RLS, audit trails
- ✅ **Performance** - Runtime CSS variables (no rebuilds)
- ✅ **Safety** - Treats themes as data, not code
- ✅ **Compliance** - Full audit trail for enterprise use

## Quick Links

- 📖 **[Full Documentation](./THEMING_SYSTEM.md)** - Complete system reference
- 🚀 **[Quick Start Guide](./THEMING_QUICKSTART.md)** - Get started in 5 minutes
- 📋 **[Implementation Summary](./THEMING_IMPLEMENTATION_SUMMARY.md)** - What was built

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     THEMING SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐ │
│  │  Admin UI    │─────▶│  Backend API │─────▶│ Database │ │
│  │  (Editor)    │      │  (Validate)  │      │  (Store) │ │
│  └──────────────┘      └──────────────┘      └──────────┘ │
│         │                      │                    │      │
│         │                      │                    │      │
│         ▼                      ▼                    ▼      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │           Runtime CSS Variables                      │ │
│  │  --theme-primary, --theme-background, etc.           │ │
│  └──────────────────────────────────────────────────────┘ │
│         │                                                  │
│         ▼                                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │           Tailwind v4 Utilities                      │ │
│  │  bg-primary, text-foreground, etc.                   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 🎯 Semantic Color Slots

8 semantic slots that map to UI purposes:

| Slot | Purpose | Example |
|------|---------|---------|
| `primary` | Main brand color | CTAs, primary buttons |
| `secondary` | Secondary color | Secondary buttons |
| `background` | Main background | App background |
| `foreground` | Primary text | Body text, headings |
| `accent` | Accent/highlight | Badges, hover states |
| `danger` | Error states | Error messages |
| `success` | Success states | Success messages |
| `warning` | Warning states | Warning messages |

### 🔒 Backend Validation

All themes validated for:
- ✅ Hex format (`#RRGGBB`)
- ✅ WCAG 2.0 AA contrast ratios
- ✅ Color distinctness
- ✅ Accessibility compliance

### 📊 Audit Trail

Every theme change logged with:
- User email
- Timestamp
- IP address
- Old/new values
- Change reason

### 🚀 Runtime Application

- No Tailwind rebuilds
- No CSS file mutations
- Instant theme switching
- Graceful fallback to defaults

## Getting Started

### 1. Run Migration

```bash
psql -h <supabase-host> -U postgres -d postgres \
  -f POSv3/backend/supabase/migrations/010_add_business_theme_system.sql
```

### 2. Start Services

```bash
# Backend
cd POSv3/backend
uvicorn app.main:app --reload

# Frontend
cd POSv3/frontend
npm run dev
```

### 3. Access Theme Editor

Navigate to: `http://localhost:3000/settings/theme`

### 4. Customize & Save

1. Pick colors with color pickers
2. See live preview
3. Validate contrast ratios
4. Save theme

**Done!** Theme applies across entire app.

## API Endpoints

### `GET /api/v1/themes`
Get current theme (returns empty object if none configured)

### `PUT /api/v1/themes`
Create or update theme (with validation)

### `POST /api/v1/themes/validate`
Validate theme without saving (for live validation)

### `GET /api/v1/themes/audit`
Get audit logs (last 50 changes)

## Component Usage

### ✅ Correct - Semantic Utilities

```tsx
<button className="bg-primary text-white hover:bg-accent">
  Click me
</button>

<div className="bg-background text-foreground">
  Content with proper contrast
</div>
```

### ❌ Wrong - Hardcoded Colors

```tsx
<button className="bg-[#912b48]">Don't do this</button>
<div style={{ backgroundColor: '#fff0f3' }}>Or this</div>
```

## Validation Rules

### Contrast Requirements (WCAG 2.0)

| Pair | Minimum | Standard |
|------|---------|----------|
| Foreground / Background | 4.5:1 | AA Normal Text |
| Primary / Background | 3.0:1 | AA Large Text |
| Recommended | 7.0:1 | AAA Normal Text |

### Format Requirements

- Must be 6-digit hex codes (e.g., `#FF5733`)
- Case-insensitive (normalized to uppercase)
- With or without `#` prefix

## File Structure

```
POSv3/
├── backend/
│   ├── supabase/migrations/
│   │   └── 010_add_business_theme_system.sql  # Database schema
│   ├── app/
│   │   ├── utils/color_validation.py          # Validation logic
│   │   ├── schemas/theme.py                   # Pydantic models
│   │   ├── repositories/theme_repo.py         # Data access
│   │   ├── services/theme_service.py          # Business logic
│   │   └── api/v1/themes.py                   # API endpoints
│   └── app/tests/test_color_validation.py     # Tests
├── frontend/
│   ├── lib/theme.ts                           # Theme utilities
│   ├── components/ui/ThemeEditor.tsx          # Editor UI
│   ├── app/settings/theme/page.tsx            # Settings page
│   └── app/globals.css                        # CSS variables
└── docs/
    ├── THEMING_SYSTEM.md                      # Full documentation
    ├── THEMING_QUICKSTART.md                  # Quick start guide
    ├── THEMING_IMPLEMENTATION_SUMMARY.md      # Implementation details
    └── THEMING_README.md                      # This file
```

## Testing

### Run Backend Tests

```bash
cd POSv3/backend
pytest app/tests/test_color_validation.py -v
```

### Manual Testing

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

## Security

### Row-Level Security (RLS)

- **Read**: Authenticated users can view themes
- **Write**: Only service role (backend API) can modify
- **Audit**: All changes logged immutably

### Validation

- **Database**: CHECK constraints on hex format
- **Backend**: WCAG 2.0 contrast validation
- **Frontend**: Live validation in editor

## Roadmap

### ✅ Phase 1 & 2 (Complete)
- Database schema with RLS
- Backend API with validation
- Frontend integration
- Theme editor UI
- Audit trail

### 🚧 Phase 3 (Planned)
- brand.dev API integration
- LLM semantic mapping (Gemini/GPT)
- Auto-generation from website URL
- Admin approval workflow

### 🔮 Future
- Theme templates/presets
- Dark mode support
- Theme versioning
- Export/import themes
- A/B testing

## Troubleshooting

### Theme not applying?
1. Check browser console for errors
2. Verify API: `curl http://localhost:8000/api/v1/themes`
3. Check CSS variables in DevTools
4. Hard refresh (Ctrl+Shift+R)

### Validation errors?
- Ensure contrast ratios meet WCAG 2.0 AA
- Use 6-digit hex codes
- Check error messages in Theme Editor

### Migration failed?
- Verify Supabase connection
- Check if tables exist: `\dt` in psql
- Review migration file

## Support

- 📖 **Documentation**: See `THEMING_SYSTEM.md`
- 🐛 **Issues**: Check audit logs and browser console
- 💬 **Questions**: Review troubleshooting section

## License

Part of POSv3 project. See main project LICENSE.

---

## Summary

You now have a **production-ready theming system** that:

1. ✅ Stores themes as data (not code)
2. ✅ Validates accessibility (WCAG 2.0)
3. ✅ Provides full audit trail
4. ✅ Works with Tailwind v4 natively
5. ✅ Applies themes at runtime
6. ✅ Falls back gracefully
7. ✅ Includes admin UI
8. ✅ Is secure with RLS
9. ✅ Is ready for LLM integration

**Safe, auditable, and enterprise-ready for POS/SaaS deployment.**

---

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** 2026-01-19
