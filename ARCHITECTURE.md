# Cafe POS - Backend Architecture

## Overview

This document describes the architecture of the Cafe POS backend system. The backend follows a **clean architecture pattern** with clear separation of concerns across multiple layers.

**Core Philosophy**: Orders are the single source of truth. Tax is captured at sale time. Reports derive exclusively from orders. Inventory does not exist in the system.

## System Flow (Core Path)

```
UI → Orders → Tax Calculation → Storage → Reports
```

**The system is a SALES + TAX + REPORTING system ONLY.**

## Architecture Pattern

The backend implements a **layered architecture** with the following flow:

```
HTTP Request → Routes → Services → Repositories → Supabase Database
```

### Key Principles

1. **No Business Logic in Routes**: Routes only handle HTTP concerns (request/response, validation)
2. **Business Logic in Services**: All business rules and validation logic lives in services
3. **Data Access in Repositories**: Repositories handle all database operations
4. **Immutable Orders**: Bills and bill items are immutable (audit-safe financial records)
5. **Tax Snapshot**: Tax values are calculated and frozen at sale time
6. **Billing Always Succeeds**: No blocking validations beyond product existence
7. **Reports from Orders**: All reports derive exclusively from bills and bill_items
8. **Product Snapshots**: Product information is snapshotted at sale time for historical accuracy

## Why Inventory Was Removed

### Cafe Operations Requirements

1. **Speed**: Cafe staff need to bill quickly without delays
2. **Simplicity**: No complex stock management overhead
3. **Made-to-Order**: Many cafe items are prepared on-demand, making stock tracking impractical
4. **Focus**: System focuses on financial accuracy, not inventory accuracy

### Audit and Compliance Benefits

1. **Tax Compliance**: Tax values are frozen at sale time, ensuring accurate tax reporting
2. **Financial Integrity**: Orders are immutable, providing complete audit trail
3. **Historical Accuracy**: Product snapshots ensure reports remain accurate even if products change
4. **No Stock Discrepancies**: Eliminates inventory-related reporting errors

### System Simplicity

1. **Reduced Complexity**: No inventory logic to maintain or debug
2. **Faster Development**: Focus on core billing and reporting features
3. **Clearer Data Model**: Orders are the single source of truth
4. **Better Performance**: Fewer tables, simpler queries, faster reports

## Layer Responsibilities

### 1. Routes Layer (`app/api/v1/`)

**Purpose**: Handle HTTP requests and responses

**Responsibilities**:
- Parse HTTP requests
- Validate input using Pydantic schemas
- Call appropriate service methods
- Return HTTP responses
- Handle authentication/authorization
- Return appropriate HTTP status codes

**Files**:
- `router.py` - Master router combining all sub-routers
- `auth.py` - Authentication endpoints
- `products.py` - Product (menu item) CRUD endpoints
- `categories.py` - Category management endpoints
- `billing.py` - Bill creation endpoints
- `reports.py` - Sales and tax report endpoints

**Example**:
```python
@router.post("/bills", response_model=BillResponse)
async def create_bill(
    bill: BillCreate,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    service = BillingService(db)
    return await service.create_bill(bill, UUID(user_id))
```

### 2. Services Layer (`app/services/`)

**Purpose**: Implement business logic and orchestrate operations

**Responsibilities**:
- Enforce business rules
- Calculate tax at sale time
- Snapshot product information
- Coordinate multiple repository calls
- Handle complex operations (e.g., atomic bill creation with tax)
- Transform data between layers
- Generate reports from orders

**Files**:
- `product_service.py` - Product (menu item) business logic
- `category_service.py` - Category management logic
- `billing_service.py` - Atomic bill creation with tax calculation and snapshots
- `report_service.py` - Sales and tax reports derived from orders

**Example**:
```python
async def create_bill(self, bill_data: BillCreate, user_id: UUID) -> BillResponse:
    # 1. Validate products exist and are active
    # 2. Snapshot product information (name, category, price, tax_rate)
    # 3. Calculate tax for each item (snapshot at sale time)
    # 4. Create bill
    # 5. Create bill items (with frozen tax values and snapshots)
```

### 3. Repositories Layer (`app/repositories/`)

**Purpose**: Abstract database operations

**Responsibilities**:
- Execute database queries via Supabase client
- Map database results to domain objects
- Handle database-specific concerns
- Provide clean interface for data access

**Files**:
- `product_repo.py` - Product (menu item) CRUD operations
- `category_repo.py` - Category CRUD operations
- `bill_repo.py` - Bill and bill item operations
- `report_repo.py` - Report queries (orders-only)

