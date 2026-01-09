# Cafe POS Business Logic

## Core Philosophy

**A café POS is a financial and tax recording system with a fast ordering UI. Inventory does not exist in the system.**

This POS system is based on **THREE core concepts**:

1. **PRODUCTS** define WHAT can be sold (menu items)
2. **ORDERS (BILLS)** define WHAT was sold (immutable financial records)
3. **TAX** is calculated and frozen at time of sale

### Key Principles

- **Orders are the single source of truth**
- **Tax values are snapshots at sale time**
- **Reports derive only from orders**
- **There is NO inventory tracking**
- **Billing always succeeds**

---

## Cafe POS Core Truths

### 1. Orders/Bills Are the Single Source of Truth

All financial data, sales data, and tax data comes from orders (bills). Nothing else is authoritative.

- Reports are generated exclusively from bills and bill_items
- No inventory calculations in financial reports
- Historical accuracy is guaranteed by immutability
- Complete audit trail from orders only

### 2. Tax Is Calculated and Snapshot at Time of Sale

Tax rates and amounts are calculated when the order is created and permanently stored in bill_items.

- Tax rate is captured from product at sale time
- Tax amount is calculated and frozen
- Tax values never change after order creation
- Reports use these frozen tax values
- All tax fields are stored as snapshots in bill_items

### 3. Reports Are Derived ONLY from Orders

All sales reports, tax reports, and financial reports query bills and bill_items exclusively.

- Reports are accurate historical records
- Reports reflect what was actually sold
- No inventory data exists to query
- Complete financial picture from orders

### 4. There Is NO Inventory Tracking

The system does not track:
- Stock levels
- Quantity on hand
- Stock movements
- Inventory adjustments

Menu availability is managed manually via product `is_active` flag.

### 5. Billing Must ALWAYS Succeed

Sales proceed without any validation beyond product existence.

