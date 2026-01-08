# Retail Boss POS System

A production-ready Point of Sale (POS) system built for Indian Kirana stores and cafes.

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

- ✅ Product Catalog (CRUD)
- ✅ Ledger-based Inventory Management
- ✅ Immutable Sales Billing
- ✅ Simple Authentication
- ❌ Discounts (excluded in V1)
- ❌ Returns (excluded in V1)
- ❌ GST Reports (excluded in V1)
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

The system uses a ledger-based inventory approach:
- **products**: Product catalog
- **inventory_ledger**: Immutable stock movements
- **bills**: Immutable sales bills
- **bill_items**: Bill line items

Stock is calculated as: `SUM(quantity_change) WHERE product_id = X`

## Development

### Backend Architecture

- **Routes** → **Services** → **Repositories** → **Supabase**
- No business logic in routes
- All APIs under `/api/v1`

### Frontend Architecture

- **Pages** → **Components** → **Hooks** → **API Client**
- Centralized API calls via `lib/api.ts`
- Reusable UI components

## License

MIT

