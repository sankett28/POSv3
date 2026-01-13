-- Migration: Remove Inventory, Add Tax & Categories
-- This migration removes inventory tracking and strengthens order/tax data
-- Inventory table is deprecated but not dropped to preserve historical data

BEGIN;

-- ============================================================================
-- DEPRECATE INVENTORY LEDGER
-- ============================================================================
-- Mark inventory_ledger as deprecated
-- DO NOT DROP - preserves historical data if needed
-- Application logic should no longer reference this table

COMMENT ON TABLE inventory_ledger IS 
'DEPRECATED: This table is no longer used. Inventory tracking has been removed from the system. 
The system is now a SALES + TAX + REPORTING system only. 
This table is kept for historical data preservation only. 
DO NOT use this table in application logic.';

COMMENT ON COLUMN inventory_ledger.product_id IS 
'DEPRECATED: Inventory tracking removed. This column is no longer used.';

COMMENT ON COLUMN inventory_ledger.quantity IS 
'DEPRECATED: Inventory tracking removed. This column is no longer used.';

COMMENT ON COLUMN inventory_ledger.reference_type IS 
'DEPRECATED: Inventory tracking removed. This column is no longer used.';

COMMENT ON COLUMN inventory_ledger.reference_id IS 
'DEPRECATED: Inventory tracking removed. This column is no longer used.';

-- Remove foreign key constraint that might block operations
-- Keep the table but remove dependencies
ALTER TABLE inventory_ledger 
DROP CONSTRAINT IF EXISTS inventory_ledger_product_id_fkey;

-- Re-add as a weak reference (no cascade, no blocking)
ALTER TABLE inventory_ledger
ADD CONSTRAINT inventory_ledger_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- ============================================================================
-- CREATE CATEGORIES TABLE
-- ============================================================================
-- Owner-managed menu categories for organizing products

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT categories_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Index for display ordering
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order) WHERE is_active = true;

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can manage all categories
CREATE POLICY "Authenticated users can manage categories" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- UPDATE PRODUCTS TABLE
-- ============================================================================
-- Add tax_rate and category_id to products
-- Add updated_at for menu item changes

-- Add tax_rate column (required for tax calculation at sale time)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00 
CHECK (tax_rate >= 0 AND tax_rate <= 100);

-- Add category_id column (optional, owner-managed)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Add updated_at column (menu items can change)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id) WHERE category_id IS NOT NULL;

-- Index for active products (menu availability)
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active) WHERE is_active = true;

-- ============================================================================
-- UPDATE BILLS TABLE
-- ============================================================================
-- Add subtotal and tax_amount fields for complete financial records

-- Add subtotal (amount before tax)
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00 
CHECK (subtotal >= 0);

-- Add tax_amount (total tax for the order)
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 
CHECK (tax_amount >= 0);

-- Update existing bills to calculate subtotal and tax_amount from bill_items
-- This is a data migration for existing records
DO $$
DECLARE
    bill_record RECORD;
    calculated_subtotal DECIMAL(10, 2);
    calculated_tax DECIMAL(10, 2);
BEGIN
    FOR bill_record IN SELECT id, total_amount FROM bills WHERE subtotal = 0 AND tax_amount = 0 LOOP
        -- Calculate subtotal and tax from bill_items
        -- Note: This assumes old bill_items don't have tax fields yet
        -- For existing bills, we'll set tax_amount = 0 and subtotal = total_amount
        -- New bills will have proper tax calculation
        UPDATE bills
        SET subtotal = bill_record.total_amount,
            tax_amount = 0.00
        WHERE id = bill_record.id;
    END LOOP;
END $$;

-- Add constraint: total_amount should equal subtotal + tax_amount
-- Note: This is informational, we'll allow slight rounding differences
ALTER TABLE bills
DROP CONSTRAINT IF EXISTS bills_total_check;

ALTER TABLE bills
ADD CONSTRAINT bills_total_consistency CHECK (
    ABS(total_amount - (subtotal + tax_amount)) < 0.01
);

-- Index for date range reports
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at);

-- ============================================================================
-- UPDATE BILL_ITEMS TABLE
-- ============================================================================
-- Add tax fields and product snapshots for complete historical records

-- Add tax_rate (snapshot at sale time)
ALTER TABLE bill_items
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00 
CHECK (tax_rate >= 0 AND tax_rate <= 100);

