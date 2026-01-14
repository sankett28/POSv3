# Cafe POS Business Logic

## Core Philosophy

**A café POS is a financial and tax recording system with a fast ordering UI. Inventory does not exist in the system.**

This POS system is based on **FOUR core concepts**:

1. **PRODUCTS** define WHAT can be sold (menu items)
2. **TAX GROUPS** define HOW tax is calculated (tax configuration)
3. **ORDERS (BILLS)** define WHAT was sold (immutable financial records)
4. **TAX** is calculated and frozen at time of sale using TaxEngine

### Key Principles

- **Orders are the single source of truth**
- **Tax values are snapshotted at sale time**
- **Tax Groups are configuration** - Products reference tax groups
- **TaxEngine is the ONLY place for tax math**
- **Reports derive only from orders**
- **There is NO inventory tracking**
- **Billing always succeeds**
- **Service charge is optional with GST compliance**

---

## Cafe POS Core Truths

### 1. Orders/Bills Are the Single Source of Truth

All financial data, sales data, and tax data comes from orders (bills). Nothing else is authoritative.

- Reports are generated exclusively from bills and bill_items
- No inventory calculations in financial reports
- Historical accuracy is guaranteed by immutability
- Complete audit trail from orders only

### 2. Tax Is Calculated and Snapshot at Time of Sale

Tax rates and amounts are calculated when the order is created using the centralized **TaxEngine** and permanently stored in bill_items.

- Tax group configuration is fetched at sale time
- Tax is calculated using TaxEngine (the ONLY place for tax math)
- Tax values are frozen in bill_items (taxable_value, cgst_amount, sgst_amount, tax_amount)
- Tax values never change after order creation
- Reports use these frozen tax values
- All tax fields are stored as snapshots in bill_items

### 3. Tax Groups Are Configuration

Products reference **tax groups** instead of storing tax rates directly. This enables:

- Flexible tax management (change tax rates without updating products)
- Support for inclusive and exclusive pricing
- CGST/SGST split for Indian GST compliance
- Audit-safe billing with tax snapshots

**Tax groups define:**
- Total tax rate (0-100%)
- Split type (GST_50_50 for CGST/SGST, or NO_SPLIT)
- Inclusive/exclusive pricing flag
- Active status

### 4. TaxEngine Is the ONLY Place for Tax Math

All tax calculations are performed by the centralized **TaxEngine**:

- Handles inclusive pricing (extract tax from price)
- Handles exclusive pricing (add tax to price)
- Splits tax into CGST/SGST for GST compliance
- Uses Decimal precision for accurate calculations
- Pure functions with no side effects
- No database access
- Used by billing service for all tax calculations

### 5. Reports Are Derived ONLY from Orders

All sales reports, tax reports, and financial reports query bills and bill_items exclusively.

- Reports are accurate historical records
- Reports reflect what was actually sold
- No inventory data exists to query
- Complete financial picture from orders
- Uses snapshot fields for historical accuracy

### 6. There Is NO Inventory Tracking

The system does not track:
- Stock levels
- Quantity on hand
- Stock movements
- Inventory adjustments

Menu availability is managed manually via product `is_active` flag.

### 7. Billing Must ALWAYS Succeed

Sales proceed without any validation beyond product existence and tax group assignment.