- No stock validation (inventory doesn't exist)
- No "insufficient stock" errors
- Billing is always available
- Fast, simple ordering process

### 6. Immutability Applies to Orders and Order Items

- Orders are permanent records
- Order items are permanent records
- Tax values are permanent records
- All financial data is immutable

---

## 1. PRODUCT LOGIC

A Product is a **menu item**, not a stock unit.

### Product Fields

- `id` (UUID, primary key)
- `name` (required)
- `sku` (unique, stable identifier)
- `barcode` (unique, scanner-based)
- `selling_price` (required)
- `tax_rate` (required, percentage)
- `category_id` (FK → categories.id, nullable)
- `unit` (pcs / kg / litre)
- `is_active` (boolean) - Controls menu availability
- `created_at` (server timestamp)
- `updated_at` (server timestamp) - Menu items can change

### Product Rules

- Products are **NEVER hard-deleted**
- Products can be **activated / deactivated** via `is_active`
- SKU and barcode must be **unique**
- Products are menu items - changes are infrequent but allowed
- Tax rate is stored on product for calculation at sale time
- Category assignment is optional (owner-managed)

### Menu Availability

Menu availability is controlled by the `is_active` flag:
- `is_active = true` → Item appears on menu, can be ordered
- `is_active = false` → Item hidden from menu, cannot be ordered
- Owner manually manages availability (no automatic stock-based logic)

---

## 2. ORDER LOGIC (BILLING)

Orders (bills) are **immutable financial records** and the single source of truth.

### Order Rules

- Orders can **NEVER be updated or deleted**
- Order creation must be **atomic**
- Tax is calculated and frozen at order creation
- **No stock validation** - billing always proceeds
- Orders are permanent financial records

### Bill Fields

- `id` (UUID, primary key)
- `bill_number` (unique, sequential or generated)
- `subtotal` (amount before tax, required)
- `tax_amount` (total tax for the order, required)
- `total_amount` (subtotal + tax_amount, required)
- `payment_method` (CASH / UPI / CARD)
- `created_at` (server timestamp)

### Bill Items (Line Items)

- `id` (UUID, primary key)
- `bill_id` (FK → bills.id)
- `product_id` (FK → products.id)
- `product_name_snapshot` (snapshot at sale time)
- `category_name_snapshot` (snapshot at sale time, nullable)
- `quantity` (required)
- `selling_price` (snapshot at sale time)
- `tax_rate` (snapshot at sale time, from product)
- `tax_amount` (calculated and frozen at sale time)
- `line_subtotal` (price × quantity, before tax)
- `line_total` (price × quantity + tax, after tax)
- `created_at` (server timestamp)

### Tax Calculation

Tax is calculated at order creation:

```
For each bill_item:
  line_subtotal = selling_price × quantity
  tax_amount = line_subtotal × (tax_rate / 100)
  line_total = line_subtotal + tax_amount

Bill totals:
  subtotal = SUM(line_subtotal)
  tax_amount = SUM(tax_amount)
  total_amount = subtotal + tax_amount
```

**All tax values are frozen in bill_items and never change.**

**All product information is snapshotted** to ensure historical accuracy even if products are later modified or deleted.

---

## 3. CATEGORY LOGIC

Categories are owner-managed menu groupings.

### Category Fields

- `id` (UUID, primary key)
- `name` (required, unique)
- `is_active` (boolean)
- `display_order` (integer, for sorting)
- `created_at` (server timestamp)
- `updated_at` (server timestamp)

### Category Rules

- Categories are owner-managed
- Categories can be activated/deactivated
- Display order controls menu organization
- Categories are optional (products can exist without category)
- Category names are snapshotted in bill_items for historical accuracy

---

## Why Reports Are the Product

Reports are a **first-class feature** of the cafe POS system.

### Report Requirements

1. **Sales Reports**
   - Total sales by date range
   - Sales by product
   - Sales by category
   - Sales by payment method
   - Derived exclusively from bills and bill_items

2. **Tax Reports**
   - Total tax collected
   - Tax by product
   - Tax by category
   - Tax by date range
   - Uses frozen tax values from bill_items

3. **Financial Reports**
   - Revenue summaries
   - Payment method breakdowns
   - Daily/weekly/monthly summaries
   - All derived from orders

### Report Data Sources

**Reports query ONLY:**
- `bills` table
- `bill_items` table
- `products` table (for current product details, not historical data)
- `categories` table (for current category details, not historical data)

**Reports use snapshots:**
- Product names from `bill_items.product_name_snapshot`
- Category names from `bill_items.category_name_snapshot`
- Tax values from `bill_items.tax_amount` (frozen)
- Prices from `bill_items.selling_price` (frozen)

### Report Accuracy

Reports are accurate because:
- Orders are immutable
- Tax values are frozen
- Product information is snapshotted
- Historical data never changes
- No dependencies on external data

---

## Database Requirements

### Tables

1. `categories` - Menu categories (owner-managed)
2. `products` - Menu items (master data)
3. `bills` - Immutable sales orders (single source of truth)
4. `bill_items` - Order line items with tax and product snapshots

### Constraints

- Unique SKU and barcode
- Unique category names
- Foreign key integrity
- Bills and bill_items are immutable (no UPDATE/DELETE)
- Tax values are required in bill_items
- All snapshot fields are required in bill_items

### Indexes

- Product barcode lookup (for scanner)
- Bill number (for bill lookups)
- Bill created_at (for date range reports)
- Bill_items bill_id (for order details)
- Bill_items product_id (for product sales reports)
- Bill_items created_at (for chronological reports)
- Category display_order (for menu organization)

### Timestamps

- All timestamps use server-side `NOW()`
- No `updated_at` fields on bills or bill_items (immutability principle)
- Products and categories have `updated_at` (menu items can change)

### Row Level Security (RLS)

- Authenticated users can read/write
- No public access
- Single-tenant system (no user_id filtering needed)

---

## Data Flow

### Creating a Bill (Core Flow)

1. Validate all products exist and are active
2. **Snapshot product information** (name, category, price, tax_rate)
3. **Calculate tax for each item** (from product.tax_rate)
4. **Calculate totals** (subtotal, tax, total)
5. Create bill record
6. Create bill items **with frozen tax values and product snapshots**
7. All operations in a transaction (atomic)

**Key Point**: No stock validation. Billing always proceeds.

### Generating a Sales Report

1. Query bills within date range
2. Join with bill_items
3. Use snapshot fields from bill_items (not current product data)
4. Aggregate by date/product/category/payment method
5. Use frozen tax values from bill_items
6. Return report data

**Key Point**: Reports use snapshots, ensuring historical accuracy.

### Generating a Tax Report

1. Query bill_items within date range
2. Sum tax_amount from bill_items (frozen values)
3. Group by product/category/date as needed
4. Use snapshot fields for product/category names
5. Return tax report

**Key Point**: Uses frozen tax values and snapshots, not calculated or current values.

### Managing Menu Availability

1. Owner sets `is_active = false` on product
2. Product no longer appears in menu
3. Product cannot be added to new orders
4. Historical orders remain unchanged (snapshots preserved)

**Key Point**: Manual control, no automatic inventory-based logic.

---

## Immutability Guarantees

- **Products**: Can be deactivated and updated, but never deleted
- **Categories**: Can be deactivated and updated, but never deleted
- **Bills**: No UPDATE or DELETE operations
- **Bill Items**: No UPDATE or DELETE operations
- **Tax Values**: Frozen at sale time, never change
- **Product Snapshots**: Frozen at sale time, never change

This ensures:
- Complete audit trail
- Financial integrity
- Tax compliance
- Accurate historical reports
- No data tampering
- Historical accuracy even if products change

---

## Out of Scope (V1)

- Discounts
- Returns
- Customer tables
- Multi-location support
- Inventory tracking (removed by design)

---

## Summary

**Cafe POS Core Truths:**

1. Orders are the single source of truth
2. Tax is calculated and frozen at sale time
3. Reports derive only from orders
4. Inventory does not exist in the system
5. Billing always succeeds
6. Immutability applies to orders and order items
7. Product information is snapshotted for historical accuracy

**The system prioritizes:**
- Accurate billing
- Correct tax capture
- Descriptive sales & tax reports
- Simple, fast UI for cafes
- Historical accuracy through snapshots

**Inventory does not exist in the system.**
