-- Migration: Add code field to tax_groups and create SERVICE_CHARGE_GST tax group
-- This migration:
-- 1. Adds a code field to tax_groups for system-level tax groups
-- 2. Creates the SERVICE_CHARGE_GST tax group (dedicated for service charge GST)
-- 3. Ensures service charge GST is always declared, never inferred

BEGIN;

-- ============================================================================
-- ADD CODE FIELD TO TAX_GROUPS TABLE
-- ============================================================================
-- Code field is used for system-level tax groups (like SERVICE_CHARGE_GST)
-- It's optional (NULL allowed) for backward compatibility with existing tax groups

ALTER TABLE tax_groups
ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE;

-- Create index for fast code lookups
CREATE INDEX IF NOT EXISTS idx_tax_groups_code ON tax_groups(code) WHERE code IS NOT NULL;

-- Add comment explaining code field
COMMENT ON COLUMN tax_groups.code IS 
    'System-level code for tax groups (e.g., SERVICE_CHARGE_GST). NULL for user-created tax groups.';

-- ============================================================================
-- CREATE SERVICE_CHARGE_GST TAX GROUP
-- ============================================================================
-- This is a dedicated tax group for service charge GST calculation.
-- Service charge is a separate service and must have its own declared GST tax group.
-- This ensures audit-safety and India-compliance.

INSERT INTO tax_groups (name, code, total_rate, split_type, is_tax_inclusive, is_active)
VALUES (
    'Service Charge GST',
    'SERVICE_CHARGE_GST',
    18.0,  -- Default 18% GST (owner-configurable)
    'GST_50_50',  -- 50/50 split for CGST/SGST
    false,  -- ALWAYS exclusive (Indian regulation)
    true  -- Active by default
)
ON CONFLICT (code) DO NOTHING;  -- Prevent duplicates if migration runs multiple times

-- Add comment explaining this tax group
COMMENT ON TABLE tax_groups IS 
    'Tax groups table. SERVICE_CHARGE_GST is a system-level tax group for service charge GST calculation.';

COMMIT;

