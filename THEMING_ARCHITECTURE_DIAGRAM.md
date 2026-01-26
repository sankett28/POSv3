# Theming System - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MULTI-TENANT THEMING SYSTEM                     │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                         ADMIN INTERFACE                           │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  Theme Editor UI (/settings/theme)                          │ │ │
│  │  │  - Color pickers for 8 semantic slots                       │ │ │
│  │  │  - Live preview                                              │ │ │
│  │  │  - Validation display                                        │ │ │
│  │  │  - Save/Reset actions                                        │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    │                                    │
│                                    │ PUT /api/v1/themes                 │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                         BACKEND API LAYER                         │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  FastAPI Endpoints (app/api/v1/themes.py)                   │ │ │
│  │  │  - GET /themes          → Fetch theme                       │ │ │
│  │  │  - PUT /themes          → Create/update theme               │ │ │
│  │  │  - PATCH /themes        → Partial update                    │ │ │
│  │  │  - DELETE /themes       → Delete theme                      │ │ │
│  │  │  - POST /themes/validate → Validate without saving          │ │ │
│  │  │  - GET /themes/audit    → Get audit logs                    │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                │                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  Service Layer (app/services/theme_service.py)             │ │ │
│  │  │  - Business logic                                           │ │ │
│  │  │  - Validation orchestration                                 │ │ │
│  │  │  - Auto-correction (optional)                               │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                │                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  Validation Layer (app/utils/color_validation.py)          │ │ │
│  │  │  - Hex format validation                                    │ │ │
│  │  │  - WCAG 2.0 contrast calculations                           │ │ │
│  │  │  - Theme validation rules                                   │ │ │
│  │  │  - Auto-correction utilities                                │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                │                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  Repository Layer (app/repositories/theme_repo.py)         │ │ │
│  │  │  - Database CRUD operations                                 │ │ │
│  │  │  - Audit log management                                     │ │ │
│  │  │  - RLS-aware queries                                        │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    │                                    │
│                                    │ Supabase Client (Service Role)     │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                         DATABASE LAYER                            │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  Supabase (PostgreSQL)                                      │ │ │
│  │  │                                                              │ │ │
│  │  │  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐│ │ │
│  │  │  │  businesses    │  │business_themes │  │theme_audit_log││ │ │
│  │  │  ├────────────────┤  ├────────────────┤  ├───────────────┤│ │ │
│  │  │  │ id (PK)        │  │ id (PK)        │  │ id (PK)       ││ │ │
│  │  │  │ name           │  │ business_id FK │  │ business_id FK││ │ │
│  │  │  │ slug (unique)  │  │ primary_color  │  │ changed_by    ││ │ │
│  │  │  │ website_url    │  │ secondary_color│  │ old_theme     ││ │ │
│  │  │  │ is_active      │  │ background_clr │  │ new_theme     ││ │ │
│  │  │  │ created_at     │  │ foreground_clr │  │ change_type   ││ │ │
│  │  │  │ updated_at     │  │ accent_color   │  │ ip_address    ││ │ │
│  │  │  └────────────────┘  │ danger_color   │  │ created_at    ││ │ │
│  │  │                      │ success_color  │  └───────────────┘│ │ │
│  │  │                      │ warning_color  │                   │ │ │
│  │  │                      │ source         │                   │ │ │
│  │  │                      │ is_validated   │                   │ │ │
│  │  │                      │ created_at     │                   │ │ │
│  │  │                      │ updated_at     │                   │ │ │
│  │  │                      └────────────────┘                   │ │ │
│  │  │                                                              │ │ │
│  │  │  Row-Level Security (RLS):                                  │ │ │
│  │  │  - Read: Authenticated users                                │ │ │
│  │  │  - Write: Service role only (backend API)                   │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    │                                    │
│                                    │ GET /api/v1/themes                 │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                         FRONTEND LAYER                            │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  Theme Utilities (lib/theme.ts)                             │ │ │
│  │  │  - fetchTheme()      → Get theme from API                   │ │ │
│  │  │  - applyTheme()      → Set CSS variables                    │ │ │
│  │  │  - initializeTheme() → Bootstrap on app load                │ │ │
│  │  │  - saveTheme()       → Save to backend                      │ │ │
│  │  │  - validateTheme()   → Validate without saving              │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                │                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  Root Layout (app/layout.tsx)                               │ │ │
│  │  │  useEffect(() => {                                          │ │ │
│  │  │    initializeTheme() // Fetch and apply on mount            │ │ │
│  │  │  }, [])                                                      │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                │                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  CSS Variables (app/globals.css)                            │ │ │
│  │  │  :root {                                                     │ │ │
│  │  │    --theme-primary: #912b48;      /* Default */             │ │ │
│  │  │    --theme-secondary: #ffffff;                              │ │ │
│  │  │    --theme-background: #fff0f3;                             │ │ │
│  │  │    --theme-foreground: #610027;                             │ │ │
│  │  │    --theme-accent: #b45a69;                                 │ │ │
│  │  │    --theme-danger: #ef4444;                                 │ │ │
│  │  │    --theme-success: #22c55e;                                │ │ │
│  │  │    --theme-warning: #f59e0b;                                │ │ │
│  │  │  }                                                           │ │ │
│  │  │                                                              │ │ │
│  │  │  @theme inline {                                             │ │ │
│  │  │    --color-primary: var(--theme-primary);                   │ │ │
│  │  │    --color-secondary: var(--theme-secondary);               │ │ │
│  │  │    --color-background: var(--theme-background);             │ │ │
│  │  │    --color-foreground: var(--theme-foreground);             │ │ │
│  │  │    /* ... */                                                 │ │ │
│  │  │  }                                                           │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                │                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  Tailwind v4 Utilities                                      │ │ │
│  │  │  - bg-primary                                                │ │ │
│  │  │  - text-foreground                                           │ │ │
│  │  │  - bg-background                                             │ │ │
│  │  │  - hover:bg-accent                                           │ │ │
│  │  │  - bg-danger / bg-success / bg-warning                       │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                │                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  React Components                                            │ │ │
│  │  │  <button className="bg-primary text-white">                 │ │ │
│  │  │    Click me                                                  │ │ │
│  │  │  </button>                                                   │ │ │
│  │  │                                                              │ │ │
│  │  │  <div className="bg-background text-foreground">            │ │ │
│  │  │    Content with proper contrast                             │ │ │
│  │  │  </div>                                                      │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│  Admin User  │
└──────┬───────┘
       │
       │ 1. Opens Theme Editor
       ▼