- No stock validation (inventory doesn't exist)
- No "insufficient stock" errors
- Billing is always available
- Fast, simple ordering process
- Only validates: product exists, is active, has tax group assigned

### 8. Immutability Applies to Orders and Order Items

- Orders are permanent records
- Order items are permanent records
- Tax values are permanent records
- All financial data is immutable
- Product snapshots ensure historical accuracy

### 9. Service Charge Is Optional with GST Compliance

Service charge is an optional bill-level feature:

- Calculated on item subtotal (taxable value sum)
- Configurable rate (0-20%)
- GST applied on service charge using dedicated `SERVICE_CHARGE_GST` tax group
- Service charge GST is ALWAYS exclusive (Indian regulation)
- All values snapshotted at bill creation
- Can be enabled/disabled per bill

---

## 1. PRODUCT LOGIC

A Product is a **menu item**, not a stock unit.

### Product Fields

- `id` (UUID, primary key)
- `name` (required)
- `selling_price` (required)
- `tax_group_id` (FK → tax_groups.id, required) - **Products reference tax groups**
- `category_id` (FK → categories.id, nullable)
- `unit` (pcs / kg / litre / cup / plate / bowl / serving / piece / bottle / can)
- `is_active` (boolean) - Controls menu availability
- `created_at` (server timestamp)
- `updated_at` (server timestamp) - Menu items can change

### Product Rules

- Products are **NEVER hard-deleted**
- Products can be **activated / deactivated** via `is_active`
- Products **MUST have a tax_group_id assigned** (required)
- Products are menu items - changes are infrequent but allowed
- Tax group assignment enables flexible tax management
- Category assignment is optional (owner-managed)

### Menu Availability

Menu availability is controlled by the `is_active` flag:
- `is_active = true` → Item appears on menu, can be ordered
- `is_active = false` → Item hidden from menu, cannot be ordered
- Owner manually manages availability (no automatic stock-based logic)

---

## 2. TAX GROUP LOGIC

Tax groups are **configuration** that define tax rules.

### Tax Group Fields

- `id` (UUID, primary key)
- `name` (required, unique)
- `code` (optional, system-level code like "SERVICE_CHARGE_GST")
- `total_rate` (required, 0-100%)
- `split_type` (required, 'GST_50_50' or 'NO_SPLIT')
- `is_tax_inclusive` (required, boolean)
- `is_active` (required, boolean)
- `created_at` (server timestamp)
- `updated_at` (server timestamp)

### Tax Group Rules

- Tax groups are owner-managed configuration
- Products reference tax groups (not direct rates)
- Tax groups can be activated/deactivated
- Updating a tax group does NOT affect past bills (only new bills use updated config)
- Tax group names are snapshotted in bill_items for historical accuracy
- Default tax groups are created on migration (No Tax, GST 5%, 12%, 18%, 28%)

### Tax Group Types

**GST_50_50 Split:**
- Tax is split 50/50 into CGST and SGST
- Used for Indian GST compliance
- Most common for cafe items

**NO_SPLIT:**
- Tax is not split (all goes to CGST for reporting)
- Used for non-GST items or special cases

**Inclusive Pricing:**
- Price includes tax
- Tax is extracted from the price
- Formula: `taxable_value = price / (1 + tax_rate / 100)`

**Exclusive Pricing:**
- Price excludes tax
- Tax is added to the price
- Formula: `tax_amount = taxable_value × (tax_rate / 100)`

---

## 3. ORDER LOGIC (BILLING)

Orders (bills) are **immutable financial records** and the single source of truth.

### Order Rules

- Orders can **NEVER be updated or deleted**
- Order creation must be **atomic**
- Tax is calculated using **TaxEngine** (the ONLY place for tax math)
- Tax values are frozen at order creation
- **No stock validation** - billing always proceeds
- Orders are permanent financial records
- Service charge is optional and snapshotted

### Bill Fields

- `id` (UUID, primary key)
- `bill_number` (unique, sequential or generated)
- `subtotal` (amount before tax, required)
- `service_charge_enabled` (boolean, whether service charge was applied)
- `service_charge_rate` (decimal, 0-20%, snapshot)
- `service_charge_amount` (decimal, calculated on subtotal, snapshot)
- `service_charge_tax_rate_snapshot` (decimal, GST rate on service charge, snapshot)
- `service_charge_tax_amount` (decimal, total GST on service charge, snapshot)
- `service_charge_cgst_amount` (decimal, CGST on service charge, snapshot)
- `service_charge_sgst_amount` (decimal, SGST on service charge, snapshot)
- `tax_amount` (total tax for the order, required)
- `total_amount` (subtotal + service_charge_amount + tax_amount, required)
- `payment_method` (CASH / UPI / CARD)
- `created_at` (server timestamp)

### Bill Items (Line Items)

- `id` (UUID, primary key)
- `bill_id` (FK → bills.id)
- `product_id` (FK → products.id)
- `product_name_snapshot` (snapshot at sale time)
- `category_name_snapshot` (snapshot at sale time, nullable)
- `quantity` (required)
- `selling_price` (snapshot at sale time, stored as unit_price)
- `tax_group_name_snapshot` (snapshot at sale time)
- `tax_rate_snapshot` (snapshot at sale time, from tax_group.total_rate)
- `is_tax_inclusive_snapshot` (snapshot at sale time, from tax_group.is_tax_inclusive)
- `taxable_value` (price before tax for exclusive, extracted price for inclusive)
- `tax_amount` (calculated and frozen at sale time)
- `cgst_amount` (calculated and frozen at sale time)
- `sgst_amount` (calculated and frozen at sale time)
- `line_subtotal` (taxable_value, kept for backward compatibility)
- `line_total` (taxable_value + tax_amount, after tax)
- `created_at` (server timestamp)

### Tax Calculation Flow

Tax is calculated using **TaxEngine** (the ONLY place for tax math):

1. **Fetch tax group** for each product
2. **Calculate tax** using TaxEngine.calculate_line_item()
   - Handles inclusive/exclusive pricing
   - Splits into CGST/SGST if GST_50_50
   - Returns taxable_value, tax_amount, cgst_amount, sgst_amount, line_total
3. **Snapshot all tax values** in bill_items
4. **Calculate service charge** (if enabled) on item subtotal
5. **Calculate GST on service charge** using SERVICE_CHARGE_GST tax group
6. **Sum totals** for bill

**All tax values are frozen in bill_items and never change.**

**All product and tax group information is snapshotted** to ensure historical accuracy even if products or tax groups are later modified or deleted.

---

## 4. SERVICE CHARGE LOGIC

Service charge is an optional bill-level feature with GST compliance.

### Service Charge Rules

- Calculated on **item subtotal** (sum of taxable_value from all line items)
- Configurable rate (0-20%)
- **GST applied on service charge** using dedicated `SERVICE_CHARGE_GST` tax group
- Service charge GST is **ALWAYS exclusive** (Indian regulation)
- Can be enabled/disabled per bill
- All values snapshotted at bill creation

### Service Charge Calculation

1. Calculate item subtotal: `sum(taxable_value)` from all line items
2. Calculate service charge: `subtotal × (service_charge_rate / 100)`
3. Calculate GST on service charge using `SERVICE_CHARGE_GST` tax group
4. Total tax = item tax + GST on service charge
5. Total amount = subtotal + service_charge_amount + total_tax

### Service Charge Requirements

- `SERVICE_CHARGE_GST` tax group must be configured in Settings → Taxes
- Tax group must be active
- Tax group must have `is_tax_inclusive = false` (exclusive pricing enforced)

---

## 5. CATEGORY LOGIC

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
   - Tax by tax group
   - Tax by category
   - Tax by date range
   - CGST/SGST breakdown
   - Uses frozen tax values from bill_items snapshots

3. **Financial Reports**
   - Revenue summaries
   - Payment method breakdowns
   - Daily/weekly/monthly summaries
   - Service charge summaries
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
- Tax group names from `bill_items.tax_group_name_snapshot`
- Tax values from `bill_items.tax_amount`, `cgst_amount`, `sgst_amount` (frozen)
- Tax rates from `bill_items.tax_rate_snapshot` (frozen)
- Prices from `bill_items.selling_price` (frozen)
- Taxable values from `bill_items.taxable_value` (frozen)

### Report Accuracy

Reports are accurate because:
- Orders are immutable
- Tax values are frozen
- Product information is snapshotted
- Tax group information is snapshotted
- Historical data never changes
- No dependencies on external data
- All calculations use stored snapshot values (no recalculation)

---

## Database Requirements

### Tables

1. `tax_groups` - Tax configuration (rates, split types, inclusive/exclusive)
2. `categories` - Menu categories (owner-managed)
3. `products` - Menu items (reference tax groups via tax_group_id)
4. `bills` - Immutable sales orders (single source of truth)
5. `bill_items` - Order line items with comprehensive tax snapshots

### Constraints

- Unique tax group names
- Unique category names
- Foreign key integrity
- Products must have tax_group_id
- Bills and bill_items are immutable (no UPDATE/DELETE)
- Tax values are required in bill_items
- All snapshot fields are required in bill_items
- Service charge rate must be 0-20%

### Indexes

- Tax group name lookup
- Product tax_group_id (for tax group lookups)
- Bill number (for bill lookups)
- Bill created_at (for date range reports)
- Bill_items bill_id (for order details)
- Bill_items product_id (for product sales reports)
- Bill_items created_at (for chronological reports)
- Bill_items tax_rate_snapshot (for tax reports)
- Category display_order (for menu organization)

### Timestamps

- All timestamps use server-side `NOW()`
- No `updated_at` fields on bills or bill_items (immutability principle)
- Products, categories, and tax groups have `updated_at` (can change)

### Row Level Security (RLS)

- Authenticated users can read/write
- No public access
- Single-tenant system (no user_id filtering needed)

---

## Data Flow

### Creating a Bill (Core Flow)

1. Validate all products exist and are active
2. Validate all products have tax_group_id assigned
3. Fetch tax groups for each product
4. **Calculate tax using TaxEngine** (the ONLY place for tax math)
5. **Snapshot product information** (name, category, price)
6. **Snapshot tax group information** (name, rate, inclusive/exclusive flag)
7. **Snapshot all tax values** (taxable_value, tax_amount, cgst_amount, sgst_amount)
8. Calculate service charge (if enabled) on item subtotal
9. Calculate GST on service charge using SERVICE_CHARGE_GST tax group
10. Create bill record with totals
11. Create bill items **with all snapshot fields**
12. All operations in a transaction (atomic)

**Key Point**: No stock validation. Billing always proceeds. TaxEngine is the ONLY place for tax math.

### Generating a Tax Report

1. Query bill_items within date range
2. Group by tax_rate_snapshot or tax_group_name_snapshot
3. Sum tax_amount, cgst_amount, sgst_amount from bill_items (frozen values)
4. Sum taxable_value from bill_items (frozen values)
5. Use snapshot fields for tax group names
6. Return tax report

**Key Point**: Uses frozen tax values and snapshots, not calculated or current values. No recalculation.

### Generating a Sales Report

1. Query bills within date range
2. Join with bill_items
3. Use snapshot fields from bill_items (not current product data)
4. Aggregate by date/product/category/payment method
5. Use frozen tax values from bill_items
6. Return report data

**Key Point**: Reports use snapshots, ensuring historical accuracy.

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
- **Tax Groups**: Can be deactivated and updated, but never deleted (updates don't affect past bills)
- **Bills**: No UPDATE or DELETE operations
- **Bill Items**: No UPDATE or DELETE operations
- **Tax Values**: Frozen at sale time, never change
- **Product Snapshots**: Frozen at sale time, never change
- **Tax Group Snapshots**: Frozen at sale time, never change
- **Service Charge Snapshots**: Frozen at sale time, never change

This ensures:
- Complete audit trail
- Financial integrity
- Tax compliance
- Accurate historical reports
- No data tampering
- Historical accuracy even if products, tax groups, or categories change

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
2. Tax is calculated and frozen at sale time using TaxEngine
3. Tax Groups are configuration - Products reference tax groups
4. TaxEngine is the ONLY place for tax math
5. Reports derive only from orders using snapshot fields
6. Inventory does not exist in the system
7. Billing always succeeds
8. Immutability applies to orders and order items
9. Product and tax group information is snapshotted for historical accuracy
10. Service charge is optional with GST compliance

**The system prioritizes:**
- Accurate billing
- Correct tax capture
- Flexible tax management via tax groups
- Descriptive sales & tax reports
- Simple, fast UI for cafes
- Historical accuracy through snapshots
- GST compliance (CGST/SGST split)

**Inventory does not exist in the system.**
