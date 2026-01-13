-- Migration: Tax Groups Architecture
-- This migration implements a production-grade tax architecture supporting:
-- - Indian GST (CGST + SGST) with configurable split
-- - Inclusive and exclusive pricing
-- - Audit-safe snapshot billing
-- - Tax groups as configuration (products reference tax groups, not direct rates)
--
-- CORE PRINCIPLES:
-- 1. Tax rules are CONFIGURATION (tax_groups table)
-- 2. Tax results are IMMUTABLE FACTS (snapshot in bill_items)
-- 3. Products reference tax groups (not direct tax rates)
-- 4. Tax calculated ONCE at billing time
-- 5. Frontend performs ZERO tax math
-- 6. Reports sum stored values only

BEGIN;

-- ============================================================================
-- CREATE TAX_GROUPS TABLE
-- ============================================================================
-- Tax groups are configuration that define tax rules.
-- Products reference tax groups instead of storing tax rates directly.

CREATE TABLE IF NOT EXISTS tax_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    total_rate DECIMAL(5, 2) NOT NULL CHECK (total_rate >= 0 AND total_rate <= 100),
    split_type VARCHAR(20) NOT NULL DEFAULT 'GST_50_50' 
        CHECK (split_type IN ('GST_50_50', 'NO_SPLIT')),
    is_tax_inclusive BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT tax_groups_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Index for active tax groups (common query)
CREATE INDEX IF NOT EXISTS idx_tax_groups_is_active ON tax_groups(is_active) WHERE is_active = true;

-- Index for name lookup
CREATE INDEX IF NOT EXISTS idx_tax_groups_name ON tax_groups(name);

-- Enable RLS
ALTER TABLE tax_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can read all tax groups
CREATE POLICY "Authenticated users can view tax groups" ON tax_groups
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policy: Authenticated users can create/update tax groups
-- TODO: Upgrade to Admin/Owner only when role-based auth is implemented
CREATE POLICY "Authenticated users can manage tax groups" ON tax_groups
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- UPDATE PRODUCTS TABLE
-- ============================================================================
-- Add tax_group_id foreign key to products.
-- Mark tax_rate as deprecated (keep for migration compatibility).

-- Add tax_group_id column (nullable for migration period)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS tax_group_id UUID REFERENCES tax_groups(id) ON DELETE SET NULL;

-- Add index for tax_group_id lookups
CREATE INDEX IF NOT EXISTS idx_products_tax_group_id ON products(tax_group_id) WHERE tax_group_id IS NOT NULL;

-- Mark tax_rate as deprecated (keep column for backward compatibility)
COMMENT ON COLUMN products.tax_rate IS 
'DEPRECATED: Tax rate stored directly on product. 
Products should now reference tax_groups via tax_group_id.
This column is kept for migration compatibility and will be removed in a future version.
DO NOT use this column in new code. Use tax_group_id instead.';

-- Update comment for tax_group_id
COMMENT ON COLUMN products.tax_group_id IS 
'Foreign key to tax_groups table. Products reference tax groups instead of storing tax rates directly.
This enables flexible tax configuration and audit-safe billing.';

-- ============================================================================
-- UPDATE BILL_ITEMS TABLE
-- ============================================================================
-- Add comprehensive tax snapshot columns for audit-safe billing.
-- These values are frozen at billing time and never change.

-- Add tax group name snapshot (for historical accuracy)
ALTER TABLE bill_items
ADD COLUMN IF NOT EXISTS tax_group_name_snapshot VARCHAR(255);

-- Add tax rate snapshot (frozen at billing time)
ALTER TABLE bill_items
ADD COLUMN IF NOT EXISTS tax_rate_snapshot DECIMAL(5, 2) 
    CHECK (tax_rate_snapshot >= 0 AND tax_rate_snapshot <= 100);

-- Add inclusive/exclusive snapshot (frozen at billing time)
ALTER TABLE bill_items
ADD COLUMN IF NOT EXISTS is_tax_inclusive_snapshot BOOLEAN NOT NULL DEFAULT false;

-- Add taxable value (price before tax for exclusive, extracted price for inclusive)
ALTER TABLE bill_items
ADD COLUMN IF NOT EXISTS taxable_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00 
    CHECK (taxable_value >= 0);

-- Add CGST amount (Central GST - 50% of tax for GST_50_50 split)
ALTER TABLE bill_items
ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 
    CHECK (cgst_amount >= 0);

-- Add SGST amount (State GST - 50% of tax for GST_50_50 split)
ALTER TABLE bill_items
ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 
    CHECK (sgst_amount >= 0);

-- Update existing bill_items to populate defaults for new columns
-- This preserves historical data - old bills won't have these fields populated
-- New bills will populate all snapshot fields
UPDATE bill_items
SET 
    tax_rate_snapshot = COALESCE(tax_rate, 0.00),
    is_tax_inclusive_snapshot = false,
    taxable_value = COALESCE(line_subtotal, selling_price * quantity, 0.00),
    cgst_amount = COALESCE(tax_amount, 0.00) / 2.0,
    sgst_amount = COALESCE(tax_amount, 0.00) / 2.0
WHERE tax_rate_snapshot IS NULL;

-- Index for tax reporting (group by tax_rate_snapshot)
CREATE INDEX IF NOT EXISTS idx_bill_items_tax_rate_snapshot ON bill_items(tax_rate_snapshot);

-- Index for date range tax reports
CREATE INDEX IF NOT EXISTS idx_bill_items_tax_created_at ON bill_items(created_at) 
    WHERE tax_rate_snapshot IS NOT NULL;

