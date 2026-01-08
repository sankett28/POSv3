# Retail Boss POS - Backend Architecture

## Overview

This document describes the architecture of the Retail Boss POS backend system. The backend follows a **clean architecture pattern** with clear separation of concerns across multiple layers.

## Architecture Pattern

The backend implements a **layered architecture** with the following flow:

```
HTTP Request → Routes → Services → Repositories → Supabase Database
```

### Key Principles

1. **No Business Logic in Routes**: Routes only handle HTTP concerns (request/response, validation)
2. **Business Logic in Services**: All business rules and validation logic lives in services
3. **Data Access in Repositories**: Repositories handle all database operations
4. **Immutable Operations**: Bills and inventory movements are immutable (audit-safe)
5. **Atomic Transactions**: Bill creation is atomic (bill + items + stock deduction)

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
- `products.py` - Product CRUD endpoints
- `inventory.py` - Inventory management endpoints
- `billing.py` - Bill creation endpoints

**Example**:
```python
@router.post("/products", response_model=ProductResponse)
async def create_product(
    product: ProductCreate,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    service = ProductService(db)
    return await service.create_product(product, UUID(user_id))
```

### 2. Services Layer (`app/services/`)

**Purpose**: Implement business logic and orchestrate operations

**Responsibilities**:
- Enforce business rules
- Validate business constraints
- Coordinate multiple repository calls
- Handle complex operations (e.g., atomic bill creation)
- Transform data between layers

**Files**:
- `product_service.py` - Product business logic (barcode uniqueness, price validation)
- `inventory_service.py` - Stock validation, stock calculations
- `billing_service.py` - Atomic bill creation with stock deduction

**Example**:
```python
async def create_bill(self, bill_data: BillCreate, user_id: UUID) -> BillResponse:
    # 1. Validate products exist
    # 2. Validate stock availability
    # 3. Create bill
    # 4. Create bill items
    # 5. Deduct stock (atomic)
```

### 3. Repositories Layer (`app/repositories/`)

**Purpose**: Abstract database operations

**Responsibilities**:
- Execute database queries via Supabase client
- Map database results to domain objects
- Handle database-specific concerns
- Provide clean interface for data access

**Files**:
- `product_repo.py` - Product CRUD operations
- `inventory_ledger_repo.py` - Ledger operations, stock calculations
- `bill_repo.py` - Bill and bill item operations

**Example**:
```python
async def create_product(self, product: ProductCreate, user_id: UUID) -> dict:
    data = {
        "user_id": str(user_id),
        "name": product.name,
        "price": product.price
    }
    result = self.db.table("products").insert(data).execute()
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
- `inventory.py` - StockMovement, StockResponse, InventoryLedgerEntry
- `bill.py` - BillCreate, BillItemCreate, BillResponse

**Example**:
```python
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    barcode: Optional[str] = Field(None, max_length=100)
    price: float = Field(..., gt=0)
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
- Reusable calculation functions
- Formatting utilities
- Helper functions

**Files**:
- `calculations.py` - Bill totals, currency formatting, stock calculations

## Data Flow Examples

### Example 1: Creating a Product

```
1. HTTP POST /api/v1/products
   ↓
2. Route: products.py → create_product()
   - Validates ProductCreate schema
   - Extracts user_id from JWT
   ↓
3. Service: product_service.py → create_product()
   - Validates barcode uniqueness
   - Calls repository
   ↓
4. Repository: product_repo.py → create_product()
   - Inserts into Supabase products table
   ↓
5. Returns ProductResponse
```

### Example 2: Creating a Bill (Atomic Operation)

```
1. HTTP POST /api/v1/bills
   ↓
2. Route: billing.py → create_bill()
   - Validates BillCreate schema
   ↓
3. Service: billing_service.py → create_bill()
   - Validates all products exist
   - Validates stock availability for each item
   - Creates bill (via repository)
   - Creates bill items (via repository)
   - Deducts stock for each item (via inventory service)
   - Returns BillResponse
   ↓
4. If any step fails → entire operation fails (atomic)
```

### Example 3: Getting Current Stock

```
1. HTTP GET /api/v1/inventory/stocks
   ↓
2. Route: inventory.py → get_all_stocks()
   ↓
3. Service: inventory_service.py → get_all_stocks()
   ↓
4. Repository: inventory_ledger_repo.py → get_all_stocks()
   - Gets all products
   - For each product: SUM(quantity_change) from ledger
   ↓
5. Returns list of StockResponse
```

## Database Schema

### Ledger-Based Inventory

Stock is **never directly updated**. Instead, all stock movements are recorded as immutable ledger entries:

- **Incoming**: Positive `quantity_change` (e.g., +10)
- **Outgoing**: Negative `quantity_change` (e.g., -5)

**Current Stock** = `SUM(quantity_change) WHERE product_id = X`

This ensures:
- Complete audit trail
- Immutable history
- No data loss

### Immutable Bills

Bills are **never edited or deleted**. Once created:
- Bill record is immutable
- Bill items are immutable
- Stock deduction is permanent

This ensures:
- Audit compliance
- Financial integrity
- No data tampering

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

- Indexes on frequently queried columns (`user_id`, `product_id`, `created_at`)
- Efficient stock calculation using SQL aggregation
- Connection pooling via Supabase client

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

✅ **Clean Separation**: Each layer has a single responsibility  
✅ **Testability**: Easy to mock and test each layer  
✅ **Maintainability**: Clear structure, easy to navigate  
✅ **Scalability**: Can add caching, queues, etc. without breaking structure  
✅ **Audit Safety**: Immutable operations ensure data integrity  

---

**Last Updated**: January 2025  
**Version**: 1.0
