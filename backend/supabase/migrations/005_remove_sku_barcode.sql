-- Migration: Remove SKU and Barcode Columns
-- This migration removes retail-oriented SKU and barcode fields from products table
-- These fields are not needed for a cafe POS system

BEGIN;

-- ============================================================================
-- DROP SKU AND BARCODE COLUMNS
-- ============================================================================

-- Drop indexes first (must drop before columns)
DROP INDEX IF EXISTS idx_products_sku_unique;
DROP INDEX IF EXISTS idx_products_barcode_unique;
DROP INDEX IF EXISTS idx_products_barcode;

-- Drop the columns
ALTER TABLE products DROP COLUMN IF EXISTS sku;
ALTER TABLE products DROP COLUMN IF EXISTS barcode;

-- ============================================================================
-- UPDATE COMMENTS
-- ============================================================================

COMMENT ON TABLE products IS 'Menu items for cafe POS. Products are menu items, not stock units. Inventory does not exist in this system.';

COMMIT;