-- ============================================================================
-- CREATE DEFAULT TAX GROUPS
-- ============================================================================
-- Create common Indian GST tax groups for immediate use.
-- These can be customized by owners/admins later.

INSERT INTO tax_groups (name, total_rate, split_type, is_tax_inclusive, is_active) VALUES
    ('No Tax', 0.00, 'NO_SPLIT', false, true),
    ('GST 5%', 5.00, 'GST_50_50', false, true),
    ('GST 12%', 12.00, 'GST_50_50', false, true),
    ('GST 18%', 18.00, 'GST_50_50', false, true),
    ('GST 28%', 28.00, 'GST_50_50', false, true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- DATA MIGRATION: MIGRATE EXISTING PRODUCTS
-- ============================================================================
-- Map existing products.tax_rate to tax_group_id.
-- Create tax groups for any unique tax rates found, or assign to closest match.

DO $$
DECLARE
    product_record RECORD;
    matching_tax_group_id UUID;
    new_tax_group_id UUID;
    tax_rate_val DECIMAL(5, 2);
BEGIN
    -- For each product with a tax_rate but no tax_group_id
    FOR product_record IN 
        SELECT id, tax_rate 
        FROM products 
        WHERE tax_group_id IS NULL 
        AND tax_rate IS NOT NULL
    LOOP
        tax_rate_val := product_record.tax_rate;
        
        -- Try to find matching default tax group (exact match or closest)
        SELECT id INTO matching_tax_group_id
        FROM tax_groups
        WHERE total_rate = tax_rate_val
        AND is_active = true
        ORDER BY created_at
        LIMIT 1;
        
        -- If no exact match, find closest default group
        IF matching_tax_group_id IS NULL THEN
            SELECT id INTO matching_tax_group_id
            FROM tax_groups
            WHERE ABS(total_rate - tax_rate_val) <= 0.01
            AND is_active = true
            ORDER BY ABS(total_rate - tax_rate_val), created_at
            LIMIT 1;
        END IF;
        
        -- If still no match, create a new tax group for this rate
        IF matching_tax_group_id IS NULL THEN
            INSERT INTO tax_groups (name, total_rate, split_type, is_tax_inclusive, is_active)
            VALUES (
                'GST ' || tax_rate_val || '% (Migrated)',
                tax_rate_val,
                'GST_50_50',
                false,
                true
            )
            RETURNING id INTO new_tax_group_id;
            
            matching_tax_group_id := new_tax_group_id;
        END IF;
        
        -- Update product with tax_group_id
        UPDATE products
        SET tax_group_id = matching_tax_group_id
        WHERE id = product_record.id;
    END LOOP;
    
    -- For products with NULL tax_rate, assign to "No Tax" group
    UPDATE products
    SET tax_group_id = (SELECT id FROM tax_groups WHERE name = 'No Tax' LIMIT 1)
    WHERE tax_group_id IS NULL;
END $$;

-- ============================================================================
-- UPDATE COMMENTS FOR CLARITY
-- ============================================================================

COMMENT ON TABLE tax_groups IS 
'Tax groups define tax rules as configuration. Products reference tax groups instead of storing tax rates directly.
This enables flexible tax management, audit-safe billing, and GST compliance (CGST + SGST split).';

COMMENT ON COLUMN tax_groups.name IS 
'Unique name for the tax group (e.g., "GST 18%", "No Tax").';

COMMENT ON COLUMN tax_groups.total_rate IS 
'Total tax rate percentage (0-100). For GST, this is the combined CGST + SGST rate.';

COMMENT ON COLUMN tax_groups.split_type IS 
'How to split the tax: GST_50_50 (split into CGST and SGST), NO_SPLIT (single tax amount).';

COMMENT ON COLUMN tax_groups.is_tax_inclusive IS 
'true = price includes tax (extract tax from price), false = price excludes tax (add tax to price).';

COMMENT ON COLUMN tax_groups.is_active IS 
'true = can be assigned to products, false = cannot be assigned (historical preservation).';

COMMENT ON COLUMN bill_items.tax_group_name_snapshot IS 
'Tax group name snapshot at billing time. Frozen value for historical accuracy.';

COMMENT ON COLUMN bill_items.tax_rate_snapshot IS 
'Tax rate snapshot at billing time. Frozen value from tax_group.total_rate at time of sale.';

COMMENT ON COLUMN bill_items.is_tax_inclusive_snapshot IS 
'Tax inclusive flag snapshot at billing time. Frozen value from tax_group.is_tax_inclusive at time of sale.';

COMMENT ON COLUMN bill_items.taxable_value IS 
'Taxable value (price before tax for exclusive pricing, extracted price for inclusive pricing).
Frozen at billing time for audit compliance.';

COMMENT ON COLUMN bill_items.cgst_amount IS 
'Central GST amount (50% of tax for GST_50_50 split). Frozen at billing time for GST compliance.';

COMMENT ON COLUMN bill_items.sgst_amount IS 
'State GST amount (50% of tax for GST_50_50 split). Frozen at billing time for GST compliance.';

-- ============================================================================
-- CREATE UPDATED_AT TRIGGER FOR TAX_GROUPS
-- ============================================================================

-- Use existing trigger function if it exists, otherwise create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for tax_groups
DROP TRIGGER IF EXISTS update_tax_groups_updated_at ON tax_groups;
CREATE TRIGGER update_tax_groups_updated_at
    BEFORE UPDATE ON tax_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