┌──────────────────────┐
│  Theme Editor UI     │
│  - Color pickers     │
│  - Live preview      │
└──────┬───────────────┘
       │
       │ 2. Changes colors
       │    (Live preview applies immediately)
       ▼
┌──────────────────────┐
│  applyTheme()        │
│  Sets CSS variables  │
│  on document root    │
└──────┬───────────────┘
       │
       │ 3. Clicks "Validate"
       ▼
┌──────────────────────┐
│  POST /validate      │
│  Backend validates   │
│  - Hex format        │
│  - Contrast ratios   │
└──────┬───────────────┘
       │
       │ 4. Returns validation result
       ▼
┌──────────────────────┐
│  Display errors/     │
│  warnings/success    │
└──────┬───────────────┘
       │
       │ 5. Clicks "Save"
       ▼
┌──────────────────────┐
│  PUT /themes         │
│  Backend:            │
│  - Re-validates      │
│  - Saves to DB       │
│  - Logs to audit     │
└──────┬───────────────┘
       │
       │ 6. Returns saved theme
       ▼
┌──────────────────────┐
│  Success message     │
│  Theme persisted     │
└──────────────────────┘
       │
       │ 7. On next page load
       ▼
┌──────────────────────┐
│  initializeTheme()   │
│  - Fetches theme     │
│  - Applies CSS vars  │
└──────┬───────────────┘
       │
       │ 8. Theme applied
       ▼
