-- Initial database schema for POS V1
-- Immutable ledger-based inventory with immutable bills
-- Single-tenant system (no user_id columns)

BEGIN;

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
-- Master data only. Products define WHAT can be sold.
-- Products do NOT store stock. Stock is calculated from inventory_ledger.
-- Products are never hard-deleted, only activated/deactivated.

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    barcode VARCHAR(100) UNIQUE,
    selling_price DECIMAL(10, 2) NOT NULL CHECK (selling_price > 0),
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('pcs', 'kg', 'litre')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT products_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT products_sku_not_empty CHECK (LENGTH(TRIM(sku)) > 0)
);

-- ============================================================================
-- INVENTORY LEDGER TABLE
-- ============================================================================
-- Immutable stock movements. Each entry is an event that cannot be changed.
-- Stock = SUM(quantity) WHERE product_id = X
-- Positive quantity = stock added, Negative quantity = stock removed (sale)

CREATE TABLE IF NOT EXISTS inventory_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,  -- Signed: positive = incoming, negative = outgoing
    reference_type VARCHAR(20) NOT NULL CHECK (reference_type IN ('STOCK_ADD', 'SALE')),
    reference_id UUID,  -- bill_id for sales, NULL for stock additions
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT inventory_ledger_quantity_not_zero CHECK (quantity != 0)
);

-- ============================================================================
-- BILLS TABLE
-- ============================================================================
-- Immutable financial records. Bills can NEVER be updated or deleted.
-- Bill creation must be atomic with inventory ledger entries.

CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(20) NOT NULL DEFAULT 'CASH' CHECK (payment_method IN ('CASH', 'UPI', 'CARD')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- BILL ITEMS TABLE
-- ============================================================================
-- Line items for each bill. Immutable records.
-- selling_price is a snapshot at sale time (product price may change later).

CREATE TABLE IF NOT EXISTS bill_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    selling_price DECIMAL(10, 2) NOT NULL CHECK (selling_price >= 0),
    line_total DECIMAL(10, 2) NOT NULL CHECK (line_total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Performance indexes for common queries

-- Product barcode lookup (for scanner)
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;

-- Inventory ledger product_id (for stock calculations)
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_product_id ON inventory_ledger(product_id);

-- Inventory ledger created_at (for chronological queries)
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_created_at ON inventory_ledger(created_at);

-- Bill number lookup
CREATE INDEX IF NOT EXISTS idx_bills_bill_number ON bills(bill_number);

-- Bill items by bill_id (for retrieving bill details)
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);

-- Bill items by product_id (for product sales history)
CREATE INDEX IF NOT EXISTS idx_bill_items_product_id ON bill_items(product_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on all tables
-- Authenticated users can read/write (single-tenant system)

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

-- Products: Authenticated users can manage all products
CREATE POLICY "Authenticated users can manage products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Inventory Ledger: Authenticated users can view and create entries
-- No UPDATE or DELETE policies (immutability)
CREATE POLICY "Authenticated users can view inventory ledger" ON inventory_ledger
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create inventory ledger entries" ON inventory_ledger
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Bills: Authenticated users can view and create bills
-- No UPDATE or DELETE policies (immutability)
CREATE POLICY "Authenticated users can view bills" ON bills
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create bills" ON bills
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Bill Items: Authenticated users can view and create bill items
-- No UPDATE or DELETE policies (immutability)
CREATE POLICY "Authenticated users can view bill items" ON bill_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create bill items" ON bill_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

COMMIT;

