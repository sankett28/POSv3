-- Migration: Add Service Charge to Bills
-- This migration adds voluntary service charge support to the billing system.
-- Service charge is:
-- 1. Calculated on TAXABLE AMOUNT (subtotal, before GST)
-- 2. Has GST applied on it (GST applies on subtotal + service charge)
-- 3. Bill-level only (not item-level)
-- 4. Snapshotted at bill creation (never recalculated)
-- 5. Can be removed per bill (service_charge_enabled = false)

BEGIN;

-- ============================================================================
-- ADD SERVICE CHARGE FIELDS TO BILLS TABLE
-- ============================================================================

-- Add service_charge_enabled: Whether service charge was applied to this bill
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS service_charge_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Add service_charge_rate: Service charge rate percentage (0-20%)
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS service_charge_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00 
    CHECK (service_charge_rate >= 0 AND service_charge_rate <= 20);

-- Add service_charge_amount: Service charge amount calculated on subtotal
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS service_charge_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 
    CHECK (service_charge_amount >= 0);

-- Add column comments explaining snapshot behavior
COMMENT ON COLUMN bills.service_charge_enabled IS 
    'Whether service charge was applied to this bill. Snapshot at bill creation.';
COMMENT ON COLUMN bills.service_charge_rate IS 
    'Service charge rate percentage (0-20%). Snapshot at bill creation.';
COMMENT ON COLUMN bills.service_charge_amount IS 
    'Service charge amount calculated on subtotal. Snapshot at bill creation. GST is applied on (subtotal + service_charge_amount).';

-- ============================================================================
-- UPDATE TOTAL CONSISTENCY CONSTRAINT
-- ============================================================================
-- Update the constraint to include service charge in the total calculation
-- New formula: total_amount = subtotal + service_charge_amount + tax_amount

ALTER TABLE bills
DROP CONSTRAINT IF EXISTS bills_total_consistency;

ALTER TABLE bills
ADD CONSTRAINT bills_total_consistency CHECK (
    ABS(total_amount - (subtotal + service_charge_amount + tax_amount)) < 0.01
);

-- Note: Existing bills will have default values:
-- - service_charge_enabled = TRUE
-- - service_charge_rate = 0.00
-- - service_charge_amount = 0.00
-- This ensures historical bills remain unchanged and backward compatible.

COMMIT;

