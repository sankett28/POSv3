# POS V1 Business Logic

## Core Philosophy

This POS system is based on **THREE immutable concepts**:

1. **PRODUCTS** define WHAT can be sold
2. **INVENTORY LEDGER** defines HOW stock changes
3. **BILLS** define WHAT was sold

### Key Principles

- **Totals are derived, events are stored**
- **No direct stock updates**
- **No mutable financial records**

---

## 1. PRODUCT LOGIC

A Product is **master data only**. It does NOT store stock.

### Product Fields

- `id` (UUID, primary key)
- `name` (required)
- `sku` (unique, stable identifier)
- `barcode` (unique, scanner-based)
- `selling_price` (required)
- `unit` (pcs / kg / litre)
- `is_active` (boolean)
- `created_at` (server timestamp)

### Product Rules

- Products are **NEVER hard-deleted**
- Products can be **activated / deactivated** via `is_active`
- SKU and barcode must be **unique**
- Products are master data - changes are infrequent

---

## 2. INVENTORY LOGIC (LEDGER-BASED)

Inventory is **ledger-based**. Each stock change is an **immutable event**.

### Inventory Rules

- **No stock column anywhere**
- **Stock = SUM(inventory_ledger.quantity)**
- Ledger entries **cannot be updated or deleted**
- Stock **cannot go negative** (enforced at service layer)

### Ledger Entry Fields

- `id` (UUID, primary key)
- `product_id` (FK → products.id)
- `quantity` (signed integer)
- `reference_type` (STOCK_ADD or SALE)
- `reference_id` (nullable, bill_id for sales)
- `created_at` (server timestamp)

### Quantity Sign Convention

- **Positive quantity** = stock added
- **Negative quantity** = stock removed (sale)

---

## 3. BILLING LOGIC (TRANSACTION ENGINE)

Bills are **immutable financial records**.

### Bill Rules

- Bills can **NEVER be updated or deleted**
- Bill creation must be **atomic**
- If stock is insufficient → bill fails
- Stock deduction happens via inventory ledger

### Bill Fields

- `id` (UUID, primary key)
- `bill_number` (unique, sequential or generated)
- `total_amount` (required)
- `payment_method` (CASH / UPI / CARD)
- `created_at` (server timestamp)

### Bill Items (Line Items)

- `id` (UUID, primary key)
- `bill_id` (FK → bills.id)
- `product_id` (FK → products.id)
- `quantity` (required)
- `selling_price` (snapshot at sale time)
- `line_total` (required)
- `created_at` (server timestamp)

---

## Database Requirements

### Tables

1. `products` - Master product data
2. `inventory_ledger` - Immutable stock movements
3. `bills` - Immutable sales records
4. `bill_items` - Line items for bills

### Constraints

- Unique SKU and barcode
- Foreign key integrity
- Prevent negative stock (service layer)
- Bills and ledger entries are immutable (no UPDATE/DELETE)

### Indexes

- Product barcode lookup (for scanner)
- Inventory ledger product_id (for stock calculations)
- Bill number (for bill lookups)

### Timestamps

- All timestamps use server-side `NOW()`
- No `updated_at` fields (immutability principle)

### Row Level Security (RLS)

- Authenticated users can read/write
- No public access
- Single-tenant system (no user_id filtering needed)

---

## Out of Scope (V1)

- GST logic
- Discounts
- Returns
- Customer tables
- Inventory adjustment logic (beyond STOCK_ADD)

---

## Data Flow

### Creating a Bill

1. Validate all products exist and are active
2. Check stock availability (SUM ledger quantities)
3. Create bill record
4. Create bill items
5. Create inventory ledger entries (negative quantities for each item)
6. All operations in a transaction (atomic)

### Adding Stock

1. Validate product exists
2. Create inventory ledger entry with positive quantity
3. Reference type: STOCK_ADD
4. No bill reference needed

### Calculating Current Stock

```sql
SELECT 
    product_id,
    SUM(quantity) as current_stock
FROM inventory_ledger
WHERE product_id = ?
GROUP BY product_id;
```

---

## Immutability Guarantees

- **Products**: Can be deactivated, but never deleted
- **Inventory Ledger**: No UPDATE or DELETE operations
- **Bills**: No UPDATE or DELETE operations
- **Bill Items**: No UPDATE or DELETE operations

This ensures:
- Complete audit trail
- Financial integrity
- No data tampering
- Compliance-ready records