┌──────────────────────┐
│  All components use  │
│  semantic utilities  │
│  (bg-primary, etc.)  │
└──────────────────────┘
```

## Validation Flow

```
┌─────────────────────┐
│  Theme Data         │
│  (from admin/LLM)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Pydantic Schema Validation         │
│  - Field types                      │
│  - Required fields                  │
│  - Basic format                     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Hex Format Validation              │
│  - Must be 6-digit hex              │
│  - Normalize to uppercase           │
│  - Add # prefix if missing          │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Contrast Ratio Validation          │
│  - Foreground/background ≥ 4.5:1    │
│  - Primary/background ≥ 3.0:1       │
│  - Calculate WCAG 2.0 ratios        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Color Distinctness Check           │
│  - Primary ≠ Background             │
│  - Foreground ≠ Background          │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Database Constraints               │
│  - CHECK hex format                 │
│  - CHECK color distinctness         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  ✅ Valid Theme                     │
│  - Save to database                 │
│  - Log to audit trail               │
│  - Return to frontend               │
└─────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Frontend                                          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  - No direct database access                          │ │
│  │  - All requests go through backend API                │ │
│  │  - Client-side validation (UX only, not security)     │ │
│  └───────────────────────────────────────────────────────┘ │
│                           │                                 │
│                           ▼                                 │
│  Layer 2: Backend API                                       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  - Authentication required (TODO: JWT)                │ │
│  │  - Authorization checks (admin/owner only)            │ │
│  │  - Input validation (Pydantic schemas)                │ │
│  │  - Business logic validation                          │ │
│  │  - Rate limiting (TODO)                               │ │
│  └───────────────────────────────────────────────────────┘ │
│                           │                                 │
│                           ▼                                 │
│  Layer 3: Service Layer                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  - WCAG 2.0 contrast validation                       │ │
│  │  - Hex format validation                              │ │
│  │  - Auto-correction (optional)                         │ │
│  │  - Audit log creation                                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                           │                                 │
│                           ▼                                 │
│  Layer 4: Database (RLS)                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  - Row-Level Security enabled                         │ │
│  │  - Read: Authenticated users only                     │ │
│  │  - Write: Service role only (backend)                 │ │
│  │  - CHECK constraints on hex format                    │ │
│  │  - Foreign key constraints                            │ │
│  └───────────────────────────────────────────────────────┘ │
│                           │                                 │
│                           ▼                                 │
│  Layer 5: Audit Trail                                       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  - All changes logged immutably                       │ │
│  │  - User, timestamp, IP captured                       │ │
│  │  - Old/new values stored                              │ │
│  │  - Insert-only (no updates/deletes)                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Component Interaction

```
┌────────────────────────────────────────────────────────────┐
│                    COMPONENT DIAGRAM                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Frontend Components                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ ThemeEditor  │  │   Button     │  │    Card      │   │
│  │              │  │              │  │              │   │
│  │ - Pickers    │  │ className=   │  │ className=   │   │
│  │ - Preview    │  │ "bg-primary" │  │ "bg-bg text- │   │
│  │ - Validate   │  │              │  │  foreground" │   │
│  │ - Save       │  │              │  │              │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │            │
│         │                 │                 │            │
│         └─────────────────┴─────────────────┘            │
│                           │                              │
│                           ▼                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Tailwind v4 Utilities                    │ │
│  │  bg-primary → var(--color-primary)                 │ │
│  │  text-foreground → var(--color-foreground)         │ │
│  │  bg-background → var(--color-background)           │ │
│  └────────────────────────────────────────────────────┘ │
│                           │                              │
│                           ▼                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │           CSS Variables (Runtime)                  │ │
│  │  --color-primary: var(--theme-primary)             │ │
│  │  --theme-primary: #912b48 (set by applyTheme())   │ │
│  └────────────────────────────────────────────────────┘ │
│                           │                              │
│                           ▼                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Browser Rendering                        │ │
│  │  Applies colors to DOM elements                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

**Legend:**
- `→` Data flow
- `▼` Process flow
- `FK` Foreign Key
- `PK` Primary Key
- `RLS` Row-Level Security
- `WCAG` Web Content Accessibility Guidelines

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-19