**Example**:
```python
async def create_bill(self, bill: BillCreate, user_id: UUID) -> dict:
    data = {
        "user_id": str(user_id),
        "subtotal": bill.subtotal,
        "tax_amount": bill.tax_amount,  # Snapshot at sale time
        "total_amount": bill.total_amount,
        "payment_method": bill.payment_method
    }
    result = self.db.table("bills").insert(data).execute()
    return result.data[0]
```

### 4. Schemas Layer (`app/schemas/`)

**Purpose**: Define data structures and validation rules

**Responsibilities**:
- Define request/response models
- Validate input data
- Serialize/deserialize data
- Document API contracts

**Files**:
- `product.py` - ProductCreate, ProductUpdate, ProductResponse
- `category.py` - CategoryCreate, CategoryUpdate, CategoryResponse
- `bill.py` - BillCreate, BillItemCreate, BillResponse (with tax fields)
- `report.py` - SalesReport, TaxReport, ReportResponse

**Example**:
```python
class BillItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0)
    selling_price: float = Field(..., gt=0)
    tax_rate: float = Field(..., ge=0, le=100)  # Snapshot at sale
    tax_amount: float = Field(..., ge=0)  # Calculated and frozen
    product_name_snapshot: str  # Snapshot at sale
    category_name_snapshot: Optional[str]  # Snapshot at sale
    line_subtotal: float = Field(..., gt=0)
    line_total: float = Field(..., gt=0)
```

### 5. Core Layer (`app/core/`)

**Purpose**: System-level configuration and infrastructure

**Responsibilities**:
- Application configuration
- Database client initialization
- Logging setup
- Environment variable management

**Files**:
- `config.py` - Settings and environment variables
- `database.py` - Supabase client singleton
- `logging.py` - Structured logging configuration

### 6. Utils Layer (`app/utils/`)

**Purpose**: Shared utility functions

**Responsibilities**:
- Tax calculation functions
- Bill total calculations
- Report aggregation functions
- Formatting utilities

**Files**:
- `calculations.py` - Tax calculations, bill totals, currency formatting
- `report_utils.py` - Report aggregation and grouping

## Data Flow Examples

### Example 1: Creating a Bill (Core Flow)

```
1. HTTP POST /api/v1/bills
   ↓
2. Route: billing.py → create_bill()
   - Validates BillCreate schema
   - Extracts user_id from JWT
   ↓
3. Service: billing_service.py → create_bill()
   - Validates all products exist and are active
   - Snapshots product information (name, category, price, tax_rate)
   - Calculates tax for each item (snapshot)
   - Creates bill (via repository)
   - Creates bill items with frozen tax values and snapshots
   ↓
4. Returns BillResponse with tax breakdown
```

**Key Point**: No inventory checks. Billing always proceeds. All product data is snapshotted.

### Example 2: Generating Sales Report

```
1. HTTP GET /api/v1/reports/sales?start_date=...&end_date=...
   ↓
2. Route: reports.py → get_sales_report()
   ↓
3. Service: report_service.py → get_sales_report()
   ↓
4. Repository: report_repo.py → get_sales_report()
   - Queries bills and bill_items ONLY
   - Uses snapshot fields from bill_items
   - Aggregates by date/product/category/tax
   ↓
5. Returns SalesReportResponse
```

**Key Point**: Reports derive exclusively from orders. Uses snapshots for historical accuracy.

### Example 3: Getting Product (Menu Item)

```
1. HTTP GET /api/v1/products/{id}
   ↓
2. Route: products.py → get_product()
   ↓
3. Service: product_service.py → get_product()
   ↓
4. Repository: product_repo.py → get_product()
   - Returns product data
   - No stock information (inventory doesn't exist)
   ↓
5. Returns ProductResponse
```

## Database Schema

### Order-Centric Design

**Bills** are the single source of truth:
- Immutable financial records
- Tax values frozen at sale time
- Complete audit trail
- Subtotal, tax_amount, and total_amount stored

**Bill Items** contain:
- Product reference
- Quantity sold
- Price at sale time (snapshot)
- Tax rate (snapshot)
- Tax amount (calculated and frozen)
- Product name (snapshot)
- Category name (snapshot)
- Line subtotal and line total

**Products** are menu items:
- Owner-managed
- Can be activated/deactivated
- Tax rate stored for calculation
- Category assignment optional

**Categories** are menu groupings:
- Owner-managed
- Optional organization tool
- Display order for sorting

### Immutable Orders

Orders are **never edited or deleted**. Once created:
- Bill record is immutable
- Bill items are immutable
- Tax values are permanent snapshots
- Product information is permanent snapshots