-- Add tax_amount (calculated and frozen at sale time)
ALTER TABLE bill_items
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 
CHECK (tax_amount >= 0);

-- Add line_subtotal (price × quantity, before tax)
ALTER TABLE bill_items
ADD COLUMN IF NOT EXISTS line_subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00 
CHECK (line_subtotal >= 0);

-- Add product_name_snapshot (snapshot at sale time)
ALTER TABLE bill_items
ADD COLUMN IF NOT EXISTS product_name_snapshot VARCHAR(255) NOT NULL DEFAULT '';

-- Add category_name_snapshot (snapshot at sale time, nullable)
ALTER TABLE bill_items
ADD COLUMN IF NOT EXISTS category_name_snapshot VARCHAR(255);

-- Update existing bill_items to populate snapshots from products
-- This is a data migration for existing records
DO $$
DECLARE
    item_record RECORD;
    product_name_val VARCHAR(255);
    category_name_val VARCHAR(255);
BEGIN
    FOR item_record IN 
        SELECT bi.id, bi.product_id, bi.selling_price, bi.quantity
        FROM bill_items bi
        WHERE bi.product_name_snapshot = '' OR bi.product_name_snapshot IS NULL
    LOOP
        -- Get product name
        SELECT name INTO product_name_val
        FROM products
        WHERE id = item_record.product_id;
        
        -- Get category name if exists
        SELECT c.name INTO category_name_val
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = item_record.product_id;
        
        -- Calculate line_subtotal (for old records, assume no tax)
        -- line_subtotal = selling_price × quantity
        -- line_total already exists, so tax_amount = line_total - line_subtotal
        UPDATE bill_items
        SET 
            product_name_snapshot = COALESCE(product_name_val, 'Unknown Product'),
            category_name_snapshot = category_name_val,
            line_subtotal = item_record.selling_price * item_record.quantity,
            tax_amount = line_total - (item_record.selling_price * item_record.quantity),
            tax_rate = 0.00  -- Old records had no tax
        WHERE id = item_record.id;
    END LOOP;
END $$;

-- Add constraint: line_total should equal line_subtotal + tax_amount
ALTER TABLE bill_items
DROP CONSTRAINT IF EXISTS bill_items_total_check;

ALTER TABLE bill_items
ADD CONSTRAINT bill_items_total_consistency CHECK (
    ABS(line_total - (line_subtotal + tax_amount)) < 0.01
);

-- Index for product sales reports
CREATE INDEX IF NOT EXISTS idx_bill_items_created_at ON bill_items(created_at);

-- Index for category reports (using snapshot)
CREATE INDEX IF NOT EXISTS idx_bill_items_category_snapshot ON bill_items(category_name_snapshot) 
WHERE category_name_snapshot IS NOT NULL;

-- ============================================================================
-- CREATE UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
-- Function to automatically update updated_at timestamp

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR CLARITY
-- ============================================================================

COMMENT ON TABLE categories IS 
'Owner-managed menu categories for organizing products. Categories are optional.';

COMMENT ON COLUMN products.tax_rate IS 
'Tax rate percentage (0-100) stored on product for calculation at sale time.';

COMMENT ON COLUMN products.category_id IS 
'Optional category assignment. Owner-managed menu organization.';

COMMENT ON COLUMN products.updated_at IS 
'Timestamp of last update. Menu items can change over time.';

COMMENT ON COLUMN bills.subtotal IS 
'Amount before tax. Calculated from bill_items line_subtotal.';

COMMENT ON COLUMN bills.tax_amount IS 
'Total tax for the order. Calculated from bill_items tax_amount. Frozen at sale time.';

COMMENT ON COLUMN bill_items.tax_rate IS 
'Tax rate snapshot at sale time. Frozen value from product.tax_rate.';

COMMENT ON COLUMN bill_items.tax_amount IS 
'Tax amount calculated and frozen at sale time. Never changes after order creation.';

COMMENT ON COLUMN bill_items.line_subtotal IS 
'Price × quantity before tax. Frozen at sale time.';

COMMENT ON COLUMN bill_items.product_name_snapshot IS 
'Product name snapshot at sale time. Ensures historical accuracy even if product changes.';

COMMENT ON COLUMN bill_items.category_name_snapshot IS 
'Category name snapshot at sale time. Ensures historical accuracy even if category changes.';

COMMIT;

