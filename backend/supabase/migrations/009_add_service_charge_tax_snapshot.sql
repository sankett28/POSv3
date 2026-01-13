-- Migration: Add service charge tax snapshot fields to bills table
-- This migration adds fields to snapshot service charge GST breakdown at bill creation.
-- All values are immutable snapshots for audit compliance.

BEGIN;

-- ============================================================================
-- ADD SERVICE CHARGE TAX SNAPSHOT FIELDS TO BILLS TABLE
-- ============================================================================

-- Service charge tax rate snapshot (GST rate applied on service charge)
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS service_charge_tax_rate_snapshot DECIMAL(5, 2)
    CHECK (service_charge_tax_rate_snapshot IS NULL OR (service_charge_tax_rate_snapshot >= 0 AND service_charge_tax_rate_snapshot <= 100));

-- Service charge tax amount (total GST on service charge)
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS service_charge_tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 
    CHECK (service_charge_tax_amount >= 0);

-- Service charge CGST amount (Central GST on service charge)
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS service_charge_cgst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 
    CHECK (service_charge_cgst_amount >= 0);

-- Service charge SGST amount (State GST on service charge)
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS service_charge_sgst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 
    CHECK (service_charge_sgst_amount >= 0);

-- Add column comments explaining snapshot behavior
COMMENT ON COLUMN bills.service_charge_tax_rate_snapshot IS 
    'GST rate applied on service charge (from SERVICE_CHARGE_GST tax group). Snapshot at bill creation.';
COMMENT ON COLUMN bills.service_charge_tax_amount IS 
    'Total GST amount on service charge. Snapshot at bill creation.';
COMMENT ON COLUMN bills.service_charge_cgst_amount IS 
    'CGST amount on service charge. Snapshot at bill creation.';
COMMENT ON COLUMN bills.service_charge_sgst_amount IS 
    'SGST amount on service charge. Snapshot at bill creation.';

-- Add constraint: service_charge_tax_amount should equal cgst + sgst
ALTER TABLE bills
ADD CONSTRAINT bills_service_charge_tax_consistency CHECK (
    ABS(service_charge_tax_amount - (service_charge_cgst_amount + service_charge_sgst_amount)) < 0.01
);

COMMIT;