This ensures:
- Audit compliance
- Financial integrity
- Tax reporting accuracy
- Historical accuracy
- No data tampering

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CORE FLOW                             │
│                                                          │
│  UI → Orders → Tax Calculation → Storage → Reports     │
│                                                          │
│  Billing (Always Proceeds)                              │
│  - Product validation only                              │
│  - Tax calculation & snapshot                           │
│  - Product information snapshot                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              SUPPORTING ENTITIES                        │
│                                                          │
│  Products (Menu Items)                                   │
│  - Owner-managed                                         │
│  - Active/inactive control                               │
│                                                          │
│  Categories (Menu Groups)                                │
│  - Owner-managed                                         │
│  - Optional organization                                 │
└─────────────────────────────────────────────────────────┘
```

## Authentication & Authorization

### Authentication Flow

1. User logs in via `/api/v1/auth/login`
2. Supabase Auth validates credentials
3. Returns JWT access token
4. Frontend stores token in localStorage
5. All subsequent requests include token in `Authorization: Bearer <token>` header

### Authorization

- JWT token contains `user_id` (sub claim)
- All database queries filter by `user_id`
- Row Level Security (RLS) policies enforce user isolation
- Service role key (backend only) bypasses RLS

## Error Handling

### Error Flow

```
Exception in Repository
  ↓
Caught in Service
  ↓
Transformed to domain error
  ↓
Caught in Route
  ↓
HTTPException with appropriate status code
  ↓
JSON error response to client
```

### Error Types

- **400 Bad Request**: Validation errors, business rule violations
- **401 Unauthorized**: Invalid/missing authentication token
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Unexpected errors

## Testing Strategy

### Test Structure

Tests are located in `app/tests/`:

- `test_health.py` - Basic health check tests
- Future: Unit tests for services
- Future: Integration tests for API endpoints

### Testing Layers

1. **Unit Tests**: Test individual functions/methods
2. **Integration Tests**: Test API endpoints with test database
3. **E2E Tests**: Test complete user flows

## Dependencies

### External Dependencies

- **FastAPI**: Web framework
- **Supabase**: Database and authentication
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

### Internal Dependencies

```
Routes → Services → Repositories → Supabase
Routes → Schemas (for validation)
Services → Repositories
Services → Utils
```

## Configuration

### Environment Variables

All configuration via environment variables (`.env`):

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (bypasses RLS)
- `BACKEND_PORT`: Server port (default: 8000)

### Settings

Settings loaded via `app/core/config.py` using Pydantic Settings:
- Type-safe configuration
- Environment variable validation
- Default values

## API Versioning

All APIs are versioned under `/api/v1/`:

- Allows future breaking changes under `/api/v2/`
- Maintains backward compatibility
- Clear versioning strategy

## Performance Considerations

### Database Queries

- Indexes on frequently queried columns (`user_id`, `product_id`, `created_at`, `bill_id`)
- Efficient report queries using SQL aggregation on orders
- Connection pooling via Supabase client
- Snapshot fields eliminate need for joins in reports

### Caching

- Future: Redis caching for frequently accessed data
- Future: Response caching for read-heavy endpoints

## Security

### Data Isolation

- Row Level Security (RLS) on all tables
- User-specific data filtering
- Service role key only for backend operations

### Input Validation

- Pydantic schemas validate all inputs
- SQL injection prevention via parameterized queries
- XSS prevention via proper serialization

## Future Enhancements

### Planned Improvements

1. **Caching Layer**: Redis for performance
2. **Background Jobs**: Async task processing
3. **Webhooks**: Event notifications
4. **Rate Limiting**: API throttling
5. **Monitoring**: Health checks, metrics
6. **Logging**: Structured logging with correlation IDs

## Summary

This architecture provides:

✅ **Order-Centric Design**: Orders are the single source of truth  
✅ **Tax Accuracy**: Tax values frozen at sale time  
✅ **Report Reliability**: Reports derive exclusively from orders  
✅ **Billing Guarantee**: Sales always proceed  
✅ **Audit Safety**: Immutable orders ensure financial integrity  
✅ **Historical Accuracy**: Product snapshots ensure accurate reports  
✅ **Simplicity**: No inventory complexity  
✅ **Clean Separation**: Each layer has a single responsibility  
✅ **Testability**: Easy to mock and test each layer  
✅ **Maintainability**: Clear structure, easy to navigate  
✅ **Scalability**: Can add caching, queues, etc. without breaking structure  

---

**Last Updated**: January 2025  
**Version**: 3.0 (Cafe POS - Inventory Removed)
