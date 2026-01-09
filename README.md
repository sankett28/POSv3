# Cafe POS System

A production-ready Point of Sale (POS) system built for cafes, focused on accurate billing, tax compliance, and comprehensive sales reporting.

## Core Philosophy

**A café POS is a financial and tax recording system with a fast ordering UI. Inventory is operational, not authoritative.**

This system prioritizes:
- **Accurate billing** - Orders are immutable financial records
- **Correct tax capture** - Tax values are calculated and frozen at time of sale
- **Descriptive sales & tax reports** - Reports are derived exclusively from orders
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

- ✅ Product Catalog (Menu Items)
- ✅ Immutable Sales Billing
- ✅ Tax Calculation & Capture
- ✅ Sales & Tax Reports
- ✅ Simple Authentication
- ✅ Optional Inventory Tracking (Advisory Only)
- ❌ Discounts (excluded in V1)
- ❌ Returns (excluded in V1)
- ❌ Customer CRM (excluded in V1)

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
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxx
BACKEND_PORT=8000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
```

## Database Schema

The system uses an order-centric approach:
- **products**: Menu items (product catalog)
- **bills**: Immutable sales orders (single source of truth)
- **bill_items**: Order line items with tax snapshots
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
2. **Tax is calculated and snapshot at time of sale** - Tax values are frozen in bill_items
3. **Reports are derived ONLY from orders** - No inventory calculations in reports
4. **Inventory is OPTIONAL and ADVISORY** - May exist for operational convenience
5. **Billing must NEVER be blocked by inventory** - Sales proceed regardless of stock status
6. **Immutability applies to orders and order items, not stock** - Orders are permanent records

## License

MIT
