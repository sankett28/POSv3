# Cafe POS System

A production-ready Point of Sale (POS) system built for cafes, focused on accurate billing, tax compliance, and comprehensive sales reporting.

## Core Philosophy

**A café POS is a financial and tax recording system with a fast ordering UI. Inventory is operational, not authoritative.**

This system prioritizes:
- **Accurate billing** - Orders are immutable financial records
- **Correct tax capture** - Tax values are calculated and frozen at time of sale using a centralized TaxEngine
- **Tax Groups Architecture** - Products reference tax groups (not direct rates) for flexible tax management
- **Service Charge Support** - Optional service charge with GST compliance
- **Descriptive sales & tax reports** - Reports are derived exclusively from orders using snapshot fields
- **Simple, fast UI** - Optimized for cafe operations

**Inventory is optional and advisory** - It may exist for operational convenience but never blocks billing or sales operations.

## Architecture

- **Backend**: Python FastAPI (port 8000)
- **Frontend**: Next.js App Router (port 3000)
- **Database**: Supabase (PostgreSQL)
- **Monorepo**: Single repository with clean separation

## Project Structure

```
.
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   ├── api/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── schemas/
│   └── requirements.txt
│
├── frontend/         # Next.js frontend
│   ├── app/          # App Router pages
│   ├── components/   # React components
│   ├── hooks/        # Custom hooks
│   └── lib/          # Utilities
│
└── README.md
```

## Features (V1)

- ✅ Product Catalog (Menu Items) with Tax Groups
- ✅ Tax Groups Management (GST-compliant tax configuration)
- ✅ Immutable Sales Billing with Tax Snapshots
- ✅ Service Charge Support (0-20% with GST)
- ✅ Tax Calculation & Capture (TaxEngine - centralized tax math)
- ✅ Sales & Tax Reports (derived from snapshot fields)
- ✅ Simple Authentication
- ✅ Optional Inventory Tracking (Advisory Only)
- ❌ Discounts (excluded in V1)
- ❌ Returns (excluded in V1)
- ❌ Customer CRM (excluded in V1)

## Key Features

### Tax Groups Architecture

Products reference **tax groups** instead of storing tax rates directly. This enables:
- Flexible tax configuration management
- Support for inclusive and exclusive pricing
- CGST/SGST split for Indian GST compliance
- Audit-safe billing with tax snapshots

### Tax Engine

All tax calculations are performed by a centralized `TaxEngine`:
- Handles inclusive and exclusive pricing
- Splits tax into CGST/SGST for GST compliance
- Uses Decimal precision for accurate calculations
- Pure functions with no side effects

### Service Charge

Optional service charge feature:
- Calculated on item subtotal (taxable value)
- GST applied on service charge using dedicated `SERVICE_CHARGE_GST` tax group
- Configurable rate (0-20%)
- Can be enabled/disabled per bill
- All values snapshotted for audit compliance

### Snapshot-Based Billing

All tax and product information is snapshotted at bill creation:
- Tax group name, rate, and inclusive/exclusive flag
- Taxable value, CGST amount, SGST amount
- Product name and category name
- Service charge details (if applicable)
- Ensures historical accuracy even if products or tax groups change

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure your Supabase credentials
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # Configure your API URL and Supabase keys
npm run dev  # Runs on port 3000
```

## Environment Variables

### Backend (.env)

Copy `backend/.env.example` to `backend/.env` and configure:

```env
# Required
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxx

# Optional (defaults shown)
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:3000
DEFAULT_SERVICE_CHARGE_ENABLED=true
DEFAULT_SERVICE_CHARGE_RATE=10.0
```

**For production:** Set `CORS_ORIGINS` to your frontend domain(s), comma-separated:
```env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend (.env.local)

Copy `frontend/.env.local.example` to `frontend/.env.local` and configure:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
```

**For production:** Update `NEXT_PUBLIC_API_BASE_URL` to your backend API URL.

## Database Schema

The system uses an order-centric approach:
- **tax_groups**: Tax configuration (rates, split types, inclusive/exclusive)
- **products**: Menu items (reference tax groups via tax_group_id)
- **categories**: Menu groupings (optional)
- **bills**: Immutable sales orders (single source of truth)
- **bill_items**: Order line items with comprehensive tax snapshots
- **inventory_ledger**: Optional advisory stock tracking (if enabled)

**Orders are the single source of truth** - All reports and financial records derive from bills and bill_items.

## Development

### Backend Architecture

- **Routes** → **Services** → **Repositories** → **Supabase**
- No business logic in routes
- All APIs under `/api/v1`

### Frontend Architecture

- **Pages** → **Components** → **Hooks** → **API Client**
- Centralized API calls via `lib/api.ts`
- Reusable UI components

## Key Principles

1. **Orders/Bills are the single source of truth** - All financial and tax data comes from orders
2. **Tax is calculated and snapshot at time of sale** - Tax values are frozen in bill_items using TaxEngine
3. **Tax Groups are configuration** - Products reference tax groups, enabling flexible tax management
4. **TaxEngine is the ONLY place for tax math** - All tax calculations centralized for consistency
5. **Reports are derived ONLY from orders** - No inventory calculations in reports
6. **Inventory is OPTIONAL and ADVISORY** - May exist for operational convenience
7. **Billing must NEVER be blocked by inventory** - Sales proceed regardless of stock status
8. **Immutability applies to orders and order items, not stock** - Orders are permanent records
9. **Service charge is optional and snapshotted** - GST applied on service charge for compliance

## Production Deployment

### Security Checklist

Before deploying to production, ensure:

- [ ] All API routes (except `/auth/login` and `/health`) require authentication
- [ ] JWT tokens are properly verified with Supabase
- [ ] CORS is configured for your production frontend domain(s)
- [ ] Test credentials are removed (not used in production)
- [ ] Environment variables are set correctly in your hosting platform
- [ ] Database migrations are applied
- [ ] HTTPS is enabled
- [ ] Frontend middleware is protecting routes server-side
- [ ] SERVICE_CHARGE_GST tax group is configured in Settings → Taxes

### Authentication

The application uses Supabase for authentication:
- All API routes require a valid JWT token in the `Authorization: Bearer <token>` header
- Tokens are verified server-side using Supabase's token verification
- Frontend middleware provides server-side route protection
- Invalid or expired tokens result in 401 Unauthorized responses

### CORS Configuration

Configure allowed origins via the `CORS_ORIGINS` environment variable (comma-separated):
```env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

For development, defaults to `http://localhost:3000` if not set.

## License

MIT
