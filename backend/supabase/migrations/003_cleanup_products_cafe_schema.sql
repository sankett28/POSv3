-- Migration: Cleanup Products Table for Cafe POS
-- Removes retail-oriented constraints and makes fields cafe-appropriate
-- Makes SKU and barcode optional, relaxes unit constraints
-- Preserves all historical data

BEGIN;

-- ============================================================================
-- PRODUCTS TABLE CLEANUP
-- ============================================================================
-- Transform products table from retail-oriented to cafe-oriented
-- Products are menu items, not stock units

-- Step 1: Remove NOT NULL constraint from SKU and make it nullable
-- First, set NULL for any empty strings (if any exist)
UPDATE products 
SET sku = NULL 
WHERE sku IS NOT NULL AND LENGTH(TRIM(sku)) = 0;

-- Drop the NOT NULL constraint
ALTER TABLE products 
ALTER COLUMN sku DROP NOT NULL;

-- Drop the SKU not-empty check constraint (no longer needed)
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_sku_not_empty;

-- Step 2: Adjust SKU unique constraint to only apply when value is present
-- Drop existing unique constraint
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_sku_key;

-- Create partial unique index (only enforces uniqueness when SKU is not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku_unique 
ON products(sku) 
WHERE sku IS NOT NULL;

-- Step 3: Adjust barcode unique constraint to only apply when value is present
-- Drop existing unique constraint (if it exists as a constraint)
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_barcode_key;

-- Drop existing unique index if it exists
DROP INDEX IF EXISTS idx_products_barcode_unique;

-- Create partial unique index (only enforces uniqueness when barcode is not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode_unique 
ON products(barcode) 
WHERE barcode IS NOT NULL;

-- Update existing barcode index to be partial (if it exists)
DROP INDEX IF EXISTS idx_products_barcode;
CREATE INDEX IF NOT EXISTS idx_products_barcode 
ON products(barcode) 
WHERE barcode IS NOT NULL;

-- Step 4: Make unit nullable and relax CHECK constraint
-- Unit is optional for cafe menu items (some items don't need units)
ALTER TABLE products 
ALTER COLUMN unit DROP NOT NULL;

-- Drop the restrictive unit CHECK constraint
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_unit_check;

-- Create a more flexible unit constraint (allows NULL and common units)
-- For cafe: pcs, kg, litre, cup, plate, bowl, etc.
ALTER TABLE products 
ADD CONSTRAINT products_unit_check 
CHECK (
    unit IS NULL 
    OR unit IN ('pcs', 'kg', 'litre', 'cup', 'plate', 'bowl', 'serving', 'piece', 'bottle', 'can')
);

-- Step 5: Remove any inventory-related constraints or checks
-- (These shouldn't exist, but we'll be safe and drop them if they do)
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_stock_check;

ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_quantity_check;

ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_min_stock_check;

ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_reorder_level_check;

ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_available_quantity_check;

-- Step 6: Drop any inventory-related columns if they exist
-- (These shouldn't exist based on initial schema, but we'll check)
DO $$
BEGIN
    -- Drop stock column if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'stock'
    ) THEN
        ALTER TABLE products DROP COLUMN stock;
    END IF;

    -- Drop quantity column if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'quantity'
    ) THEN
        ALTER TABLE products DROP COLUMN quantity;
    END IF;

    -- Drop available_quantity column if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'available_quantity'
    ) THEN
        ALTER TABLE products DROP COLUMN available_quantity;
    END IF;

    -- Drop min_stock column if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'min_stock'
    ) THEN
        ALTER TABLE products DROP COLUMN min_stock;
    END IF;

    -- Drop reorder_level column if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'reorder_level'
    ) THEN
        ALTER TABLE products DROP COLUMN reorder_level;
    END IF;

    -- Drop inventory_quantity column if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'inventory_quantity'
    ) THEN
        ALTER TABLE products DROP COLUMN inventory_quantity;
    END IF;
END $$;

-- ============================================================================
-- UPDATE COMMENTS FOR CLARITY
-- ============================================================================

COMMENT ON TABLE products IS 
'Menu items for cafe POS. Products are owner-managed menu items, not stock units. 
Inventory tracking does not exist in the system.';

COMMENT ON COLUMN products.sku IS 
'Optional SKU (Stock Keeping Unit). Not required for cafe menu items. 
Unique when present.';

COMMENT ON COLUMN products.barcode IS 
'Optional barcode for scanner support. Not required for cafe menu items. 
Unique when present.';

COMMENT ON COLUMN products.unit IS 
'Optional unit of measurement (pcs, kg, litre, cup, plate, etc.). 
Not required for all cafe menu items.';

COMMENT ON COLUMN products.name IS 
'Product name (menu item name). Required.';

COMMENT ON COLUMN products.selling_price IS 
'Selling price. Required.';

COMMENT ON COLUMN products.tax_rate IS 
'Tax rate percentage (0-100). Required for tax calculation at sale time.';

COMMENT ON COLUMN products.category_id IS 
'Optional category assignment for menu organization.';

COMMENT ON COLUMN products.is_active IS 
'Controls menu availability. true = visible and orderable, false = hidden.';

-- ============================================================================
-- VERIFY FINAL PRODUCTS TABLE STRUCTURE
-- ============================================================================
-- Expected columns after cleanup:
-- id (uuid, primary key)
-- name (varchar, NOT NULL)
-- category_id (uuid, FK, nullable)
-- selling_price (decimal, NOT NULL)
-- tax_rate (decimal, NOT NULL)
-- sku (varchar, nullable, UNIQUE if present)
-- barcode (varchar, nullable, UNIQUE if present)
-- unit (varchar, nullable, flexible CHECK)
-- is_active (boolean, NOT NULL)
-- created_at (timestamptz, NOT NULL)
-- updated_at (timestamptz, NOT NULL)

COMMIT;

