# Cafe POS - Project Structure & Architecture

## Table of Contents

- [Overview](#overview)
- [Quick Navigation](#quick-navigation)
- [Project Structure](#project-structure)
  - [Root Directory](#root-directory)
  - [Backend Structure](#backend-structure)
  - [Frontend Structure](#frontend-structure)
- [Architecture Layers](#architecture-layers)
  - [Backend Architecture](#backend-architecture)
  - [Frontend Architecture](#frontend-architecture)
- [File Descriptions](#file-descriptions)
  - [Backend Files](#backend-files)
  - [Frontend Files](#frontend-files)
  - [Database Migrations](#database-migrations)
- [Documentation Files](#documentation-files)
- [Development Workflow](#development-workflow)

---

## Overview

**Cafe POS System** - A production-ready Point of Sale system built for cafes, focused on accurate billing, tax compliance, and comprehensive sales reporting.

**Core Philosophy**: A café POS is a financial and tax recording system with a fast ordering UI. Inventory does not exist in the system.

**Key Features**:
- **Tax Groups Architecture** - Products reference tax groups (not direct rates) for flexible tax management
- **TaxEngine** - Centralized tax calculation engine (the ONLY place for tax math)
- **Service Charge** - Optional service charge (0-20%) with GST compliance
- **Snapshot-Based Billing** - All tax and product information snapshotted for audit compliance
- **GST Compliance** - CGST/SGST split for Indian tax regulations

**Tech Stack**:
- **Backend**: Python FastAPI (port 8000)
- **Frontend**: Next.js 14+ App Router (port 3000)
- **Database**: Supabase (PostgreSQL)
- **Architecture**: Monorepo with clean separation

---

## Quick Navigation

### Backend
- [API Routes](#api-routes-v1)
- [Services](#services-layer)
- [Repositories](#repositories-layer)
- [Schemas](#schemas-layer)
- [Core Configuration](#core-layer)
- [Database Migrations](#database-migrations)

### Frontend
- [Pages](#pages-app-router)
- [Components](#components)
- [Hooks](#hooks)
- [Utilities](#utilities-lib)

### Documentation
- [Architecture Details](./ARCHITECTURE.md)
- [Business Logic](./BUSINESS_LOGIC.md)
- [Main README](./README.md)

---

## Project Structure

### Root Directory

```
POSv3/
├── backend/                 # FastAPI backend application
├── frontend/                # Next.js frontend application
├── CURSOR_RULES/           # Development guidelines and rules
├── packages/               # Shared packages (if any)
├── README.md               # Main project README
├── ARCHITECTURE.md         # Detailed architecture documentation
├── BUSINESS_LOGIC.md       # Business logic and rules
├── INVENTORY_REMOVAL_SUMMARY.md  # Inventory removal documentation
├── SCHEMA_CLEANUP_SUMMARY.md     # Schema cleanup documentation
└── PROJECT_STRUCTURE.md    # This file
```

---

## Backend Structure

```
backend/
├── app/                          # Main application package
│   ├── __init__.py
│   ├── main.py                  # FastAPI application entry point
│   │
│   ├── api/                     # API routes layer
│   │   ├── __init__.py
│   │   └── v1/                  # API version 1
│   │       ├── __init__.py
│   │       ├── router.py        # Master router combining all endpoints
│   │       ├── auth.py          # Authentication endpoints
│   │       ├── products.py      # Product CRUD endpoints
│   │       ├── billing.py       # Bill creation endpoints
│   │       └── health.py        # Health check endpoint
│   │
│   ├── core/                    # Core system configuration
│   │   ├── __init__.py
│   │   ├── config.py            # Environment configuration (Pydantic Settings)
│   │   ├── database.py          # Supabase client initialization
│   │   └── logging.py           # Structured logging configuration
│   │
│   ├── services/                # Business logic layer
│   │   ├── __init__.py
│   │   ├── product_service.py  # Product business logic
│   │   ├── category_service.py  # Category management logic
│   │   ├── tax_group_service.py # Tax group management logic
│   │   └── billing_service.py  # Billing business logic (tax calculation, snapshots)
│   │
│   ├── repositories/            # Data access layer
│   │   ├── __init__.py
│   │   ├── product_repo.py      # Product database operations
│   │   ├── category_repo.py     # Category database operations
│   │   ├── tax_group_repo.py    # Tax group database operations
│   │   └── bill_repo.py         # Bill and bill_item database operations
│   │
│   ├── schemas/                 # Pydantic models (validation)
│   │   ├── __init__.py
│   │   ├── product.py           # ProductCreate, ProductUpdate, ProductResponse
│   │   ├── category.py          # CategoryCreate, CategoryUpdate, CategoryResponse
│   │   ├── tax_group.py          # TaxGroupCreate, TaxGroupUpdate, TaxGroupResponse
│   │   └── bill.py              # BillCreate, BillItemCreate, BillResponse
│   │
│   ├── utils/                   # Utility functions
│   │   ├── __init__.py
│   │   ├── tax_engine.py        # TaxEngine - centralized tax calculation engine
│   │   └── calculations.py      # Tax calculations, bill totals, formatting
│   │
│   └── tests/                   # Test files
│       ├── __init__.py
│       └── test_health.py       # Health check tests
│
├── supabase/                    # Database migrations and documentation
│   ├── migrations/              # SQL migration files
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_remove_inventory_add_tax_categories.sql
│   │   ├── 003_cleanup_products_cafe_schema.sql
│   │   ├── 004_drop_inventory_ledger.sql
│   │   ├── 005_remove_sku_barcode.sql
│   │   ├── 006_tax_groups_architecture.sql
│   │   ├── 007_add_service_charge.sql
│   │   ├── 008_add_tax_group_code.sql
│   │   └── 009_add_service_charge_tax_snapshot.sql
│   └── BUSINESS_LOGIC.md        # Database-specific business logic
│
├── requirements.txt             # Python dependencies
└── README.md                    # Backend-specific README
```

### Backend Layer Responsibilities

#### API Routes (`app/api/v1/`)
- Handle HTTP requests and responses
- Validate input using Pydantic schemas
- Call appropriate service methods
- Return HTTP responses with proper status codes
- Handle authentication/authorization

#### Services Layer (`app/services/`)
- Implement business logic and rules
- Calculate tax at sale time using TaxEngine (the ONLY place for tax math)
- Snapshot product and tax group information
- Coordinate multiple repository calls
- Handle complex operations (atomic bill creation with service charge)
- Validate tax group assignments
- Manage service charge calculations with GST

#### Repositories Layer (`app/repositories/`)
- Abstract database operations
- Execute queries via Supabase client
- Map database results to domain objects
- Provide clean interface for data access

#### Schemas Layer (`app/schemas/`)
- Define request/response models
- Validate input data
- Serialize/deserialize data
- Document API contracts

#### Core Layer (`app/core/`)
- Application configuration
- Database client initialization
- Logging setup
- Environment variable management

---

## Frontend Structure

```
frontend/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Home/dashboard page
│   ├── dashboard-layout.tsx     # Dashboard layout wrapper
│   │
│   ├── login/                   # Authentication pages
│   │   └── page.tsx            # Login page
│   │
│   ├── products/                # Product management
│   │   └── page.tsx            # Product list and CRUD
│   │
│   ├── pos-billing/             # Point of Sale
│   │   └── page.tsx            # Billing interface
│   │
│   ├── orders/                  # Order management
│   │   └── page.tsx            # Order list and details
│   │
│   ├── reports/                  # Reports
│   │   └── page.tsx            # Sales and tax reports
│   │
│   ├── settings/                # Settings
│   │   └── taxes/              # Tax management
│   │       └── page.tsx        # Tax groups configuration
│   │
│   ├── menu/                    # Menu display
│   │   └── page.tsx            # Menu view
│   │
│   ├── transactions/            # Transaction history
│   │   └── page.tsx            # Transaction list
│   │
│   ├── inventory/               # Inventory (deprecated/legacy)
│   │   └── page.tsx            # Inventory management (if exists)
│   │
│   ├── customers/               # Customer management
│   │   └── page.tsx            # Customer list
│   │
│   ├── marketing/               # Marketing features
│   │   └── page.tsx            # Marketing dashboard
│   │
│   └── admin-profile/           # Admin settings
│       └── page.tsx            # Admin profile page
│
├── components/                   # React components
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx          # App header
│   │   └── Sidebar.tsx          # Navigation sidebar
│   │
│   └── ui/                      # UI components
│       ├── Button.tsx           # Reusable button component
│       ├── Input.tsx            # Reusable input component
│       └── Modal.tsx            # Modal dialog component
│
├── hooks/                        # Custom React hooks
│   ├── useProducts.ts           # Product data fetching hook
│   └── useBilling.ts            # Billing operations hook
│
├── lib/                          # Utility libraries
│   ├── api.ts                   # Axios API client wrapper
│   ├── auth.ts                  # Authentication utilities
│   └── supabase.ts             # Frontend Supabase client
│
├── styles/                      # Global styles
│   └── globals.css             # Global CSS styles
│
├── package.json                 # Node.js dependencies
├── package-lock.json            # Dependency lock file
├── tsconfig.json                # TypeScript configuration
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
└── next-env.d.ts                # Next.js type definitions
```

### Frontend Layer Responsibilities

#### Pages (`app/`)
- Route handlers (Next.js App Router)
- Page-level components
- Data fetching and server-side logic
- Layout composition

#### Components (`components/`)
- Reusable UI components
- Layout components (Header, Sidebar)
- UI primitives (Button, Input, Modal)

#### Hooks (`hooks/`)
- Custom React hooks for data fetching
- Business logic hooks
- State management hooks

#### Utilities (`lib/`)
- API client configuration
- Authentication helpers
- Supabase client setup
- Shared utility functions

---

## Architecture Layers

### Backend Architecture

```
HTTP Request
    ↓
Routes (app/api/v1/)
    ↓
Services (app/services/)
    ↓
Repositories (app/repositories/)
    ↓
Supabase Database
```

**Data Flow Example: Creating a Bill**

1. **Route** (`billing.py`) - Validates request, extracts user_id
2. **Service** (`billing_service.py`) - Validates products and tax groups, calculates tax using TaxEngine, snapshots all data
3. **TaxEngine** (`tax_engine.py`) - Calculates tax for each line item (the ONLY place for tax math)
4. **Repository** (`bill_repo.py`) - Executes database operations
5. **Database** - Stores immutable bill and bill_items records with all snapshots

### Frontend Architecture

```
User Interaction
    ↓
Page Component (app/*/page.tsx)
    ↓
Custom Hook (hooks/*.ts)
    ↓
API Client (lib/api.ts)
    ↓
Backend API
```

**Data Flow Example: Creating a Bill**

1. **Page** (`pos-billing/page.tsx`) - User interface, form handling
2. **Hook** (`useBilling.ts`) - Business logic, state management
3. **API Client** (`lib/api.ts`) - HTTP request to backend
4. **Backend** - Processes request and returns response

---

## File Descriptions

### Backend Files

#### Core Files

**`app/main.py`**
- FastAPI application entry point
- CORS configuration
- Router registration
- Application startup

**`app/core/config.py`**
- Environment variable management
- Pydantic Settings configuration
- Type-safe configuration

**`app/core/database.py`**
- Supabase client singleton
- Database connection management

**`app/core/logging.py`**
- Structured logging setup
- Log format configuration

#### API Routes

**`app/api/v1/router.py`**
- Master router combining all API endpoints
- API versioning (`/api/v1`)

**`app/api/v1/auth.py`**
- Authentication endpoints
- Login/logout functionality

**`app/api/v1/products.py`**
- Product CRUD endpoints
- GET, POST, PUT, DELETE operations
- Bulk update tax group by category
- Products reference tax groups (not direct rates)

**`app/api/v1/categories.py`**
- Category management endpoints
- GET, POST, PUT, DELETE operations

**`app/api/v1/tax_groups.py`**
- Tax group management endpoints
- GET, POST, PUT operations
- List active tax groups

**`app/api/v1/billing.py`**
- Bill creation endpoints
- Order processing with service charge
- Tax calculation via TaxEngine
- Get bill by ID, list bills

**`app/api/v1/reports.py`**
- Tax summary reports
- Sales by category reports
- All reports use snapshot fields

**`app/api/v1/health.py`**
- Health check endpoint
- System status monitoring

#### Services

**`app/services/product_service.py`**
- Product business logic
- Validation rules
- Product availability management
- Tax group assignment validation

**`app/services/category_service.py`**
- Category management logic
- Category validation

**`app/services/tax_group_service.py`**
- Tax group management logic
- Tax group validation

**`app/services/billing_service.py`**
- Bill creation logic
- Tax calculation using TaxEngine (the ONLY place for tax math)
- Product and tax group snapshot creation
- Service charge calculation with GST
- Atomic transaction handling
- Validates tax group assignments

#### Repositories

**`app/repositories/product_repo.py`**
- Product database operations
- CRUD queries
- Product filtering and search

**`app/repositories/bill_repo.py`**
- Bill and bill_item database operations
- Order creation queries
- Report queries

#### Schemas

**`app/schemas/product.py`**
- `ProductCreate` - Request model for creating products
- `ProductUpdate` - Request model for updating products
- `ProductResponse` - Response model for products

**`app/schemas/bill.py`**
- `BillCreate` - Request model for creating bills
- `BillItemCreate` - Request model for bill items
- `BillResponse` - Response model for bills

#### Utilities

**`app/utils/tax_engine.py`**
- **TaxEngine** - Centralized tax calculation engine
- Handles inclusive and exclusive pricing
- CGST/SGST split for GST compliance
- Pure functions with no side effects
- Uses Decimal precision for accuracy
- Service charge tax calculations

**`app/utils/calculations.py`**
- Bill total calculations
- Currency formatting
- Helper functions (deprecated in favor of TaxEngine)

### Frontend Files

#### Pages

**`app/page.tsx`**
- Home/dashboard page
- Main landing page

**`app/login/page.tsx`**
- Login page
- Authentication UI

**`app/products/page.tsx`**
- Product management page
- Product list and CRUD interface

**`app/pos-billing/page.tsx`**
- Point of Sale interface
- Bill creation UI
- Order processing with service charge
- Tax calculation display

**`app/orders/page.tsx`**
- Order list and details
- Bill viewing
- Order history

**`app/reports/page.tsx`**
- Sales and tax reports
- Tax summary by tax group
- Sales by category

**`app/settings/taxes/page.tsx`**
- Tax groups management
- Create/edit tax groups
- Configure SERVICE_CHARGE_GST tax group

**`app/inventory/page.tsx`**
- Inventory management (deprecated/legacy)
- May be removed in future versions

#### Components

**`components/layout/Header.tsx`**
- Application header
- Navigation and user info

**`components/layout/Sidebar.tsx`**
- Navigation sidebar
- Menu items

**`components/ui/Button.tsx`**
- Reusable button component
- Styled with Tailwind CSS

**`components/ui/Input.tsx`**
- Reusable input component
- Form input styling

**`components/ui/Modal.tsx`**
- Modal dialog component
- Overlay and dialog functionality

#### Hooks

**`hooks/useProducts.ts`**
- Product data fetching
- Product CRUD operations
- Product state management

**`hooks/useBilling.ts`**
- Billing operations
- Bill creation logic
- Order state management

#### Utilities

**`lib/api.ts`**
- Axios API client wrapper
- Request/response interceptors
- Authentication token management

**`lib/auth.ts`**
- Authentication utilities
- Token management
- User session handling

**`lib/supabase.ts`**
- Frontend Supabase client
- Client-side Supabase operations

### Database Migrations

**`supabase/migrations/001_initial_schema.sql`**
- Initial database schema
- Products, bills, bill_items tables
- Inventory ledger (deprecated)
- RLS policies

**`supabase/migrations/002_remove_inventory_add_tax_categories.sql`**
- Removes inventory tracking
- Adds tax fields to bills and bill_items
- Creates categories table
- Adds product snapshots

**`supabase/migrations/003_cleanup_products_cafe_schema.sql`**
- Makes SKU and barcode optional
- Relaxes unit constraints
- Removes retail-oriented constraints
- Cafe-optimized schema

---

## Documentation Files

### Root Documentation

- **`README.md`** - Main project README with setup instructions
- **`ARCHITECTURE.md`** - Detailed architecture documentation
- **`BUSINESS_LOGIC.md`** - Business logic and rules
- **`PROJECT_STRUCTURE.md`** - This file (folder structure and architecture)

### Migration Documentation

- **`INVENTORY_REMOVAL_SUMMARY.md`** - Documentation of inventory removal
- **`SCHEMA_CLEANUP_SUMMARY.md`** - Schema cleanup documentation
- **`backend/supabase/BUSINESS_LOGIC.md`** - Database-specific business logic

### Development Rules

- **`CURSOR_RULES/BACKENDRULES.MD`** - Backend development guidelines
- **`CURSOR_RULES/FRONTENDRULES.MD`** - Frontend development guidelines
- **`CURSOR_RULES/FRONTEND_MUST_USE.MD`** - Frontend requirements
- **`CURSOR_RULES/PRODUCTION_BEST_PRACTICES.MD`** - Production best practices

---

## Development Workflow

### Backend Development

1. **Create Schema** - Define Pydantic model in `app/schemas/`
2. **Create Repository** - Add database operations in `app/repositories/`
3. **Create Service** - Add business logic in `app/services/`
4. **Create Route** - Add API endpoint in `app/api/v1/`
5. **Register Route** - Add to `app/api/v1/router.py`
6. **Test** - Add tests in `app/tests/`

### Frontend Development

1. **Create Component** - Add UI component in `components/`
2. **Create Hook** - Add data fetching logic in `hooks/`
3. **Create Page** - Add page in `app/`
4. **Update API Client** - Add API methods in `lib/api.ts` if needed
5. **Test** - Test in browser

### Database Changes

1. **Create Migration** - Add SQL file in `supabase/migrations/`
2. **Test Migration** - Run in development database
3. **Update Documentation** - Update relevant docs
4. **Deploy** - Apply to production database

---

## Key Architectural Principles

1. **Separation of Concerns** - Each layer has a single responsibility
2. **Clean Architecture** - Dependencies point inward
3. **Immutability** - Orders and order items are immutable
4. **Tax Snapshots** - Tax values frozen at sale time
5. **Product Snapshots** - Product info captured at sale time
6. **Tax Group Snapshots** - Tax group info captured at sale time
7. **TaxEngine Centralization** - TaxEngine is the ONLY place for tax math
8. **Tax Groups Architecture** - Products reference tax groups (not direct rates)
9. **No Inventory** - System is SALES + TAX + REPORTING only
10. **Order-Centric** - Orders are the single source of truth
11. **Service Charge Support** - Optional service charge with GST compliance

---

## Quick Reference

### Backend Entry Point
- **Main Application**: `backend/app/main.py`
- **API Base URL**: `http://localhost:8000/api/v1`
- **API Documentation**: `http://localhost:8000/docs`

### Frontend Entry Point
- **Main Application**: `frontend/app/layout.tsx`
- **Development Server**: `http://localhost:3000`
- **Home Page**: `frontend/app/page.tsx`

### Database
- **Migrations**: `backend/supabase/migrations/`
- **Database**: Supabase (PostgreSQL)
- **Schema Documentation**: See migration files

---

**Last Updated**: January 2025  
**Version**: 3.0 (Cafe POS - Tax Groups Architecture, TaxEngine, Service Charge)

